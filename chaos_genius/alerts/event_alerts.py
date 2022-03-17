import datetime
import io
import logging
import os
from typing import Optional

import pandas as pd
from jinja2 import Environment, FileSystemLoader, select_autoescape

from chaos_genius.alerts.email import send_static_alert_email
from chaos_genius.alerts.slack import event_alert_slack

# from chaos_genius.connectors.base_connector import get_df_from_db_uri
from chaos_genius.connectors import get_sqla_db_conn
from chaos_genius.databases.models.alert_model import Alert
from chaos_genius.databases.models.triggered_alerts_model import TriggeredAlerts
from chaos_genius.utils.io_helper import is_file_exists

logger = logging.getLogger()


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

        outcome = False
        alert_data = None

        if (
            not change_df.empty
            and self.alert_info["alert_settings"] != "missing_data_alert"
        ):
            if self.alert_info["alert_channel"] == "email":
                outcome, alert_data = self.prepare_email(change_df)
            elif self.alert_info["alert_channel"] == "slack":
                outcome, alert_data = self.send_slack_event_alert(change_df)

        # send the missing data alert with different template
        if (
            change_df.empty
            and self.alert_info["alert_settings"] == "missing_data_alert"
        ):
            if self.alert_info["alert_channel"] == "email":
                outcome, alert_data = self.send_missing_data_email_alert()
            elif self.alert_info["alert_channel"] == "slack":
                outcome, alert_data = self.send_slack_event_alert(change_df)

        self.pickle_df()

        if alert_data is None:
            return outcome

        alert_metadata = {
            "alert_frequency": self.alert_info["alert_frequency"],
            "alert_data": alert_data,
        }

        triggered_alert = TriggeredAlerts(
            alert_conf_id=self.alert_info["id"],
            alert_type="Event Alert",
            is_sent=outcome,
            created_at=datetime.datetime.now(),
            alert_metadata=alert_metadata,
        )

        triggered_alert.update(commit=True)
        return outcome

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

            alert_data = list(change_df.T.astype(str).to_dict().values())
            return test, alert_data
        else:
            logger.info(
                f"No email recipients available for Alert ID - {self.alert_info['id']}"
            )
            return False, None

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
        logger.info(message)

        test = test == "ok"
        alert_data = list(change_df.T.astype(str).to_dict().values())
        return test, alert_data

    def send_missing_data_email_alert(self):
        alert_channel_conf = self.alert_info["alert_channel_conf"]
        recipient_emails = alert_channel_conf.get("email", [])
        subject = f"{self.alert_info['alert_name']} - Chaos Genius Event Alert❗"
        if not recipient_emails:
            return False, None
        test = self.send_template_email(
            template="missing_data_alert.html",
            recipient_emails=recipient_emails,
            subject=subject,
            files=[],
            alert_message=self.alert_info.get("alert_message", ""),
            alert_frequency=self.alert_info.get("alert_frequency", "").capitalize(),
            alert_name=self.alert_info.get("alert_name", ""),
            preview_text="Missing Data Alert",
        )

        return test, []

    def send_missing_data_slack_alert(self):
        test = event_alert_slack(
            alert_name=self.alert_info["alert_name"],
            alert_frequency=self.alert_info["alert_frequency"],
            alert_message=self.alert_info["alert_message"],
            alert_overview="",
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
        logger.info(message)

        test = test == "ok"
        return test, []
