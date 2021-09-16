import io
import json
import pickle
import pandas as pd
from chaos_genius.utils.io_helper import is_file_exists
from chaos_genius.databases.models.data_source_model import DataSource
from chaos_genius.databases.models.alert_model import Alert
from chaos_genius.connectors.base_connector import get_df_from_db_uri
from chaos_genius.alerts.email import send_static_alert_email



class StaticEventAlertController:
    PICKLE_DIR = '.alert'
    def __init__(self, alert_info: dict, db_uri: str):
        self.alert_info = alert_info
        self.db_uri = db_uri
        self.alert_id = alert_info["id"]
        if not self.alert_id:
            raise Exception('Alert ID is required')
        self.pickle_file_path = f"{self.PICKLE_DIR}/{self.alert_id}.pkl"
        self.load_pickled_df()
        self.load_query_data()

    def load_pickled_df(self):
        full_path = is_file_exists(self.pickle_file_path)
        if full_path:
            self.unpickled_df = pd.read_pickle(full_path)
        else:
            self.unpickled_df = pd.DataFrame()

    def pickle_df(self):
        pickle_path = f"./{self.pickle_file_path}"
        self.query_df.to_pickle(pickle_path)

    def load_query_data(self):
        self.query_df = get_df_from_db_uri(self.db_uri, self.alert_info['alert_query'])

    def check_and_prepare_alert(self):
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
        if old_df.empty:
            return new_df
        change = new_df.merge(old_df, how='outer', indicator=True).loc[lambda x : x['_merge']=='left_only']
        return change

    @staticmethod
    def test_change_entry(new_df, old_df):
        if old_df.empty:
            new_df["change"] = "added"
            return new_df
        added_rows = new_df.merge(old_df, how='outer', indicator=True).loc[lambda x : x['_merge']=='left_only']
        added_rows["change"] = "added"
        deleted_rows = new_df.merge(old_df, how='outer', indicator=True).loc[lambda x : x['_merge']=='right_only']
        deleted_rows["change"] = "deleted"
        return pd.concat([added_rows, deleted_rows])

    def prepare_email(self, change_df):
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
    def __init__(self, kpi_info):
        self.kpi_info = kpi_info

    def check_and_prepare_alert(self):
        pass


class StaticKpiAlertController:
    def __init__(self, kpi_info):
        self.kpi_info = kpi_info

    def check_and_prepare_alert(self):
        pass


def check_and_trigger_alert(alert_id):
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
        anomaly_obj = AnomalyAlertController(kpi_info.as_dict)
    elif alert_info.alert_type == "KPI Alert" and alert_info.kpi_alert_type == "Static":
        static_kpi_alert = StaticKpiAlertController(kpi_info.as_dict)
