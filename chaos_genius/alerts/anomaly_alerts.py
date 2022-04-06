"""Controller and helpers for KPI or Anomaly alerts."""
import datetime
import heapq
import io
import logging
from copy import deepcopy
from typing import Any, Dict, List, Optional, Sequence, Tuple, TypeVar, Union

import pandas as pd
from pydantic import BaseModel, StrictFloat, StrictInt, root_validator, validator
from pydantic.tools import parse_obj_as

from chaos_genius.alerts.constants import (
    ALERT_DATE_FORMAT,
    ALERT_DATETIME_FORMAT,
    ALERT_READABLE_DATA_TIMESTAMP_FORMAT,
    ALERT_READABLE_DATE_FORMAT,
    ALERT_READABLE_DATETIME_FORMAT,
    ANOMALY_TABLE_COLUMN_NAMES_MAPPER,
    OVERALL_KPI_SERIES_TYPE_REPR,
)
from chaos_genius.alerts.slack import anomaly_alert_slack
from chaos_genius.alerts.utils import (
    AlertException,
    change_message_from_percent,
    find_percentage_change,
    human_readable,
    send_email_using_template,
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
from chaos_genius.databases.models.kpi_model import Kpi
from chaos_genius.databases.models.triggered_alerts_model import TriggeredAlerts
from chaos_genius.utils.utils import jsonable_encoder

logger = logging.getLogger(__name__)


class AnomalyPointOriginal(BaseModel):
    """Representation of a point of anomaly data as received from raw anomaly data."""

    # TODO: could be generated from AnomalyDataOutput model

    # y-value of point
    y: float
    # lower bound of expected value
    yhat_lower: float
    # upper bound of expected value
    yhat_upper: float
    # severity of the anomaly (0 to 100)
    severity: float

    # overall, subdim or data_quality
    anomaly_type: str
    # subdimension name (when it's a subdim)
    series_type: Optional[str]

    # timestamp when this entry was added
    created_at: datetime.datetime
    # timestamp of the anomaly point
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
        return self.data_datetime.strftime(ALERT_READABLE_DATA_TIMESTAMP_FORMAT)

    @property
    def date_only(self) -> str:
        """Only date part of the data timestamp (data_datetime)."""
        return self.data_datetime.strftime(ALERT_DATE_FORMAT)

    def format_series_type(self):
        """Format series_type to be more readable for use in alerts.

        Note: do not call this twice on the same instance.
        """
        # TODO: make this idempotent
        self.series_type = _format_series_type(self.anomaly_type, self.series_type)

    # -- pydantic specific configuration starts here --

    # use custom datetime format
    _normalize_datetimes = validator("created_at", "data_datetime", allow_reuse=True)(
        lambda dt: datetime.datetime.strptime(dt, ALERT_DATETIME_FORMAT)
        if not isinstance(dt, datetime.datetime)
        else dt
    )

    class Config:
        """Custom pydantic configuration."""

        json_encoders = {
            # custom datetime format for JSON conversion
            datetime: lambda dt: dt.strftime(ALERT_DATETIME_FORMAT),
        }


class AnomalyPoint(AnomalyPointOriginal):
    """Representation of a point of anomaly data as used in alerting.

    This is the data stored in triggered alerts.
    """

    # severity value rounded to integer
    severity: int
    # percentage change from previous day's point
    percent_change: Union[StrictFloat, StrictInt, str]
    # human readable message describing the percent_change
    change_message: str

    @staticmethod
    def from_original(
        point: AnomalyPointOriginal,
        previous_anomaly_point: Optional[AnomalyPointOriginal] = None,
        fixed_change_message: Optional[str] = None,
    ) -> "AnomalyPoint":
        """Constructs a formatted AnomalyPoint from AnomalyPointOriginal.

        Arguments:
            point: original anomaly point
            previous_anomaly_point: the anomaly point from which change percent will be
                calculated.
            fixed_change_message: the change message to use when previous anomaly point
                cannot be found. If specified, change percent will not be calculated.
        """
        series_type = (
            OVERALL_KPI_SERIES_TYPE_REPR
            if point.series_type == "overall"
            else point.series_type
        )

        y = round(point.y, 2)
        yhat_lower = round(point.yhat_lower, 2)
        yhat_upper = round(point.yhat_upper, 2)
        severity = round(point.severity)

        series_type = _format_series_type(point.anomaly_type, point.series_type)

        if fixed_change_message is not None:
            change_message = fixed_change_message
            percent_change = "-"
        else:
            percent_change = find_percentage_change(
                point.y, previous_anomaly_point.y if previous_anomaly_point else None
            )
            change_message = change_message_from_percent(percent_change)

        return AnomalyPoint(
            y=y,
            yhat_lower=yhat_lower,
            yhat_upper=yhat_upper,
            severity=severity,
            anomaly_type=point.anomaly_type,
            series_type=series_type,
            created_at=point.created_at,
            data_datetime=point.data_datetime,
            percent_change=percent_change,
            change_message=change_message,
        )

    @root_validator(pre=True)
    def _support_old_field_names(cls, values: Dict[str, Any]) -> Dict[str, Any]:
        aliases = {
            "percent_change": "percentage_change",
            "change_message": "nl_message",
        }

        for field_name, alias in aliases.items():
            if field_name not in values:
                if alias in values:
                    values[field_name] = values[alias]

        return values


class AnomalyPointFormatted(AnomalyPoint):
    """Anomaly point data with formatting used in templates (email, slack, etc).

    Also used in digests as a representation of points in TriggeredAlerts.
    """

    kpi_id: int
    kpi_name: str
    alert_id: int
    alert_name: str
    alert_channel: str
    # stores alert channel configuration
    # in individual alerts, this will be the entire dict (`Dict`)
    # in digests, this will be just the list of emails or None (`Optional[List[str]]`)
    # TODO: make a different type for digest data or use a consistent type across both
    #  ref: https://github.com/chaos-genius/chaos_genius/pull/862#discussion_r839400411
    alert_channel_conf: Any

    formatted_date: str
    formatted_change_percent: str

    @staticmethod
    def from_point(
        point: AnomalyPoint,
        time_series_frequency: Optional[str],
        kpi_id: int,
        kpi_name: str,
        alert_id: int,
        alert_name: str,
        alert_channel: str,
        alert_channel_conf: Any,
    ) -> "AnomalyPointFormatted":
        """Constructs a formatted point from an AnomalyPoint."""
        dt_format = ALERT_READABLE_DATETIME_FORMAT
        if time_series_frequency is not None and time_series_frequency == "D":
            dt_format = ALERT_READABLE_DATE_FORMAT
        formatted_date = point.data_datetime.strftime(dt_format)

        formatted_change_percent = point.percent_change
        if isinstance(point.percent_change, (int, float)):
            if point.percent_change > 0:
                formatted_change_percent = f"+{point.percent_change}%"
            else:
                formatted_change_percent = f"{point.percent_change}%"

        return AnomalyPointFormatted(
            **point.dict(),
            kpi_id=kpi_id,
            kpi_name=kpi_name,
            alert_id=alert_id,
            alert_name=alert_name,
            alert_channel=alert_channel,
            alert_channel_conf=alert_channel_conf,
            formatted_date=formatted_date,
            formatted_change_percent=str(formatted_change_percent),
        )

    @property
    def y_readable(self):
        """Returns human readable format for y value of anomaly point."""
        return human_readable(self.y)

    @property
    def yhat_lower_readable(self):
        """Returns human readable format for lower bound of expected range."""
        return human_readable(self.yhat_lower)

    @property
    def yhat_upper_readable(self):
        """Returns human readable format for upper bound of expected range."""
        return human_readable(self.yhat_upper)


class AnomalyAlertController:
    """Controller for KPI/anomaly alerts."""

    def __init__(self, alert: Alert):
        """Initializes a KPI/anomaly alerts controller.

        Note: an AnomalyAlertController instance must only be used for one check/trigger
        of an alert. The same object must not be re-used.

        Arguments:
            alert: object of the Alert model for which to send alerts
        """
        self.alert = alert
        self.alert_id: int = self.alert.id
        self.kpi_id: int = self.alert.kpi
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

    def check_and_send_alert(self):
        """Determines anomalies, sends alert and stores alert data.

        Note: must only be called once on an instance.
        """
        anomaly_data = self._get_anomalies()

        if len(anomaly_data) == 0:
            logger.info(
                f"(Alert: {self.alert_id}, KPI: {self.kpi_id}) no anomaly exists."
            )
            return True

        formatted_anomaly_data = self._format_anomaly_data(anomaly_data)

        status = False
        try:
            if self._to_send_individual():
                if self.alert.alert_channel == "email":
                    self._send_email_alert(formatted_anomaly_data)
                elif self.alert.alert_channel == "slack":
                    self._send_slack_alert(formatted_anomaly_data)
                else:
                    raise AlertException(
                        f"Unknown alert channel: {self.alert.alert_channel}",
                        alert_id=self.alert_id,
                        kpi_id=self.kpi_id,
                    )
            else:
                logger.info(
                    f"(Alert: {self.alert_id}, KPI: {self.kpi_id}) not sending "
                    "alert as it was configured to be a digest."
                )

            # TODO: last_anomaly_timestamp can be updated even if no anomaly exists.
            self._update_alert_metadata(self.alert)

            status = True
        finally:
            self._save_triggered_alerts(status, formatted_anomaly_data)

        return status

    def _get_anomalies(
        self,
        time_diff: datetime.timedelta = datetime.timedelta(),
        anomalies_only: bool = True,
        include_severity_cutoff: bool = True,
    ) -> List[AnomalyPointOriginal]:
        last_anomaly_timestamp: Optional[
            datetime.datetime
        ] = self.alert.last_anomaly_timestamp

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
            self.alert.severity_cutoff_score if include_severity_cutoff else None
        )

        logger.info(
            f"Checking for anomalies for (KPI: {self.kpi_id}, Alert: "
            f"{self.alert_id}) in the range - start: {start_timestamp} (included: "
            f"{include_start_timestamp}) and end: {end_timestamp} "
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

        return parse_obj_as(
            List[AnomalyPointOriginal], [point.as_dict for point in anomaly_data]
        )

    def _update_alert_metadata(self, alert: Alert):
        """Sets last alerted and last anomaly timestamps."""
        alert.update(
            commit=True,
            last_alerted=self.now,
            last_anomaly_timestamp=self.latest_anomaly_timestamp,
        )

    def _save_triggered_alerts(
        self, status: bool, formatted_anomaly_data: List[AnomalyPoint]
    ):
        """Saves data for alert (which has been sent) in the triggered alerts table."""
        # for digests, we would like the latest anomalies to be displayed first
        formatted_anomaly_data = sorted(
            formatted_anomaly_data,
            key=lambda point: (point.data_datetime, point.severity),
            reverse=True,
        )

        alert_metadata = {
            "alert_frequency": self.alert.alert_frequency,
            "alert_data": jsonable_encoder(formatted_anomaly_data),
            "severity_cutoff_score": self.alert.severity_cutoff_score,
            "kpi": self.kpi_id,
        }

        triggered_alert = TriggeredAlerts(
            alert_conf_id=self.alert_id,
            alert_type="KPI Alert",
            is_sent=status,
            created_at=datetime.datetime.now(),
            alert_metadata=alert_metadata,
        )

        triggered_alert.update(commit=True)
        logger.info("The triggered alert data was successfully stored")

    def _find_point(
        self, point: AnomalyPointOriginal, prev_data: List[AnomalyPointOriginal]
    ):
        """Finds same type of point in previous data."""
        intended_point = None
        for prev_point in prev_data:
            if prev_point.series_type == point.series_type:
                intended_point = prev_point
                break
        return intended_point

    def _format_anomaly_data(
        self, anomaly_data: List[AnomalyPointOriginal]
    ) -> List[AnomalyPoint]:
        kpi = self._get_kpi()

        time_series_freq: Optional[str] = kpi.anomaly_params.get("frequency")

        # get previous anomaly point for comparison
        time_diff = datetime.timedelta(days=1, hours=0, minutes=0)
        prev_day_data = self._get_anomalies(
            time_diff=time_diff, anomalies_only=False, include_severity_cutoff=False
        )

        # store a mapping of hour => list of anomaly points for that hour
        hourly_data: Dict[int, List[AnomalyPointOriginal]] = dict()
        if time_series_freq == "H":
            for point in prev_day_data:
                if point.data_datetime.hour not in hourly_data.keys():
                    hourly_data[point.data_datetime.hour] = []
                hourly_data[point.data_datetime.hour].append(point)

        formatted_anomaly_data: List[AnomalyPoint] = []
        for point in anomaly_data:
            if time_series_freq == "D":
                # in case of daily granularity, find point in the previous day
                previous_point = self._find_point(point, prev_day_data)
            elif time_series_freq == "H":
                # in case of hourly granularity, find the point of the same hour
                # but in the previous day.
                previous_point = self._find_point(
                    point, hourly_data.get(point.data_datetime.hour, [])
                )
            else:
                raise AlertException(
                    f"Time series frequency not found or invalid: {time_series_freq}",
                    alert_id=self.alert_id,
                    kpi_id=self.kpi_id,
                )

            formatted_anomaly_data.append(
                AnomalyPoint.from_original(point, previous_point)
            )

        # Sort in descending order according to severity
        formatted_anomaly_data.sort(key=lambda point: point.severity, reverse=True)

        return formatted_anomaly_data

    def _get_kpi(self) -> Kpi:
        kpi = get_active_kpi_from_id(self.kpi_id)

        if kpi is None:
            raise AlertException(
                "KPI does not exist.", alert_id=self.alert_id, kpi_id=self.kpi_id
            )

        return kpi

    def _to_send_individual(self) -> bool:
        """Whether to send individual alert or include in a digest.

        Returns:
            True if an individual alert needs to be sent, False otherwise.
        """
        daily_digest = self.alert.daily_digest
        weekly_digest = self.alert.weekly_digest

        return not (daily_digest or weekly_digest)

    def _get_top_anomalies_and_counts(
        self, formatted_anomaly_data: List[AnomalyPoint], kpi: Kpi
    ) -> Tuple[Sequence[AnomalyPointFormatted], int, int]:
        overall_count, subdim_count = _count_anomalies(formatted_anomaly_data)

        top_anomalies_ = deepcopy(_top_anomalies(formatted_anomaly_data, 5))
        top_anomalies_ = _format_anomaly_point_for_template(
            top_anomalies_, kpi, self.alert
        )

        return top_anomalies_, overall_count, subdim_count

    def _send_email_alert(self, formatted_anomaly_data: List[AnomalyPoint]) -> None:
        alert_channel_conf = self.alert.alert_channel_conf

        if not isinstance(alert_channel_conf, dict):
            raise AlertException(
                f"Alert channel config was not a dict. Got: {alert_channel_conf}",
                alert_id=self.alert_id,
                kpi_id=self.kpi_id,
            )

        recipient_emails = alert_channel_conf.get("email")

        if not recipient_emails:
            raise AlertException(
                f"No recipient emails found. Got: {recipient_emails}",
                alert_id=self.alert_id,
                kpi_id=self.kpi_id,
            )

        subject = (
            f"{self.alert.alert_name} - Chaos Genius Alert "
            f"({self.now.strftime('%b %d')})❗"
        )

        # attach CSV of anomaly data
        files = [
            {
                "fname": "data.csv",
                "fdata": _make_anomaly_data_csv(formatted_anomaly_data),
            }
        ]

        kpi = self._get_kpi()

        (
            top_anomalies_,
            overall_count,
            subdim_count,
        ) = self._get_top_anomalies_and_counts(formatted_anomaly_data, kpi)

        send_email_using_template(
            "email_alert.html",
            recipient_emails,
            subject,
            files,
            top_anomalies=top_anomalies_,
            alert_message=self.alert.alert_message,
            kpi_name=kpi.name,
            preview_text="Anomaly Alert",
            alert_name=self.alert.alert_name,
            kpi_link=f"{webapp_url_prefix()}#/dashboard/0/anomaly/" f"{self.kpi_id}",
            alert_dashboard_link=f"{webapp_url_prefix()}api/digest",
            overall_count=overall_count,
            subdim_count=subdim_count,
            str=str,
        )

        logger.info(
            f"(Alert: {self.alert_id}, KPI: {self.kpi_id}) The email alert was "
            "successfully sent"
        )

    def _send_slack_alert(self, formatted_anomaly_data: List[AnomalyPoint]):
        kpi = self._get_kpi()

        (
            top_anomalies_,
            overall_count,
            subdim_count,
        ) = self._get_top_anomalies_and_counts(formatted_anomaly_data, kpi)

        err = anomaly_alert_slack(
            kpi.name,
            self.alert.alert_name,
            self.kpi_id,
            self.alert.alert_message,
            top_anomalies_,
            overall_count,
            subdim_count,
        )

        if err == "":
            logger.info(
                f"(Alert: {self.alert_id}, KPI: {self.kpi_id}) The slack alert was "
                "successfully sent"
            )
        else:
            raise AlertException(
                f"Slack alert was not sent: {err}",
                alert_id=self.alert_id,
                kpi_id=self.kpi_id,
            )


def _format_series_type(anomaly_type: str, series_type: Optional[str]) -> str:
    """Format a anomaly point's series type for use in alerts.

    Do not call this function twice on the same data.

    Arguments:
        anomaly_type: see AnomalyPointOriginal
        series_type: see AnomalyPointOriginal
    """
    series_type = (
        OVERALL_KPI_SERIES_TYPE_REPR
        if anomaly_type == "overall"
        else convert_query_string_to_user_string(series_type or "")
    )

    return series_type


def _make_anomaly_data_csv(anomaly_points: List[AnomalyPoint]) -> str:
    """Create an in-memory string containing the CSV of given anomaly data."""
    anomaly_df = pd.DataFrame(
        [
            point.dict(include=ANOMALY_TABLE_COLUMN_NAMES_MAPPER.keys())
            for point in anomaly_points
        ]
    )

    anomaly_df.rename(ANOMALY_TABLE_COLUMN_NAMES_MAPPER, inplace=True)

    # this is a property that is calculated, so it needs to be assigned separately
    anomaly_df[ANOMALY_TABLE_COLUMN_NAMES_MAPPER["expected_value"]] = [
        point.expected_value for point in anomaly_points
    ]

    with io.StringIO() as buffer:
        anomaly_df.to_csv(buffer, encoding="utf-8")
        csv_data = buffer.getvalue()

    return csv_data


def _format_anomaly_point_for_template(
    points: Sequence[AnomalyPoint], kpi: Kpi, alert: Alert
) -> Sequence[AnomalyPointFormatted]:
    """Formats fields of each point, to be used in alert templates."""
    return list(
        map(
            lambda point: AnomalyPointFormatted.from_point(
                point,
                kpi.anomaly_params.get("frequency"),
                kpi.id,
                kpi.name,
                alert.id,
                alert.alert_name,
                alert.alert_channel,
                alert.alert_channel_conf,
            ),
            points,
        )
    )


# ref: https://stackoverflow.com/a/53287607/11199009
TAnomalyPoint = TypeVar("TAnomalyPoint", bound=AnomalyPointOriginal)


def _top_anomalies(points: Sequence[TAnomalyPoint], n=10) -> Sequence[TAnomalyPoint]:
    """Returns top n anomalies according to severity."""
    return heapq.nlargest(n, points, key=lambda point: point.severity)


def _count_anomalies(points: Sequence[TAnomalyPoint]) -> Tuple[int, int]:
    """Returns a count of overall anomalies and subdim anomalies."""
    total = len(points)
    overall = sum(
        1 for point in points if point.series_type == OVERALL_KPI_SERIES_TYPE_REPR
    )
    subdims = total - overall
    return overall, subdims


def get_top_anomalies_and_counts(
    formatted_anomaly_data: Sequence[AnomalyPointFormatted],
    n: int = 10,
) -> Tuple[Sequence[AnomalyPointFormatted], int, int]:
    """Returns top anomalies and counts of all anomalies for digests.

    Arguments:
        formatted_anomaly_data: list of `AnomalyPointFormatted`s
        n: number of top anomalies to be returned
    """
    overall_count, subdim_count = _count_anomalies(formatted_anomaly_data)

    top_anomalies_ = deepcopy(_top_anomalies(formatted_anomaly_data, n))

    return top_anomalies_, overall_count, subdim_count
