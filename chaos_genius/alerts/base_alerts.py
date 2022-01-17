import logging
import os
import io
from typing import Optional, List, Tuple
import pandas as pd
import datetime
from datetime import date
from copy import deepcopy
from chaos_genius.utils.io_helper import is_file_exists
from chaos_genius.databases.models.data_source_model import DataSource
from chaos_genius.databases.models.alert_model import Alert
from chaos_genius.databases.models.anomaly_data_model import AnomalyDataOutput
from chaos_genius.databases.models.triggered_alerts_model import TriggeredAlerts
from chaos_genius.databases.models.kpi_model import Kpi

# from chaos_genius.connectors.base_connector import get_df_from_db_uri
from chaos_genius.connectors import get_sqla_db_conn
from chaos_genius.alerts.email import send_static_alert_email
from chaos_genius.alerts.slack import anomaly_alert_slack_formatted, event_alert_slack
from chaos_genius.alerts.anomaly_alert_config import (
    ANOMALY_TABLE_COLUMN_NAMES_MAPPER,
    IGNORE_COLUMNS_ANOMALY_TABLE,
    ANOMALY_ALERT_COLUMN_NAMES,
    ANOMALY_TABLE_COLUMNS_HOLDING_FLOATS
)
from chaos_genius.alerts.triggered_alert_helpers import set_alert_metadata
from chaos_genius.core.rca.rca_utils.string_helpers import convert_query_string_to_user_string
from jinja2 import Environment, FileSystemLoader, select_autoescape
from tabulate import tabulate

logger = logging.getLogger()

FREQUENCY_DICT = {
    "weekly": datetime.timedelta(days=7, hours=0, minutes=0),
    "daily": datetime.timedelta(days=1, hours=0, minutes=0),
    "hourly": datetime.timedelta(days=0, hours=1, minutes=0),
    "every_15_minute": datetime.timedelta(days=0, hours=0, minutes=15),
    "every_minute": datetime.timedelta(days=0, hours=0, minutes=1),
}


class StaticEventAlertController:
    """This is the controller class for the static events

    Raises:
        Exception: Raise if the alert if not found
        Exception: Raise if alert settings isn't configured properly

    Returns:
        object: object of the class
    """

    PICKLE_DIR = ".alert"

    def __init__(self, alert_info: dict, data_source_info: dict):
        """Initiate the static event controller class

        Args:
            alert_info (dict): alert information
            data_source_info (dict): data_source_info for the corresponding data connection

        Raises:
            Exception: Raise if Alert id not found
        """
        self.alert_info = alert_info
        self.data_source_info = data_source_info
        self.alert_id = alert_info["id"]
        if not self.alert_id:
            raise Exception("Alert ID is required")
        self.pickle_file_path = f"{self.PICKLE_DIR}/{self.alert_id}.pkl"
        self.load_pickled_df()
        self.load_query_data()

    def load_pickled_df(self):
        """Load the pickled dataframe of the given alert id"""
        os.makedirs(f"./{self.PICKLE_DIR}", exist_ok=True)
        full_path = is_file_exists(self.pickle_file_path)
        if full_path:
            self.unpickled_df = pd.read_pickle(full_path)
        else:
            self.unpickled_df = pd.DataFrame()

    def pickle_df(self):
        """Pickle and save the current dataframe state"""
        pickle_path = f"./{self.pickle_file_path}"
        self.query_df.to_pickle(pickle_path)

    def load_query_data(self):
        """Load the query data from the data source"""
        db_connection = get_sqla_db_conn(data_source_info=self.data_source_info)
        self.query_df = db_connection.run_query(self.alert_info["alert_query"])
        # self.query_df = get_df_from_db_uri(self.data_source_info, self.alert_info['alert_query'])

    def check_and_prepare_alert(self):
        """Check for the alert and trigger the appropriate trigger

        Raises:
            Exception: Raise if the alert settings not found
        """

        alert: Optional[Alert] = Alert.get_by_id(self.alert_info["id"])
        curr_date_time = datetime.datetime.now()
        alert.update(commit=True, last_alerted=curr_date_time)

        change_df = pd.DataFrame()
        if self.alert_info["alert_settings"] == "new_entry_alert":
            change_df = self.test_new_entry(self.query_df, self.unpickled_df)
        elif self.alert_info["alert_settings"] == "change_alert":
            change_df = self.test_change_entry(self.query_df, self.unpickled_df)
        elif self.alert_info["alert_settings"] == "always_alert":
            change_df = self.query_df
        elif self.alert_info["alert_settings"] == "missing_data_alert":
            change_df = self.query_df
        else:
            raise Exception("Alert Setting isn't configured")

        if (
            not change_df.empty
            and self.alert_info["alert_settings"] != "missing_data_alert"
        ):
            if self.alert_info["alert_channel"] == "email":
                self.prepare_email(change_df)
            elif self.alert_info["alert_channel"] == "slack":
                self.send_slack_event_alert(change_df)

        # send the missing data alert with different template
        if (
            change_df.empty
            and self.alert_info["alert_settings"] == "missing_data_alert"
        ):
            if self.alert_info["alert_channel"] == "email":
                self.send_missing_data_email_alert()
            elif self.alert_info["alert_channel"] == "slack":
                self.send_slack_event_alert(change_df)

        self.pickle_df()

    @staticmethod
    def test_new_entry(new_df, old_df):
        """Test if some new record is added in the given table/query

        Args:
            new_df (DataFrame): Latest query data fetched from the linked database
            old_df (DataFrame): Last state of the table/query stored in the pickled dataframe

        Returns:
            DataFrame: Return the dataframe only with the new entry
        """
        if old_df.empty:
            return new_df
        change = new_df.merge(old_df, how="outer", indicator=True).loc[
            lambda x: x["_merge"] == "left_only"
        ]
        return change.drop(columns=["_merge"])

    @staticmethod
    def test_change_entry(new_df, old_df):
        """Test if some new record is added or deleted in the given table/query

        Args:
            new_df (DataFrame): Latest query data fetched from the linked database
            old_df (DataFrame): Last state of the table/query stored in the pickled dataframe

        Returns:
            DataFrame: Return the dataframe only with the changes
        """
        if old_df.empty:
            new_df["change"] = "added"
            return new_df
        added_rows = new_df.merge(old_df, how="outer", indicator=True).loc[
            lambda x: x["_merge"] == "left_only"
        ]
        added_rows["change"] = "added"
        deleted_rows = new_df.merge(old_df, how="outer", indicator=True).loc[
            lambda x: x["_merge"] == "right_only"
        ]
        deleted_rows["change"] = "deleted"
        return pd.concat([added_rows, deleted_rows])

    def prepare_email(self, change_df):
        """Prepare the email subject, body and CSV attachment for trigger

        Args:
            change_df (DataFrame): Dataframe with only the rows with change
        """

        alert_channel_conf = self.alert_info["alert_channel_conf"]

        if type(alert_channel_conf) != dict:
            logger.debug(
                f"The alert channel configuration is incorrect for Alert ID - {self.alert_info['id']}"
            )
            return False

        recipient_emails = alert_channel_conf.get("email", [])

        if recipient_emails:
            subject = f"{self.alert_info['alert_name']} - Chaos Genius Event Alert❗"
            message = self.alert_info["alert_message"]
            files = []
            if not change_df.empty:
                file_detail = {}
                file_detail["fname"] = "data.csv"
                with io.StringIO() as buffer:
                    change_df.to_csv(buffer, index=False)
                    file_detail["fdata"] = buffer.getvalue()
                files = [file_detail]

            column_names = list(change_df.columns)[:4]
            add_df = []
            del_df = []
            normal_df = []

            if self.alert_info["alert_settings"] == "new_entry_alert":
                normal_df = list(change_df.head().T.to_dict().values())
            elif self.alert_info["alert_settings"] == "change_alert":
                del_df = list(
                    change_df[change_df["change"] == "deleted"]
                    .head()
                    .T.to_dict()
                    .values()
                )
                add_df = list(
                    change_df[change_df["change"] == "added"]
                    .head()
                    .T.to_dict()
                    .values()
                )
            elif self.alert_info["alert_settings"] == "always_alert":
                normal_df = list(change_df.head().T.to_dict().values())

            test = self.send_template_email(
                "email_event_alert.html",
                recipient_emails,
                subject,
                files,
                add_df=add_df,
                del_df=del_df,
                normal_df=normal_df,
                column_names=column_names,
                alert_message=message,
                alert_frequency=self.alert_info["alert_frequency"].capitalize(),
                alert_name=self.alert_info["alert_name"],
                preview_text="Static Event Alert",
            )
            return test
        else:
            logger.info(
                f"No email recipients available for Alert ID - {self.alert_info['id']}"
            )
            return False

    def send_template_email(self, template, recipient_emails, subject, files, **kwargs):
        """Sends an email using a template."""

        path = os.path.join(os.path.dirname(__file__), "email_templates")
        env = Environment(
            loader=FileSystemLoader(path), autoescape=select_autoescape(["html", "xml"])
        )

        template = env.get_template(template)
        test = send_static_alert_email(
            recipient_emails, subject, template.render(**kwargs), self.alert_info, files
        )

        if test == True:
            logger.info(
                f"The email for Alert ID - {self.alert_info['id']} was successfully sent"
            )
        else:
            logger.debug(
                f"The email for Alert ID - {self.alert_info['id']} was not sent"
            )
        return test

    def send_slack_event_alert(self, change_df):
        """Sends a slack alert"""

        alert_name = self.alert_info["alert_name"]
        alert_frequency = self.alert_info["alert_frequency"]
        alert_message = self.alert_info["alert_message"]
        alert_overview = ""

        if self.alert_info["alert_settings"] == "new_entry_alert":
            alert_overview = f"Number of rows added: {change_df.shape[0]}"
        elif self.alert_info["alert_settings"] == "change_alert":
            added_rows = change_df[change_df.change == "added"].shape[0]
            deleted_rows = change_df[change_df.change == "deleted"].shape[0]
            alert_overview = f"Number of rows added: {added_rows} and Number of rows deleted: {deleted_rows}"
        elif self.alert_info["alert_settings"] == "always_alert":
            alert_overview = f"Number of rows present: {change_df.shape[0]}"

        test = event_alert_slack(
            alert_name, alert_frequency, alert_message, alert_overview
        )

        if test == "ok":
            logger.info(
                f"The slack alert for Alert ID - {self.alert_info['id']} was successfully sent"
            )
        else:
            logger.info(
                f"The slack alert for Alert ID - {self.alert_info['id']} has not been sent"
            )

        message = f"Status for KPI ID - {self.alert_info['kpi']}: {test}"
        return message

    def send_missing_data_email_alert(self):
        alert_channel_conf = self.alert_info["alert_channel_conf"]
        recipient_emails = alert_channel_conf.get("email", [])
        subject = f"{self.alert_info['alert_name']} - Chaos Genius Event Alert❗"
        if not recipient_emails:
            return True
        self.send_template_email(
            template="missing_data_alert.html",
            recipient_emails=recipient_emails,
            subject=subject,
            files=[],
            alert_message=self.alert_info.get("alert_message", ""),
            alert_frequency=self.alert_info.get("alert_frequency", "").capitalize(),
            alert_name=self.alert_info.get("alert_name", ""),
            preview_text="Missing Data Alert",
        )

    def send_missing_data_slack_alert(self):
        test = event_alert_slack(
            alert_name=self.alert_info["alert_name"],
            alert_frequency=self.alert_info["alert_frequency"],
            alert_message=self.alert_info["alert_message"],
            alert_overview=''
        )

        if test == "ok":
            logger.info(
                f"The slack alert for Alert ID - {self.alert_info['id']} was successfully sent"
            )
        else:
            logger.info(
                f"The slack alert for Alert ID - {self.alert_info['id']} has not been sent"
            )

        message = f"Status for KPI ID - {self.alert_info['kpi']}: {test}"
        return message

class AnomalyAlertController:
    def __init__(self, alert_info, anomaly_end_date=None):
        self.alert_info = alert_info
        self.now = datetime.datetime.now()
        if anomaly_end_date:
            self.anomaly_end_date = anomaly_end_date
        else:
            self.anomaly_end_date = self.now - datetime.timedelta(days=3)

    def check_and_prepare_alert(self):
        kpi_id = self.alert_info["kpi"]
        alert_id = self.alert_info["id"]
        alert: Optional[Alert] = Alert.get_by_id(self.alert_info["id"])
        if alert is None:
            logger.info(f"Could not find alert by ID: {self.alert_info['id']}")
            return False

        check_time = FREQUENCY_DICT[self.alert_info["alert_frequency"]]
        fuzzy_interval = datetime.timedelta(
            minutes=30
        )  # this represents the upper bound of the time interval that an alert can fall short of the check_time hours before which it can be sent again
        if (
            alert.last_alerted is not None
            and alert.last_alerted > (self.now - check_time)
            and alert.last_alerted > ((self.now + fuzzy_interval) - check_time)
        ):
            # this check works in three steps
            # 1) Verify if the last alerted value of an alert is not None
            # 2) Verify if less than check_time hours have elapsed since the last alert was sent
            # 3) If less than check_time hours have elapsed, check if the additonal time to complete check_time hours is greater than fuzzy_interval
            logger.info(
                f"Skipping alert with ID {self.alert_info['id']} since it was already run"
            )
            return True
        alert.update(commit=True, last_alerted=self.now)

        # TODO: Add the series type filter for query optimisation
        anomaly_data = AnomalyDataOutput.query.filter(
                                            AnomalyDataOutput.kpi_id == kpi_id,
                                            AnomalyDataOutput.anomaly_type.in_(["overall", "subdim"]),
                                            AnomalyDataOutput.is_anomaly.in_([1,-1]),
                                            AnomalyDataOutput.data_datetime >= self.anomaly_end_date,
                                            AnomalyDataOutput.severity >= self.alert_info["severity_cutoff_score"]
                                        ).all()

        if len(anomaly_data) == 0:
            logger.info(f"No anomaly exists (Alert ID - {alert_id})")
            return True

        logger.info(f"Alert ID {alert_id} is sent to the respective alert channel")

        if self.alert_info["alert_channel"] == "email":
            outcome, alert_data = self.send_alert_email(anomaly_data)
        elif self.alert_info["alert_channel"] == "slack":
            outcome, alert_data =  self.send_slack_alert(anomaly_data)
        
        if alert_data is None:
            return outcome

        triggered_alert = TriggeredAlerts(
                            alert_conf_id=self.alert_info["id"],
                            alert_type="Anomaly Alert",
                            is_sent=outcome,
                            created_at=datetime.datetime.now()       
                        )
        alert_metadata = {
                            "alert_frequency": self.alert_info["alert_frequency"],
                            "alert_data": alert_data,
                            "end_date": self.anomaly_end_date,
                            "severity_cutoff_score": self.alert_info["severity_cutoff_score"],
                            "kpi": self.alert_info["kpi"],
                            "alert_channel": self.alert_info["alert_channel"],
                            "alert_channel_conf": self.alert_info["alert_channel_conf"]
                        }    

        set_alert_metadata(triggered_alert, alert_metadata)    
        return outcome

    def get_overall_subdim_data(self, anomaly_data):

        anomaly_data = [anomaly_point.as_dict for anomaly_point in anomaly_data]
        anomaly_data = [{key: value for key, value in anomaly_point.items() if key not in IGNORE_COLUMNS_ANOMALY_TABLE} for anomaly_point in anomaly_data]

        for anomaly_point in anomaly_data:
            anomaly_point["series_type"] = "Overall KPI" if anomaly_point.get("anomaly_type") == "overall" else anomaly_point["series_type"]
            for key, value in anomaly_point.items():
                if key in ANOMALY_TABLE_COLUMNS_HOLDING_FLOATS:
                    anomaly_point[key] = round(value, 2)
            anomaly_point["series_type"] = convert_query_string_to_user_string(anomaly_point["series_type"])

        overall_data = [anomaly_point for anomaly_point in anomaly_data if anomaly_point.get("anomaly_type") == "overall"]
        subdim_data = [anomaly_point for anomaly_point in anomaly_data if anomaly_point.get("anomaly_type") == "subdim"]
        overall_data.sort(key=lambda anomaly: anomaly.get("severity"), reverse=True)
        subdim_data.sort(key=lambda anomaly: anomaly.get("severity"), reverse=True)

        return overall_data, subdim_data

    def format_alert_data(self, data):
        for anomaly_point in data:
            lower = anomaly_point.get("yhat_lower")
            upper = anomaly_point.get("yhat_upper")
            anomaly_point["Expected Value"] = f"{lower} - {upper}"
            for key, value in ANOMALY_TABLE_COLUMN_NAMES_MAPPER.items():
                anomaly_point[value] = anomaly_point[key]

    def send_alert_email(self, anomaly_data):

        alert_channel_conf = self.alert_info["alert_channel_conf"]

        if type(alert_channel_conf) != dict:
            logger.info(
                f"The alert channel configuration is incorrect for Alert ID - {self.alert_info['id']}"
            )
            return False

        recipient_emails = alert_channel_conf.get("email", [])

        if recipient_emails:
            subject = f"{self.alert_info['alert_name']} - Chaos Genius Alert❗"
            alert_message = self.alert_info["alert_message"]

            kpi_id = self.alert_info["kpi"]
            kpi_obj = Kpi.query.filter(Kpi.active == True, Kpi.id == kpi_id).first()

            if kpi_obj is None:
                logger.info(f"No KPI exists for Alert ID - {self.alert_info['id']}")
                return False

            kpi_name = getattr(kpi_obj, 'name')
            
            overall_data, subdim_data = self.get_overall_subdim_data(anomaly_data)

            overall_data_email_body = deepcopy([overall_data[0]]) if len(overall_data) > 0 else []
            len_subdim = min(10, len(subdim_data))
            subdim_data_email_body = deepcopy(subdim_data[0:len_subdim]) if len(subdim_data) > 0 else []

            overall_data.extend(subdim_data)
            overall_data_email_body.extend(subdim_data_email_body)

            self.format_alert_data(overall_data)
            self.format_alert_data(overall_data_email_body)

            column_names = ANOMALY_ALERT_COLUMN_NAMES
            anomaly_data = pd.DataFrame(overall_data, columns=column_names)
            files = []
            if not anomaly_data.empty:
                file_detail = {}
                file_detail["fname"] = "data.csv"
                with io.StringIO() as buffer:
                    anomaly_data.to_csv(buffer, encoding="utf-8")
                    file_detail["fdata"] = buffer.getvalue()
                files = [file_detail]

            test = self.send_template_email('email_alert.html', 
                                            recipient_emails, 
                                            subject,
                                            files,
                                            column_names=column_names,
                                            data=overall_data_email_body,
                                            alert_message=alert_message,
                                            kpi_name = kpi_name,
                                            alert_frequency=self.alert_info['alert_frequency'].capitalize(),
                                            preview_text="Anomaly Alert",
                                            alert_name=self.alert_info.get("alert_name")
                                        )
            logger.info(f"Status for Alert ID - {self.alert_info['id']} : {test}")
            return test, overall_data
        else:
            logger.info(
                f"No receipent email available (Alert ID - {self.alert_info['id']})"
            )
            return False, None

    def send_template_email(self, template, recipient_emails, subject, files, **kwargs):
        """Sends an email using a template."""

        path = os.path.join(os.path.dirname(__file__), "email_templates")
        env = Environment(
            loader=FileSystemLoader(path), autoescape=select_autoescape(["html", "xml"])
        )

        template = env.get_template(template)
        test = send_static_alert_email(recipient_emails, subject, template.render(**kwargs), self.alert_info, files)

        if test == True:
            logger.info(
                f"The email for Alert ID - {self.alert_info['id']} was successfully sent"
            )
        else:
            logger.info(
                f"The email for Alert ID - {self.alert_info['id']} has not been sent"
            )

        return test

    def send_slack_alert(self, anomaly_data):
        kpi_id = self.alert_info["kpi"]
        kpi_obj = Kpi.query.filter(Kpi.active == True, Kpi.id == kpi_id).first()

        if kpi_obj is None:
            logger.info(f"No KPI exists for Alert ID - {self.alert_info['id']}")
            return False

        data_source_obj = DataSource.query.filter(
                                            DataSource.id == self.alert_info["data_source"],
                                            DataSource.active == True
                                        ).first()
        
        if data_source_obj is None:
            logger.info(f"The data source provided for Alert ID - {self.alert_info['id']} does not exist")
            return False

        kpi_name = getattr(kpi_obj, "name")
        data_source_name = getattr(data_source_obj, "name")
        alert_name = self.alert_info.get("alert_name")

        overall_data, subdim_data = self.get_overall_subdim_data(anomaly_data)

        overall_data_alert_body = deepcopy([overall_data[0]]) if len(overall_data) > 0 else []
        len_subdim = min(10, len(subdim_data))
        subdim_data_alert_body = deepcopy(subdim_data[0:len_subdim]) if len(subdim_data) > 0 else []

        overall_data_alert_body.extend(subdim_data_alert_body)

        self.format_alert_data(overall_data_alert_body)

        column_names = ANOMALY_ALERT_COLUMN_NAMES
        anomaly_data = pd.DataFrame(overall_data_alert_body, columns=column_names)
        table_data = tabulate(anomaly_data, tablefmt="fancy_grid", headers="keys")
        table_data = "```" + table_data + "```"
        test = anomaly_alert_slack_formatted(
                alert_name,
                kpi_name,
                data_source_name,
                table_data
            )

        if test == "ok":
            logger.info(
                f"The slack alert for Alert ID - {self.alert_info['id']} was successfully sent"
            )
        else:
            logger.info(
                f"The slack alert for Alert ID - {self.alert_info['id']} has not been sent"
            )

        message = f"Status for KPI ID - {self.alert_info['kpi']}: {test}"
        return message


class StaticKpiAlertController:
    def __init__(self, alert_info):
        self.alert_info = alert_info

    def check_and_prepare_alert(self):
        pass


def check_and_trigger_alert(alert_id):
    """Check the alert and trigger the notification if found

    Args:
        alert_id (int): alert id

    Raises:
        Exception: Raise if the alert record not found

    Returns:
        bool: status of the alert trigger
    """
    alert_info = Alert.get_by_id(alert_id)
    if not alert_info:
        raise Exception("Alert doesn't exist")

    if not (alert_info.active and alert_info.alert_status):
        print("Alert isn't active. Please activate the alert.")
        return True

    if alert_info.alert_type == "Event Alert":

        data_source_id = alert_info.data_source
        data_source_obj = DataSource.get_by_id(data_source_id)
        static_alert_obj = StaticEventAlertController(
            alert_info.as_dict, data_source_obj.as_dict
        )
        static_alert_obj.check_and_prepare_alert()
    elif (
        alert_info.alert_type == "KPI Alert" and alert_info.kpi_alert_type == "Anomaly"
    ):
        anomaly_obj = AnomalyAlertController(alert_info.as_dict)
        return anomaly_obj.check_and_prepare_alert()
    elif alert_info.alert_type == "KPI Alert" and alert_info.kpi_alert_type == "Static":
        static_kpi_alert = StaticKpiAlertController(alert_info.as_dict)

    return True


def trigger_anomaly_alerts_for_kpi(
    kpi_obj: Kpi, end_date: date
) -> Tuple[List[int], List[int]]:
    """Triggers anomaly alerts starting from end_date.

    Args:
        kpi_obj (Kpi): Object of kpi for which alerts are to be triggered
        end_date (dateimte.datetime): Datetime object containing the upper bound of anomaly date values

    Returns:
        List[int]: List of alert IDs for which alert messages were successfully sent
        List[int]: List of alert IDs for which alert failed
    """
    success_alerts = []
    errors = []
    alerts = Alert.query.filter(
        Alert.kpi == kpi_obj.id, Alert.active == True, Alert.alert_status == True
    ).all()
    for alert in alerts:
        try:
            anomaly_obj = AnomalyAlertController(
                alert.as_dict, anomaly_end_date=end_date
            )
            anomaly_obj.check_and_prepare_alert()
            success_alerts.append(alert.id)
        except Exception as e:
            logger.error(f"Error running alert for Alert ID: {alert.id}", exc_info=e)
            errors.append(alert.id)
    return success_alerts, errors
