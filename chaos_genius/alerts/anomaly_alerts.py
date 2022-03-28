import datetime
import io
import logging
import time
from copy import deepcopy
from typing import List, Optional, Tuple

import pandas as pd
from pydantic import validator
from pydantic.dataclasses import dataclass

from chaos_genius.alerts.constants import (
    ALERT_DATETIME_FORMAT,
    ANOMALY_ALERT_COLUMN_NAMES,
    ANOMALY_TABLE_COLUMN_NAMES_MAPPER,
    ANOMALY_TABLE_COLUMNS_HOLDING_FLOATS,
    FREQUENCY_DICT,
    IGNORE_COLUMNS_ANOMALY_TABLE,
    OVERALL_KPI_SERIES_TYPE_REPR,
)
from chaos_genius.alerts.slack import anomaly_alert_slack
from chaos_genius.alerts.utils import (
    AlertException,
    change_message_from_percent,
    count_anomalies,
    find_percentage_change,
    save_anomaly_point_formatting,
    send_email_using_template,
    top_anomalies,
    webapp_url_prefix,
)
from chaos_genius.controllers.kpi_controller import (
    get_active_kpi_from_id,
    get_anomaly_data,
    get_last_anomaly_timestamp,
)

# from chaos_genius.connectors.base_connector import get_df_from_db_uri
from chaos_genius.core.rca.rca_utils.string_helpers import (
    convert_query_string_to_user_string,
)
from chaos_genius.databases.models.alert_model import Alert
from chaos_genius.databases.models.anomaly_data_model import AnomalyDataOutput
from chaos_genius.databases.models.kpi_model import Kpi
from chaos_genius.databases.models.triggered_alerts_model import TriggeredAlerts

logger = logging.getLogger(__name__)


@dataclass
class AnomalyPointOriginal:
    """Representation of a point of anomaly data as received from raw anomaly data."""

    y: float
    yhat_lower: float
    yhat_upper: float
    anomaly: int
    severity: float

    anomaly_type: str
    series_type: str

    created_at: datetime.datetime
    data_datetime: datetime.datetime

    @property
    def expected_value(self) -> str:
        """Expected values represented in a string."""
        return f"{self.yhat_lower} to {self.yhat_upper}"

    @property
    def readable_data_timestamp(self) -> str:
        """Date timestmap as a readable string.

        Also known as Time of Occurrence.
        """
        return self.data_datetime.strftime("%b %d %Y %H:%M:%S")

    # -- pydantic specific configuration starts here --

    # use custom datetime format
    _normalize_datetimes = validator("created_at", "data_datetime", allow_reuse=True)(
        lambda dt: datetime.datetime.strptime(dt, ALERT_DATETIME_FORMAT)
    )

    class Config:
        """Custom pydantic configuration."""

        json_encoders = {
            # custom datetime format for JSON conversion
            datetime: lambda dt: dt.strftime(ALERT_DATETIME_FORMAT),
        }


@dataclass
class AnomalyPoint(AnomalyPointOriginal):
    """Representation of a point of anomaly data as used in alerting."""

    severity: int
    percent_change: str
    change_message: str


class AnomalyAlertController:
    def __init__(self, alert_info: dict, anomaly_end_date=None):
        self.alert_info = alert_info
        self.alert_id: int = self.alert_info["id"]
        self.kpi_id: int = self.alert_info["kpi"]
        self.now = datetime.datetime.now()
        latest_anomaly_timestamp = get_last_anomaly_timestamp([self.kpi_id])

        if latest_anomaly_timestamp is None:
            raise AlertException(
                "Could not get latest anomaly timestamp. No anomaly data was found.",
                alert_id=self.alert_id,
                kpi_id=self.kpi_id,
            )
        self.latest_anomaly_timestamp = latest_anomaly_timestamp
        logger.info("latest_anomaly_timestamp is %s", latest_anomaly_timestamp)

        if anomaly_end_date:
            self.anomaly_end_date = anomaly_end_date
        else:
            self.anomaly_end_date = self.now - datetime.timedelta(days=3)

    def check_and_prepare_alert(self):
        alert_id = self.alert_info["id"]
        alert: Optional[Alert] = Alert.get_by_id(self.alert_info["id"])
        if alert is None:
            raise AlertException(
                "Could not find alert configuration.",
                alert_id=self.alert_id,
                kpi_id=self.kpi_id,
            )

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

        anomaly_data = self._get_anomalies()

        if len(anomaly_data) == 0:
            logger.info(f"No anomaly exists (Alert: {alert_id})")
            return True

        formatted_anomaly_data = self._format_anomaly_data(anomaly_data)

        if self.alert_info["alert_channel"] == "email":
            status = self._send_email_alert(formatted_anomaly_data)
        elif self.alert_info["alert_channel"] == "slack":
            status = self._send_slack_alert(formatted_anomaly_data)
        else:
            raise AlertException(
                f"Unknown alert channel: {self.alert_info['alert_channel']}",
                alert_id=self.alert_id,
                kpi_id=self.kpi_id,
            )

        self._update_alert_metadata(alert)

        self._save_triggered_alerts(status, formatted_anomaly_data)

        return status

    def _get_anomalies(
        self,
        time_diff: datetime.timedelta = datetime.timedelta(),
        anomalies_only: bool = True,
        include_severity_cutoff: bool = True,
    ) -> List[AnomalyDataOutput]:
        last_anomaly_timestamp: Optional[datetime.datetime] = self.alert_info[
            "last_anomaly_timestamp"
        ]

        if last_anomaly_timestamp is not None:
            # when last_anomaly_timestamp is available
            #   get data after last_anomaly_timestamp
            start_timestamp = last_anomaly_timestamp - time_diff
            include_start_timestamp = False
        else:
            # when last_anomaly_timestamp is not available
            #   get data of the last timestamp in anomaly table
            start_timestamp = self.latest_anomaly_timestamp - time_diff
            include_start_timestamp = True

        end_timestamp = self.latest_anomaly_timestamp - time_diff
        include_end_timestamp = True

        severity_cutoff = (
            self.alert_info["severity_cutoff_score"]
            if include_severity_cutoff
            else None
        )

        logger.info(
            f"Checking for anomalies for (KPI: {self.kpi_id}, Alert: "
            f"{self.alert_id}) in the range - start: {start_timestamp} (included: "
            f"{include_start_timestamp}) and end: {self.latest_anomaly_timestamp} "
            "(included: True)"
        )

        anomaly_data = get_anomaly_data(
            [self.kpi_id],
            anomaly_types=["subdim", "overall"],
            anomalies_only=anomalies_only,
            start_timestamp=start_timestamp,
            include_start_timestamp=include_start_timestamp,
            # only get anomaly data till latest timestamp
            #   (ignore newer data added after alert started)
            end_timestamp=end_timestamp,
            include_end_timestamp=include_end_timestamp,
            severity_cutoff=severity_cutoff,
        )

        return anomaly_data

    def _update_alert_metadata(self, alert: Alert):
        """Sets last alerted and last anomaly timestamps."""
        alert.update(
            commit=True,
            last_alerted=self.now,
            last_anomaly_timestamp=self.latest_anomaly_timestamp,
        )

    def _save_triggered_alerts(self, status: bool, formatted_anomaly_data: List[dict]):
        """Saves data for alert (which has been sent) in the triggered alerts table."""
        # TODO: fix this circular import
        from chaos_genius.controllers.digest_controller import (
            structure_anomaly_data_for_digests,
        )

        anomaly_data = structure_anomaly_data_for_digests(formatted_anomaly_data)

        alert_metadata = {
            "alert_frequency": self.alert_info["alert_frequency"],
            "alert_data": anomaly_data,
            "end_date": self.anomaly_end_date.strftime(ALERT_DATETIME_FORMAT),
            "severity_cutoff_score": self.alert_info["severity_cutoff_score"],
            "kpi": self.alert_info["kpi"],
        }

        triggered_alert = TriggeredAlerts(
            alert_conf_id=self.alert_info["id"],
            alert_type="KPI Alert",
            is_sent=status,
            created_at=datetime.datetime.now(),
            alert_metadata=alert_metadata,
        )

        triggered_alert.update(commit=True)
        logger.info("The triggered alert data was successfully stored")

    def _get_formatted_anomaly_data(self, anomaly_data):

        anomaly_data = deepcopy(
            [anomaly_point.as_dict for anomaly_point in anomaly_data]
        )
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

        anomaly_data.sort(key=lambda anomaly: anomaly.get("severity"), reverse=True)
        return anomaly_data

    def _find_point(self, point, prev_data):
        """Finds same type of point in previous data."""
        intended_point = None
        for prev_point in prev_data:
            if prev_point.get("series_type") == point.get("series_type"):
                intended_point = prev_point
                break
        return intended_point

    def _save_nl_message(self, anomaly_data: List[dict]):
        """Constructs and saves change message for every point."""
        kpi = get_active_kpi_from_id(self.kpi_id)
        if kpi is None:
            for point in anomaly_data:
                point["nl_message"] = "KPI does not exist"

            logger.warn(
                f"(KPI: {self.kpi_id}, Alert: {self.alert_id}) KPI does not exist"
            )

            return

        time_series_freq = kpi.anomaly_params.get("frequency")
        if time_series_freq is None or time_series_freq not in ("D", "H"):
            for point in anomaly_data:
                point["nl_message"] = "Time series frequency not found or invalid"

            logger.warn(
                f"(KPI: {self.kpi_id}, Alert: {self.alert_id}) Time series frequency not found or invalid."
            )
            return

        time_diff = datetime.timedelta(days=1, hours=0, minutes=0)

        prev_day_data = self._get_anomalies(
            time_diff=time_diff, anomalies_only=False, include_severity_cutoff=False
        )

        prev_day_data = [anomaly_point.as_dict for anomaly_point in prev_day_data]

        for point in prev_day_data:
            if point.get("anomaly_type") != "overall":
                point["series_type"] = convert_query_string_to_user_string(
                    point["series_type"]
                )
            else:
                point["series_type"] = OVERALL_KPI_SERIES_TYPE_REPR

        hourly_data = dict()
        if time_series_freq == "H":
            for point in prev_day_data:
                if point["data_datetime"].hour not in hourly_data.keys():
                    hourly_data[point["data_datetime"].hour] = []
                hourly_data[point["data_datetime"].hour].append(point)

        for point in anomaly_data:
            if time_series_freq == "D":
                intended_point = self._find_point(point, prev_day_data)
            elif time_series_freq == "H":
                hour_val = point["data_datetime"].hour
                intended_point = self._find_point(point, hourly_data.get(hour_val, []))
            else:
                raise AlertException(
                    "Time series frequency not found or invalid. Got: "
                    f"{time_series_freq}",
                    alert_id=self.alert_id,
                    kpi_id=self.kpi_id,
                )

            point["percentage_change"] = find_percentage_change(
                point["y"], intended_point["y"] if intended_point else None
            )

            point["nl_message"] = change_message_from_percent(
                point["percentage_change"]
            )

    def format_alert_data(self, data: List[dict]):
        """Pre-processes anomaly alert data."""
        self._save_nl_message(data)

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

    def _format_anomaly_data(self, anomaly_data: List[AnomalyDataOutput]) -> List[dict]:
        formatted_anomaly_data = self._get_formatted_anomaly_data(anomaly_data)
        self.format_alert_data(formatted_anomaly_data)

        return formatted_anomaly_data

    def _get_kpi(self) -> Kpi:
        kpi = get_active_kpi_from_id(self.kpi_id)

        if kpi is None:
            raise AlertException(
                "KPI does not exist.", alert_id=self.alert_id, kpi_id=self.kpi_id
            )

        return kpi

    def _get_top_anomalies_and_counts(
        self, formatted_anomaly_data: List[dict], kpi: Kpi
    ) -> Tuple[List[dict], int, int]:
        top_anomalies_ = deepcopy(top_anomalies(formatted_anomaly_data, 5))
        save_anomaly_point_formatting(
            top_anomalies_, kpi.anomaly_params.get("frequency")
        )
        overall_count, subdim_count = count_anomalies(formatted_anomaly_data)

        return top_anomalies_, overall_count, subdim_count

    def _send_email_alert(self, formatted_anomaly_data: List[dict]) -> bool:

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

            column_names = ANOMALY_ALERT_COLUMN_NAMES
            anomaly_data_df = pd.DataFrame(formatted_anomaly_data, columns=column_names)
            files = []
            if not anomaly_data_df.empty:
                file_detail = {}
                file_detail["fname"] = "data.csv"
                with io.StringIO() as buffer:
                    anomaly_data_df.to_csv(buffer, encoding="utf-8")
                    file_detail["fdata"] = buffer.getvalue()
                files = [file_detail]

            daily_digest = self.alert_info.get("daily_digest", False)
            weekly_digest = self.alert_info.get("weekly_digest", False)

            status = False

            if not (daily_digest or weekly_digest):
                kpi = self._get_kpi()

                (
                    top_anomalies_,
                    overall_count,
                    subdim_count,
                ) = self._get_top_anomalies_and_counts(formatted_anomaly_data, kpi)

                status = send_email_using_template(
                    "email_alert.html",
                    recipient_emails,
                    subject,
                    files,
                    self.alert_info,
                    column_names=column_names,
                    top_anomalies=top_anomalies_,
                    alert_message=alert_message,
                    kpi_name=kpi.name,
                    alert_frequency=self.alert_info["alert_frequency"].capitalize(),
                    preview_text="Anomaly Alert",
                    alert_name=self.alert_info.get("alert_name"),
                    kpi_link=f"{webapp_url_prefix()}#/dashboard/0/anomaly/{self.kpi_id}",
                    alert_dashboard_link=f"{webapp_url_prefix()}api/digest",
                    overall_count=overall_count,
                    subdim_count=subdim_count,
                    str=str,
                )

                if status is True:
                    logger.info(
                        f"The email for Alert ID - {self.alert_info['id']} was successfully sent"
                    )
                else:
                    logger.info(
                        f"The email for Alert ID - {self.alert_info['id']} has not been sent"
                    )

                logger.info(f"Status for Alert ID - {self.alert_info['id']} : {status}")

            return status
        else:
            logger.info(
                f"No receipent email available (Alert ID - {self.alert_info['id']})"
            )
            return False

    def _send_slack_alert(self, formatted_anomaly_data: List[dict]) -> bool:
        alert_name = self.alert_info.get("alert_name")
        alert_message = self.alert_info["alert_message"]

        daily_digest = self.alert_info.get("daily_digest", False)
        weekly_digest = self.alert_info.get("weekly_digest", False)

        status = "failed"
        if not (daily_digest or weekly_digest):
            kpi = self._get_kpi()

            (
                top_anomalies_,
                overall_count,
                subdim_count,
            ) = self._get_top_anomalies_and_counts(formatted_anomaly_data, kpi)

            status = anomaly_alert_slack(
                kpi.name,
                alert_name,
                self.kpi_id,
                alert_message,
                top_anomalies_,
                overall_count,
                subdim_count,
            )

        if status == "ok":
            logger.info(
                f"The slack alert for Alert ID - {self.alert_info['id']} was successfully sent"
            )
        else:
            logger.info(
                f"The slack alert for Alert ID - {self.alert_info['id']} has not been sent"
            )

        status = status == "ok"

        return status
