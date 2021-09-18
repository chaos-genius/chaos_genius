import os
import io
import json
import pickle
import pandas as pd
import datetime
from chaos_genius.utils.io_helper import is_file_exists
from chaos_genius.databases.models.data_source_model import DataSource
from chaos_genius.databases.models.alert_model import Alert
from chaos_genius.databases.models.anomaly_data_model import AnomalyDataOutput
from chaos_genius.connectors.base_connector import get_df_from_db_uri
from chaos_genius.alerts.email import send_static_alert_email


class StaticEventAlertController:
    """This is the controller class for the static events

    Raises:
        Exception: Raise if the alert if not found
        Exception: Raise if alert settings isn't configured properly

    Returns:
        object: object of the class
    """
    PICKLE_DIR = '.alert'

    def __init__(self, alert_info: dict, db_uri: str):
        """Initiate the static event controller class

        Args:
            alert_info (dict): alert information
            db_uri (str): db_uri for the corresponding data connection

        Raises:
            Exception: Raise if Alert id not found
        """
        self.alert_info = alert_info
        self.db_uri = db_uri
        self.alert_id = alert_info["id"]
        if not self.alert_id:
            raise Exception('Alert ID is required')
        self.pickle_file_path = f"{self.PICKLE_DIR}/{self.alert_id}.pkl"
        self.load_pickled_df()
        self.load_query_data()

    def load_pickled_df(self):
        """Load the pickled dataframe of the given alert id
        """
        status = os.makedirs(f"./{self.PICKLE_DIR}", exist_ok=True)
        full_path = is_file_exists(self.pickle_file_path)
        if full_path:
            self.unpickled_df = pd.read_pickle(full_path)
        else:
            self.unpickled_df = pd.DataFrame()

    def pickle_df(self):
        """Pickle and save the current dataframe state
        """
        pickle_path = f"./{self.pickle_file_path}"
        self.query_df.to_pickle(pickle_path)

    def load_query_data(self):
        """Load the query data from the data source
        """
        self.query_df = get_df_from_db_uri(self.db_uri, self.alert_info['alert_query'])

    def check_and_prepare_alert(self):
        """Check for the alert and trigger the appropriate trigger

        Raises:
            Exception: Raise if the alert settings not found
        """
        change_df = pd.DataFrame()
        if self.alert_info["alert_settings"] == "new_entry_alert":
            change_df = self.test_new_entry(self.query_df, self.unpickled_df)
        elif self.alert_info["alert_settings"] == "change_alert":
            change_df = self.test_change_entry(self.query_df, self.unpickled_df)
        elif self.alert_info["alert_settings"] == "always_alert":
            change_df = self.query_df
        else:
            raise Exception("Alert Setting isn't configured")

        if not change_df.empty:
            if self.alert_info["alert_channel"] == "email":
                self.prepare_email(change_df)
            elif self.alert_info["alert_channel"] == "slack":
                pass

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
        change = new_df.merge(old_df, how='outer', indicator=True).loc[lambda x : x['_merge']=='left_only']
        return change

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
        added_rows = new_df.merge(old_df, how='outer', indicator=True).loc[lambda x : x['_merge']=='left_only']
        added_rows["change"] = "added"
        deleted_rows = new_df.merge(old_df, how='outer', indicator=True).loc[lambda x : x['_merge']=='right_only']
        deleted_rows["change"] = "deleted"
        return pd.concat([added_rows, deleted_rows])

    def prepare_email(self, change_df):
        """Prepare the email subject, body and CSV attachment for trigger

        Args:
            change_df (DataFrame): Dataframe with only the rows with change
        """
        recipient_emails = self.alert_info["alert_channel_conf"].get("email", [])
        if recipient_emails:
            subject = f"Static Alert Notification: {self.alert_info['alert_name']} [ID - {self.alert_info['id']}] [Type - {self.alert_info['alert_settings']}]"
            message = self.alert_info["alert_message"]
            files = []
            if not change_df.empty:
                file_detail = {}
                file_detail["fname"] = "data.csv"
                with io.StringIO() as buffer:
                    change_df.to_csv(buffer)
                    file_detail["fdata"] = buffer.getvalue()
                files = [file_detail]
            test = send_static_alert_email(recipient_emails, subject, message, self.alert_info, files)


class AnomalyAlertController:
    def __init__(self, alert_info):
        self.alert_info = alert_info

    def check_and_prepare_alert(self):
        
        kpi_id = self.alert_info["kpi"]

        curr_date_time = datetime.datetime.now()

        hours, minutes = smome_func() #some random function

        lower_limit_dt = curr_date_time - datetime.timedelta(hours = hours, minutes = minutes) #TODO - the delta needs to be variable

        anomaly_data = AnomalyDataOutput.query.filter(
                                            AnomalyDataOutput.kpi_id == kpi_id,
                                            AnomalyDataOutput.anomaly_type == 'overall',
                                            AnomalyDataOutput.is_anomaly == 1,
                                            AnomalyDataOutput.data_datetime >= lower_limit_dt
                                        ).all()

        if len(anomaly_data) == 0:
            return f'No anomaly exists (KPI ID - {kpi_id})'

        anomaly_data.sort(key = lambda anomaly: getattr(anomaly, 'severity'), reverse = True)
        anomaly = anomaly_data[0]
        
        if getattr(anomaly, 'severity') < self.alert_info['severity_cutoff_score']:
            return f"The anomaliy's severity score is below the threshold (KPI ID - {kpi_id})"

        return self.send_alert_email(anomaly)
        
    def send_alert_email(self, anomaly):

        recipient_emails = self.alert_info["alert_channel_conf"].get("email", [])
        
        if recipient_emails:

            subject = f"KPI Alert Notification: {self.alert_info['alert_name']} [ID - {self.alert_info['id']}] [KPI ID - {self.alert_info['kpi']}]"
            message = self.alert_info["alert_message"]
            message = message + '\n' + f"The highest value {round(getattr(anomaly, 'y'), 1)} Occurred at {str(getattr(anomaly, 'data_datetime'))}"
            message = message + '\n' + f"The expected range is {round(getattr(anomaly, 'yhat_lower'), 2)} to {round(getattr(anomaly, 'yhat_upper'), 2)}"
            message = message + '\n' + f"The severity value of this anomaly was {round(getattr(anomaly, 'severity'), 2)}"
            test = send_static_alert_email(recipient_emails, subject, message, self.alert_info)

            return f"Status for KPI ID - {getattr(anomaly, 'kpi_id')} : {test}"
        else:

            return f"No receipent email available (KPI ID - {getattr(anomaly, 'kpi_id')})"


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

    if alert_info.alert_type == "Event Alert":
        data_source_id = alert_info.data_source
        data_source_obj = DataSource.get_by_id(data_source_id)
        db_uri = data_source_obj.db_uri
        static_alert_obj = StaticEventAlertController(alert_info.as_dict, db_uri)
        static_alert_obj.check_and_prepare_alert()
    elif alert_info.alert_type == "KPI Alert" and alert_info.kpi_alert_type == "Anomaly":
        anomaly_obj = AnomalyAlertController(alert_info.as_dict)
        return anomaly_obj.check_and_prepare_alert()
    elif alert_info.alert_type == "KPI Alert" and alert_info.kpi_alert_type == "Static":
        static_kpi_alert = StaticKpiAlertController(alert_info.as_dict)
    
    return True
