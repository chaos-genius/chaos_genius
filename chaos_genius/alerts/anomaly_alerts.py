import datetime
import io
import logging
import os
import time
from copy import deepcopy
from typing import List, Optional

import pandas as pd
from jinja2 import Environment, FileSystemLoader, select_autoescape

from chaos_genius.alerts.constants import (
    ALERT_DATETIME_FORMAT,
    ANOMALY_ALERT_COLUMN_NAMES,
    ANOMALY_TABLE_COLUMN_NAMES_MAPPER,
    ANOMALY_TABLE_COLUMNS_HOLDING_FLOATS,
    FREQUENCY_DICT,
    IGNORE_COLUMNS_ANOMALY_TABLE,
    OVERALL_KPI_SERIES_TYPE_REPR,
)
from chaos_genius.alerts.email import send_static_alert_email
from chaos_genius.alerts.slack import anomaly_alert_slack
from chaos_genius.alerts.utils import (
    change_message_from_percent,
    count_anomalies,
    find_percentage_change,
    format_anomaly_points,
    save_anomaly_point_formatting,
    top_anomalies,
    webapp_url_prefix,
)

# from chaos_genius.connectors.base_connector import get_df_from_db_uri
from chaos_genius.core.rca.rca_utils.string_helpers import (
    convert_query_string_to_user_string,
)
from chaos_genius.databases.models.alert_model import Alert
from chaos_genius.databases.models.anomaly_data_model import AnomalyDataOutput
from chaos_genius.databases.models.kpi_model import Kpi
from chaos_genius.databases.models.triggered_alerts_model import TriggeredAlerts

logger = logging.getLogger()


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
            AnomalyDataOutput.is_anomaly.in_([1, -1]),
            AnomalyDataOutput.data_datetime >= self.anomaly_end_date,
            AnomalyDataOutput.severity >= self.alert_info["severity_cutoff_score"],
        ).all()

        if len(anomaly_data) == 0:
            logger.info(f"No anomaly exists (Alert ID - {alert_id})")
            return True

        logger.info(f"Alert ID {alert_id} is sent to the respective alert channel")

        if self.alert_info["alert_channel"] == "email":
            outcome, alert_data = self.send_alert_email(anomaly_data)
        elif self.alert_info["alert_channel"] == "slack":
            outcome, alert_data = self.send_slack_alert(anomaly_data)

        if alert_data is None:
            return outcome

        alert_metadata = {
            "alert_frequency": self.alert_info["alert_frequency"],
            "alert_data": alert_data,
            "end_date": self.anomaly_end_date.strftime(ALERT_DATETIME_FORMAT),
            "severity_cutoff_score": self.alert_info["severity_cutoff_score"],
            "kpi": self.alert_info["kpi"],
        }

        triggered_alert = TriggeredAlerts(
            alert_conf_id=self.alert_info["id"],
            alert_type="KPI Alert",
            is_sent=outcome,
            created_at=datetime.datetime.now(),
            alert_metadata=alert_metadata,
        )

        triggered_alert.update(commit=True)
        logger.info(f"The triggered alert data was successfully stored")
        return outcome

    def get_overall_subdim_data(self, anomaly_data):

        anomaly_data = [anomaly_point.as_dict for anomaly_point in anomaly_data]
        anomaly_data = [
            {
                key: value
                for key, value in anomaly_point.items()
                if key not in IGNORE_COLUMNS_ANOMALY_TABLE
            }
            for anomaly_point in anomaly_data
        ]

        for anomaly_point in anomaly_data:
            anomaly_point["series_type"] = (
                OVERALL_KPI_SERIES_TYPE_REPR
                if anomaly_point.get("anomaly_type") == "overall"
                else anomaly_point["series_type"]
            )
            for key, value in anomaly_point.items():
                if key in ANOMALY_TABLE_COLUMNS_HOLDING_FLOATS:
                    anomaly_point[key] = round(value, 2)
            if anomaly_point["series_type"] != OVERALL_KPI_SERIES_TYPE_REPR:
                anomaly_point["series_type"] = convert_query_string_to_user_string(
                    anomaly_point["series_type"]
                )

        overall_data = [
            anomaly_point
            for anomaly_point in anomaly_data
            if anomaly_point.get("anomaly_type") == "overall"
        ]
        subdim_data = [
            anomaly_point
            for anomaly_point in anomaly_data
            if anomaly_point.get("anomaly_type") == "subdim"
        ]
        overall_data.sort(key=lambda anomaly: anomaly.get("severity"), reverse=True)
        subdim_data.sort(key=lambda anomaly: anomaly.get("severity"), reverse=True)

        return overall_data, subdim_data

    def _find_point(self, point, prev_data):
        """Finds same type of point in previous data."""
        intended_point = None
        for prev_point in prev_data:
            if prev_point.get("series_type") == point.get("series_type"):
                intended_point = prev_point
                break
        return intended_point

    def _save_nl_message_daily_freq(self, anomaly_data: List[dict], kpi: Kpi):
        """Saves change message for every point, for a daily frequency KPI."""
        time_diff = datetime.timedelta(days=1, hours=0, minutes=0)

        # TODO: fix circular import
        from chaos_genius.controllers.digest_controller import get_previous_data

        prev_day_data = get_previous_data(kpi.id, self.anomaly_end_date, time_diff)

        prev_day_data = [anomaly_point.as_dict for anomaly_point in prev_day_data]

        for point in prev_day_data:
            if point.get("anomaly_type") != "overall":
                point["series_type"] = convert_query_string_to_user_string(
                    point["series_type"]
                )
            else:
                point["series_type"] = OVERALL_KPI_SERIES_TYPE_REPR

        for point in anomaly_data:
            intended_point = self._find_point(point, prev_day_data)

            if intended_point is None:
                # previous point wasn't found
                point["percentage_change"] = "–"
            elif point["y"] == 0 and intended_point["y"] == point["y"]:
                # previous data was same as current
                point["percentage_change"] = "–"
            elif intended_point["y"] == 0:
                # previous point was 0
                sign_ = "+" if point["y"] > 0 else "-"
                point["percentage_change"] = sign_ + "inf"
            else:
                point["percentage_change"] = find_percentage_change(
                    point["y"], intended_point["y"]
                )

            point["nl_message"] = change_message_from_percent(
                point["percentage_change"]
            )

    def _save_nl_message_hourly_freq(self, anomaly_data: List[dict], kpi: Kpi):
        """Saves change message for every point, for a hourly frequency KPI."""
        data = dict()
        time_diff = datetime.timedelta(days=1, hours=0, minutes=0)

        # TODO: fix circular import
        from chaos_genius.controllers.digest_controller import get_previous_data

        prev_day_data = get_previous_data(kpi.id, self.anomaly_end_date, time_diff)
        prev_day_data = [anomaly_point.as_dict for anomaly_point in prev_day_data]

        for point in prev_day_data:
            if point.get("anomaly_type") != "overall":
                point["series_type"] = convert_query_string_to_user_string(
                    point["series_type"]
                )
            else:
                point["series_type"] = OVERALL_KPI_SERIES_TYPE_REPR

        for point in prev_day_data:
            if point["data_datetime"].hour not in data.keys():
                data[point["data_datetime"].hour] = []
            data[point["data_datetime"].hour].append(point)

        for point in anomaly_data:
            hour_val = point["data_datetime"].hour
            intended_point = self._find_point(point, data.get(hour_val, []))
            if intended_point is None:
                # previous point wasn't found
                point["percentage_change"] = "–"
            elif point["y"] == 0 and intended_point["y"] == point["y"]:
                # previous data was same as current
                point["percentage_change"] = "–"
            elif intended_point["y"] == 0:
                # previous point was 0
                sign_ = "+" if point["y"] > 0 else "-"
                point["percentage_change"] = sign_ + "inf"
            else:
                point["percentage_change"] = find_percentage_change(
                    point["y"], intended_point["y"]
                )

            point["nl_message"] = change_message_from_percent(
                point["percentage_change"]
            )

    def save_nl_message(self, anomaly_data: List[dict]):
        """Constructs and saves change message for every point."""
        kpi_id = self.alert_info["kpi"]
        kpi = Kpi.get_by_id(kpi_id)
        if kpi is None:
            for point in anomaly_data:
                point["nl_message"] = "KPI does not exist"
            return

        time_series_freq = kpi.anomaly_params.get("frequency")
        if time_series_freq is None:
            for point in anomaly_data:
                point["nl_message"] = "Time series frequency does not exist"
            return

        if time_series_freq in ("d", "D", "daily", "Daily"):
            self._save_nl_message_daily_freq(anomaly_data, kpi)
        elif time_series_freq in ("h", "H", "hourly", "Hourly"):
            self._save_nl_message_hourly_freq(anomaly_data, kpi)
        else:
            for point in anomaly_data:
                point["nl_message"] = "Unsupported time series frequency"

    def format_alert_data(self, data: List[dict]):
        """Pre-processes anomaly alert data."""
        self.save_nl_message(data)

        for anomaly_point in data:
            lower = anomaly_point.get("yhat_lower")
            upper = anomaly_point.get("yhat_upper")
            anomaly_point["Expected Value"] = f"{lower} to {upper}"

            # round off severity for better representation
            anomaly_point["severity"] = round(anomaly_point["severity"])

            # rename column names for human readability
            for key, value in ANOMALY_TABLE_COLUMN_NAMES_MAPPER.items():
                anomaly_point[value] = anomaly_point[key]

            my_time = time.strptime(
                anomaly_point["Time of Occurrence"].strftime(ALERT_DATETIME_FORMAT),
                ALERT_DATETIME_FORMAT,
            )
            timestamp = time.mktime(my_time)
            date_time = datetime.datetime.fromtimestamp(timestamp)
            new_time = date_time.strftime("%b %d %Y %H:%M:%S")
            anomaly_point["Time of Occurrence"] = new_time
            anomaly_point["data_datetime"] = anomaly_point["data_datetime"].strftime(
                ALERT_DATETIME_FORMAT
            )
            anomaly_point["created_at"] = anomaly_point["created_at"].strftime(
                ALERT_DATETIME_FORMAT
            )

    def _remove_attributes_from_anomaly_points(
        self, anomaly_data: List[dict], list_attributes: List[str]
    ):
        for attr in list_attributes:
            for point in anomaly_data:
                delattr(point, attr)

    def send_alert_email(self, anomaly_data):

        alert_channel_conf = self.alert_info["alert_channel_conf"]

        if type(alert_channel_conf) != dict:
            logger.info(
                f"The alert channel configuration is incorrect for Alert ID - {self.alert_info['id']}"
            )
            return False

        recipient_emails = alert_channel_conf.get("email", [])

        if recipient_emails:
            subject = f"{self.alert_info['alert_name']} - Chaos Genius Alert ({self.now.strftime('%b %d')})❗"
            alert_message = self.alert_info["alert_message"]

            kpi_id = self.alert_info["kpi"]
            kpi_obj = Kpi.query.filter(Kpi.active == True, Kpi.id == kpi_id).first()

            if kpi_obj is None:
                logger.error(f"No KPI exists for Alert ID - {self.alert_info['id']}")
                return False

            kpi_name = getattr(kpi_obj, "name")

            overall_data, subdim_data = self.get_overall_subdim_data(anomaly_data)

            overall_data_email_body = (
                deepcopy([overall_data[0]]) if len(overall_data) > 0 else []
            )
            len_subdim = min(10, len(subdim_data))
            subdim_data_email_body = (
                deepcopy(subdim_data[0:len_subdim]) if len(subdim_data) > 0 else []
            )

            overall_data.extend(subdim_data)
            overall_data_email_body.extend(subdim_data_email_body)

            self.format_alert_data(overall_data)
            self.format_alert_data(overall_data_email_body)

            column_names = ANOMALY_ALERT_COLUMN_NAMES
            overall_data_ = pd.DataFrame(overall_data, columns=column_names)
            files = []
            if not overall_data_.empty:
                file_detail = {}
                file_detail["fname"] = "data.csv"
                with io.StringIO() as buffer:
                    overall_data_.to_csv(buffer, encoding="utf-8")
                    file_detail["fdata"] = buffer.getvalue()
                files = [file_detail]

            daily_digest = self.alert_info.get("daily_digest", False)
            weekly_digest = self.alert_info.get("weekly_digest", False)

            if not (daily_digest or weekly_digest):
                points = deepcopy(
                    [anomaly_point.as_dict for anomaly_point in anomaly_data]
                )
                format_anomaly_points(points)
                self.format_alert_data(points)
                save_anomaly_point_formatting(
                    points, kpi_obj.anomaly_params.get("frequency")
                )
                top_anomalies_ = top_anomalies(points, 5)
                overall_count, subdim_count = count_anomalies(points)

                test = self.send_template_email(
                    "email_alert.html",
                    recipient_emails,
                    subject,
                    files,
                    column_names=column_names,
                    top_anomalies=top_anomalies_,
                    alert_message=alert_message,
                    kpi_name=kpi_name,
                    alert_frequency=self.alert_info["alert_frequency"].capitalize(),
                    preview_text="Anomaly Alert",
                    alert_name=self.alert_info.get("alert_name"),
                    kpi_link=f"{webapp_url_prefix()}#/dashboard/0/anomaly/{kpi_id}",
                    alert_dashboard_link=f"{webapp_url_prefix()}api/digest",
                    overall_count=overall_count,
                    subdim_count=subdim_count,
                    str=str
                )
                logger.info(f"Status for Alert ID - {self.alert_info['id']} : {test}")
            # self.remove_attributes_from_anomaly_data(overall_data, ["nl_message"])
            # TODO: fix this circular import
            from chaos_genius.controllers.digest_controller import (
                structure_anomaly_data_for_digests,
            )

            anomaly_data = structure_anomaly_data_for_digests(overall_data)
            return False, anomaly_data
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
        test = send_static_alert_email(
            recipient_emails, subject, template.render(**kwargs), self.alert_info, files
        )
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
            return False, None

        kpi_name = getattr(kpi_obj, "name")
        alert_name = self.alert_info.get("alert_name")
        alert_message = self.alert_info["alert_message"]

        overall_data, subdim_data = self.get_overall_subdim_data(anomaly_data)

        overall_data_alert_body = (
            deepcopy([overall_data[0]]) if len(overall_data) > 0 else []
        )
        len_subdim = min(5, len(subdim_data))
        subdim_data_alert_body = (
            deepcopy(subdim_data[0:len_subdim]) if len(subdim_data) > 0 else []
        )

        overall_data.extend(subdim_data)
        overall_data_alert_body.extend(subdim_data_alert_body)

        self.format_alert_data(overall_data)
        self.format_alert_data(overall_data_alert_body)

        daily_digest = self.alert_info.get("daily_digest", False)
        weekly_digest = self.alert_info.get("weekly_digest", False)

        test = "failed"
        if not (daily_digest or weekly_digest):
            points = deepcopy([anomaly_point.as_dict for anomaly_point in anomaly_data])
            format_anomaly_points(points)
            self.format_alert_data(points)
            save_anomaly_point_formatting(
                points, kpi_obj.anomaly_params.get("frequency")
            )
            top_anomalies_ = top_anomalies(points, 5)
            overall_count, subdim_count = count_anomalies(points)

            test = anomaly_alert_slack(
                kpi_name,
                alert_name,
                kpi_id,
                alert_message,
                top_anomalies_,
                overall_count,
                subdim_count,
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
        test = test == "ok"
        # self.remove_attributes_from_anomaly_data(overall_data, ["nl_message"])
        # TODO: fix this circular import
        from chaos_genius.controllers.digest_controller import (
            structure_anomaly_data_for_digests,
        )

        anomaly_data = structure_anomaly_data_for_digests(overall_data)
        return test, anomaly_data
