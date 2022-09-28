"""Controller and helpers for KPI or Anomaly alerts."""
import datetime
import heapq
import io
import logging
from collections import defaultdict
from copy import deepcopy
from typing import (
    Any,
    DefaultDict,
    Dict,
    Iterable,
    Iterator,
    List,
    Optional,
    Sequence,
    Tuple,
    TypeVar,
    Union,
)

import pandas as pd
from pydantic import BaseModel, StrictFloat, StrictInt, root_validator, validator
from pydantic.tools import parse_obj_as

from chaos_genius.alerts.constants import (
    ALERT_DATE_CSV_FILENAME_FORMAT_INDIVIDUAL,
    ALERT_DATE_FORMAT,
    ALERT_DATETIME_FORMAT,
    ALERT_OVERALL_TOP_N,
    ALERT_READABLE_DATA_TIME_ONLY_FORMAT,
    ALERT_READABLE_DATA_TIMESTAMP_FORMAT,
    ALERT_READABLE_DATE_FORMAT,
    ALERT_READABLE_DATETIME_FORMAT,
    ALERT_RELEVANT_SUBDIMS_TOP_N,
    ALERT_SUBDIM_TOP_N,
    ANOMALY_REPORT_COLUMN_NAMES_MAPPER,
    ANOMALY_REPORT_COLUMN_NAMES_ORDERED,
    ANOMALY_TABLE_COLUMN_NAMES_MAPPER,
    ANOMALY_TABLE_COLUMN_NAMES_ORDERED,
    OVERALL_KPI_SERIES_TYPE_REPR,
)
from chaos_genius.alerts.slack import anomaly_alert_slack
from chaos_genius.alerts.utils import (
    AlertException,
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
from chaos_genius.databases.models.alert_model import Alert
from chaos_genius.databases.models.kpi_model import Kpi
from chaos_genius.databases.models.triggered_alerts_model import TriggeredAlerts
from chaos_genius.settings import DAYS_OFFSET_FOR_ANALTYICS
from chaos_genius.utils.utils import jsonable_encoder, make_path_safe

logger = logging.getLogger(__name__)


# ref: https://stackoverflow.com/a/53287607/11199009
TAnomalyPointOrig = TypeVar("TAnomalyPointOrig", bound="AnomalyPointOriginal")


TAnomalyPoint = TypeVar("TAnomalyPoint", bound="AnomalyPoint")


class AnomalyPointOriginal(BaseModel):
    """Representation of a point of anomaly data as received from raw anomaly data."""

    # TODO: could be generated from AnomalyDataOutput model

    # TODO(Samyak): these comments descriptions of fields could be actual docstrings.

    # y-value of point
    y: float
    # model prediction (expected value)
    yhat: Optional[float]
    # lower bound of expected value
    yhat_lower: float
    # upper bound of expected value
    yhat_upper: float
    # severity of the anomaly (0 to 100)
    severity: float
    impact: Optional[float]
    """Impact score of the anomaly.

    Only for sub-dimensional points.
    """

    # overall, subdim or data_quality
    anomaly_type: str
    # subdimension name (when it's a subdim)
    series_type: Optional[Dict[str, str]]

    # timestamp when this entry was added
    created_at: datetime.datetime
    # timestamp of the anomaly point
    data_datetime: datetime.datetime

    @property
    def expected_range(self) -> str:
        """Expected values range represented in a string."""
        return f"{self.yhat_lower} to {self.yhat_upper}"

    @property
    def is_subdim(self) -> bool:
        """Whether this point is a sub-dimensional anomaly."""
        return self.anomaly_type == "subdim"

    @property
    def is_overall(self) -> bool:
        """Whether this point is a overall anomaly."""
        return self.anomaly_type == "overall"

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

    def subdim_name_value(self) -> Optional[Tuple[str, str]]:
        """Return subdimension name and value."""
        return (
            next(iter(self.series_type.items()))
            if self.series_type is not None
            else None
        )

    def subdim_formatted(self) -> Optional[str]:
        """Return subdimension name and value formatted as a string."""
        subdim = self.subdim_name_value()
        if subdim is None:
            return None

        dimension, value = subdim
        return f"[{dimension} = {value}]"

    def subdim_formatted_value_only(self) -> Optional[str]:
        """Return subdimension value formatted as a string."""
        subdim = self.subdim_name_value()
        if subdim is None:
            return None

        _, value = subdim
        return f"[{value}]"

    def is_of_same_type(self, other: "AnomalyPointOriginal") -> bool:
        """Whether this point is of the same type as another point."""
        return (
            self.anomaly_type == other.anomaly_type
            and self.series_type == other.series_type
        )

    @property
    def series_type_name(self) -> str:
        """Readable name of the series type - either Overall or the specific subdim."""
        dim_value = self.subdim_name_value()

        if dim_value is None:
            return OVERALL_KPI_SERIES_TYPE_REPR

        dimension, value = dim_value

        return f"{dimension} = {value}"

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
    # previous data point (y-value)
    previous_value: Optional[float]

    relevant_subdims_: Optional[List]

    @property
    def relevant_subdims(self: TAnomalyPoint) -> Optional[List[TAnomalyPoint]]:
        """Subdimensional anomalies associated with this anomaly.

        Only available when:
        - this anomaly is for Overall KPI.
        - there are subdimensional level anomalies for the same timestamp
          and they are above the severity threshold.

        Why is this an @property instead of just a field?
        - to tie the type of the points returned to the class type.
        - this wouldn't be needed if python had a `Self` type.
        - disadvantage: pydantic cannot check type of `relevant_subdims_` field any more
        """
        return self.relevant_subdims_

    @staticmethod
    def _from_original_single(
        point: AnomalyPointOriginal,
        previous_anomaly_point: Optional[AnomalyPointOriginal],
        relevant_subdims: Optional[List["AnomalyPoint"]],
    ) -> "AnomalyPoint":
        y = round(point.y, 2)
        yhat = round(point.yhat, 2) if point.yhat is not None else None
        yhat_lower = round(point.yhat_lower, 2)
        yhat_upper = round(point.yhat_upper, 2)
        severity = round(point.severity)

        series_type = point.series_type

        previous_value = (
            round(previous_anomaly_point.y, 2)
            if previous_anomaly_point is not None
            else None
        )

        return AnomalyPoint(
            y=y,
            yhat=yhat,
            yhat_lower=yhat_lower,
            yhat_upper=yhat_upper,
            severity=severity,
            impact=point.impact,
            anomaly_type=point.anomaly_type,
            series_type=series_type,
            created_at=point.created_at,
            data_datetime=point.data_datetime,
            previous_value=previous_value,
            relevant_subdims_=relevant_subdims,
        )

    @staticmethod
    def from_original(
        points: List[AnomalyPointOriginal],
        previous_anomaly_points: List[Optional[AnomalyPointOriginal]],
    ) -> List["AnomalyPoint"]:
        """Constructs formatted `AnomalyPoint`s from `AnomalyPointOriginal`s.

        Arguments:
            points: original anomaly points
            previous_anomaly_points: the anomaly point from which change percent will be
                calculated. There must be entry for each anomaly point.
        """
        anomaly_points: List[AnomalyPoint] = []

        overall_points = list(
            filter(
                lambda point: point[0].is_overall,
                zip(points, previous_anomaly_points),
            )
        )

        subdim_points = list(
            AnomalyPoint._from_original_single(point, prev_point, None)
            for point, prev_point in filter(
                lambda point: point[0].is_subdim,
                zip(points, previous_anomaly_points),
            )
        )

        def _get_relevant_subdims(point: AnomalyPointOriginal):
            # subdim points with same timestamp
            relevant_subdims = [
                subdim_point
                for subdim_point in subdim_points
                if subdim_point.data_datetime == point.data_datetime
            ]

            # the sort key is a two tuple. `False` is sorted before `True`, so all the
            # `None`s will be at the end of the list.
            relevant_subdims.sort(
                key=lambda point: (point.impact is None, point.impact), reverse=True
            )

            # remove them from original list
            for subdim_point in relevant_subdims:
                subdim_points.remove(subdim_point)

            return relevant_subdims

        for point, prev_point in overall_points:
            relevant_subdims = _get_relevant_subdims(point)

            point = AnomalyPoint._from_original_single(
                point, prev_point, relevant_subdims
            )

            anomaly_points.append(point)

        # add remaining subdim points
        anomaly_points.extend(subdim_points)

        anomaly_points.sort(key=lambda point: point.severity, reverse=True)

        return anomaly_points

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

    @validator("relevant_subdims_", pre=True)
    def _convert_relevant_subdims(cls, v: Any) -> Optional[List["AnomalyPoint"]]:
        """Convert relevant_subdims_ from `Dict` to `AnomalyPoint`s."""
        if v is None:
            return None

        if all(isinstance(point, dict) for point in v):
            return [AnomalyPoint.parse_obj(point) for point in v]

        return v


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
    percent_change: Union[StrictFloat, StrictInt, str]
    percent_change_formatted: str

    is_hourly: bool

    @staticmethod
    def _from_point_single(
        point: AnomalyPoint,
        time_series_frequency: Optional[str],
        kpi_id: int,
        kpi_name: str,
        alert_id: int,
        alert_name: str,
        alert_channel: str,
        alert_channel_conf: Any,
    ) -> "AnomalyPointFormatted":
        dt_format = ALERT_READABLE_DATETIME_FORMAT
        if time_series_frequency is not None and time_series_frequency == "D":
            dt_format = ALERT_READABLE_DATE_FORMAT
        formatted_date = point.data_datetime.strftime(dt_format)

        percent_change = find_percentage_change(point.y, point.yhat)
        percent_change_formatted = percent_change
        if isinstance(percent_change, (int, float)):
            # TODO: decide on this and simplify
            change_percent = (
                f"{percent_change:.0f}"
                if abs(percent_change) < 10
                else f"{percent_change:.0f}"
            )
            if percent_change > 0:
                percent_change_formatted = f"{change_percent}%"
            else:
                percent_change_formatted = f"{change_percent[1:]}%"
        if (
            isinstance(percent_change, str)
            and percent_change.endswith("inf")
            and point.yhat is not None
        ):
            percent_change_formatted = f"{percent_change}%"

        is_hourly = time_series_frequency is not None and time_series_frequency == "H"

        orig_point = point.dict()
        orig_point["relevant_subdims_"] = (
            AnomalyPointFormatted.from_points(
                point.relevant_subdims,
                time_series_frequency,
                kpi_id,
                kpi_name,
                alert_id,
                alert_name,
                alert_channel,
                alert_channel_conf,
                include_subdims=True,
            )
            if point.relevant_subdims is not None
            else None
        )

        return AnomalyPointFormatted(
            **orig_point,
            kpi_id=kpi_id,
            kpi_name=kpi_name,
            alert_id=alert_id,
            alert_name=alert_name,
            alert_channel=alert_channel,
            alert_channel_conf=alert_channel_conf,
            formatted_date=formatted_date,
            percent_change=percent_change,
            percent_change_formatted=str(percent_change_formatted),
            is_hourly=is_hourly,
        )

    @staticmethod
    def from_points(
        points: Sequence[AnomalyPoint],
        time_series_frequency: Optional[str],
        kpi_id: int,
        kpi_name: str,
        alert_id: int,
        alert_name: str,
        alert_channel: str,
        alert_channel_conf: Any,
        include_subdims: bool,
    ) -> List["AnomalyPointFormatted"]:
        """Constructs formatted points from `AnomalyPoint`s.

        All the points must be from a single alert.
        """
        return [
            AnomalyPointFormatted._from_point_single(
                point,
                time_series_frequency,
                kpi_id,
                kpi_name,
                alert_id,
                alert_name,
                alert_channel,
                alert_channel_conf,
            )
            for point in points
            if point.is_overall or (point.is_subdim and include_subdims)
        ]

    @property
    def y_readable(self):
        """Returns human readable format for y value of anomaly point."""
        return human_readable(self.y)

    @property
    def previous_value_readable(self):
        """Returns human readable format for previous value of anomaly point."""
        return (
            human_readable(self.previous_value)
            if self.previous_value is not None
            else None
        )

    @property
    def yhat_lower_readable(self):
        """Returns human readable format for lower bound of expected range."""
        return human_readable(self.yhat_lower)

    @property
    def yhat_upper_readable(self):
        """Returns human readable format for upper bound of expected range."""
        return human_readable(self.yhat_upper)

    @property
    def anomaly_time_only(self):
        """Returns a readable string of the time (without date) of anomaly."""
        return self.data_datetime.strftime(ALERT_READABLE_DATA_TIME_ONLY_FORMAT).lstrip(
            "0"
        )

    @property
    def previous_point_time_only(self):
        """Returns a readable string of the time (without date) of the previous point.

        Only for hourly!
        """
        data_time_suffix = self.data_datetime.strftime("%p")
        previous_point_time = self.data_datetime - datetime.timedelta(hours=1)
        previous_time_suffix = previous_point_time.strftime("%p")

        # skip the AM/PM suffix if both previous and current point has the same
        if data_time_suffix != previous_time_suffix:
            format = ALERT_READABLE_DATA_TIME_ONLY_FORMAT
        else:
            format = "%I"

        return (previous_point_time).strftime(format).lstrip("0")

    def top_relevant_subdims(self) -> Optional[List["AnomalyPointFormatted"]]:
        """Returns a list of top relevant subdims."""
        if self.relevant_subdims is None:
            return None

        relevant_subdims = (
            subdim for subdim in self.relevant_subdims if subdim is not None
        )

        # take top N
        # since relevant_subdims was a generator, we only process the top N
        # (using a list would process all the elements)
        relevant_subdims = [
            subdim
            for _, subdim in zip(range(ALERT_RELEVANT_SUBDIMS_TOP_N), relevant_subdims)
        ]

        return relevant_subdims

    def kpi_link(self):
        """Returns a link to the KPI."""
        return f"{webapp_url_prefix()}#/dashboard/0/anomaly/{self.kpi_id}"

    def alert_link(self):
        """Returns a link to the edit alert page."""
        return f"{webapp_url_prefix()}#/alerts/edit/kpi-alert/{self.alert_id}"

    def subdim_link(self):
        """Returns a link to the anomaly page with the subdim pre-selected."""
        subdim_name_value = self.subdim_name_value()

        if not subdim_name_value:
            return self.kpi_link()

        dimension, value = subdim_name_value

        return f"{self.kpi_link()}?dimension={dimension}&value={value}"


class AlertsIndividualData(BaseModel):
    """Data for formatting an individual alert."""

    all_points: List[AnomalyPointFormatted]
    top_overall_points: List[AnomalyPointFormatted]
    top_subdim_points: List[AnomalyPointFormatted]

    include_subdims: bool

    alert_id: int
    alert_name: str
    alert_message: str
    alert_channel_conf: Any

    kpi_id: int
    kpi_name: str

    date: datetime.date

    def kpi_link(self):
        """Returns a link to the KPI."""
        return f"{webapp_url_prefix()}#/dashboard/0/anomaly/{self.kpi_id}"

    def alert_dashboard_link(self):
        """Returns a link to the alert dashboard."""
        subdim_part = ""
        if self.include_subdims:
            subdim_part = "&subdims=true"

        return f"{webapp_url_prefix()}api/digest?alert={self.alert_id}{subdim_part}"

    def date_formatted(self):
        """Returns date formatted for readability."""
        return self.date.strftime(ALERT_DATE_FORMAT)

    @staticmethod
    def from_points(
        points: List[AnomalyPoint], alert: Alert, kpi: Kpi, date: datetime.date
    ):
        """Constructs data for formatting an individual alert from anomaly points."""
        top_overall_points = deepcopy(
            top_anomalies(
                [point for point in points if point.is_overall], ALERT_OVERALL_TOP_N
            )
        )
        top_subdim_points = deepcopy(
            top_anomalies(
                [
                    point
                    for point in iterate_over_all_points(
                        points, include_subdims=alert.include_subdims
                    )
                    if point.is_subdim
                ],
                ALERT_SUBDIM_TOP_N,
            )
        )

        top_overall_points = list(
            _format_anomaly_point_for_template(top_overall_points, kpi, alert)
        )
        top_subdim_points = list(
            _format_anomaly_point_for_template(top_subdim_points, kpi, alert)
        )

        all_points = list(
            _format_anomaly_point_for_template(points, kpi, alert, include_subdims=True)
        )

        return AlertsIndividualData(
            all_points=all_points,
            top_overall_points=top_overall_points,
            top_subdim_points=top_subdim_points,
            include_subdims=alert.include_subdims,
            alert_id=alert.id,
            alert_name=alert.alert_name,
            alert_message=alert.alert_message,
            alert_channel_conf=alert.alert_channel_conf,
            kpi_id=kpi.id,
            kpi_name=kpi.name,
            date=date,
        )


def _find_point(point: AnomalyPointOriginal, prev_data: List[AnomalyPointOriginal]):
    """Finds same type of point in previous data."""
    intended_point = None
    for prev_point in prev_data:
        if prev_point.is_of_same_type(point):
            intended_point = prev_point
            break
    return intended_point


GenericAnomalyPoint = TypeVar("GenericAnomalyPoint", bound=AnomalyPointOriginal)


class AnomalyAlertController:
    """Controller for KPI/anomaly alerts."""

    def __init__(
        self, alert: Alert, last_anomaly_timestamp: Optional[datetime.datetime] = None
    ):
        """Initializes a KPI/anomaly alerts controller.

        Note: an AnomalyAlertController instance must only be used for one check/trigger
        of an alert. The same object must not be re-used.

        Arguments:
            alert: object of the Alert model for which to send alerts
            last_anomaly_timestamp: (override) the anomaly timestamp after which to
                check. Defaults to the last_anomaly_timestamp stored in the given alert.
        """
        self.alert = alert
        self.alert_id: int = self.alert.id
        self.kpi_id: int = self.alert.kpi
        self.now = datetime.datetime.now()

        self._last_anomaly_timestamp_override = last_anomaly_timestamp

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

        by_date_original = self._split_anomalies_by_data_timestamp(anomaly_data)
        by_date = {
            date: self._format_anomaly_data(anomaly_points, date)
            for date, anomaly_points in by_date_original.items()
        }

        latest_day = max(by_date.keys())
        latest_day_data = by_date[latest_day]

        if len(by_date) > 1:
            logger.warn(
                f"(Alert: {self.alert_id}, KPI: {self.kpi_id}) "
                "Multiple days of data found for a single trigger. Splitting. "
                "Only alerts for %s will be sent, rest will only be stored.",
                latest_day.isoformat(),
            )

        # TODO: last_anomaly_timestamp can be updated even if no anomaly exists.
        self._update_alert_metadata(self.alert)

        # TODO: will always be True?
        status = True

        for date, formatted_anomaly_data in sorted(by_date.items()):
            logger.info(
                (
                    f"(Alert: {self.alert_id}, KPI: {self.kpi_id}) "
                    "saving TriggeredAlerts for %s"
                ),
                date.isoformat(),
            )

            self._save_triggered_alerts(status, formatted_anomaly_data)

        if self._to_send_individual():
            logger.info(
                f"(Alert: {self.alert_id}, KPI: {self.kpi_id}) "
                "Sending alert for %s.",
                latest_day.isoformat(),
            )

            # check if anomalies actually exist.
            # in case subdims is disabled, this won't send an alert
            #   if no overall anomalies are detected.
            if not any(
                iterate_over_all_points(
                    latest_day_data,
                    include_subdims=self.alert.include_subdims,
                ),
            ):
                logger.info(
                    f"(Alert: {self.alert_id}, KPI: {self.kpi_id}) "
                    "No anomalies found. Not sending alerts only storing them."
                )
            else:
                kpi = self._get_kpi()
                individual_data = AlertsIndividualData.from_points(
                    latest_day_data, self.alert, kpi, latest_day
                )

                if self.alert.alert_channel == "email":
                    self._send_email_alert(individual_data)
                elif self.alert.alert_channel == "slack":
                    self._send_slack_alert(individual_data)
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

        return status

    def _split_anomalies_by_data_timestamp(
        self, anomaly_data: List[GenericAnomalyPoint]
    ) -> DefaultDict[datetime.date, List[GenericAnomalyPoint]]:
        anomaly_data = sorted(
            anomaly_data,
            key=lambda point: (point.data_datetime, point.severity),
        )

        # split anomalies by date of occurence.
        # with this, it can be assumed that one TriggeredAlerts row has alert_data for
        #   one day only.
        by_date: DefaultDict[datetime.date, List[GenericAnomalyPoint]] = defaultdict(
            list
        )
        for anomaly_point in anomaly_data:
            by_date[anomaly_point.data_datetime.date()].append(anomaly_point)

        return by_date

    def _last_anomaly_timestamp(self) -> Optional[datetime.datetime]:
        return (
            self._last_anomaly_timestamp_override or self.alert.last_anomaly_timestamp
        )

    def _get_anomalies(
        self,
        this_date_after_time_only: Optional[datetime.datetime] = None,
        anomalies_only: bool = True,
        include_severity_cutoff: bool = True,
    ) -> List[AnomalyPointOriginal]:
        last_anomaly_timestamp = self._last_anomaly_timestamp()

        if this_date_after_time_only:
            # only consider anomalies on and after given time of that day
            start_timestamp = this_date_after_time_only
            include_start_timestamp = True

            end_timestamp = datetime.datetime.combine(
                this_date_after_time_only.date(), datetime.time()
            ) + datetime.timedelta(days=1)
            include_end_timestamp = False
        else:
            if last_anomaly_timestamp is not None:
                # when last_anomaly_timestamp is available
                #   get data after last_anomaly_timestamp
                start_timestamp = last_anomaly_timestamp
                include_start_timestamp = False
            else:
                # when it's the first time we're running anomaly.
                # we need to check for alerts on today-offset day
                # because that's the day being considered for alert digest.
                start_timestamp = datetime.date.today() - datetime.timedelta(
                    days=DAYS_OFFSET_FOR_ANALTYICS
                )
                start_timestamp = datetime.datetime.combine(
                    start_timestamp, datetime.time()
                )
                include_start_timestamp = True

            end_timestamp = self.latest_anomaly_timestamp
            include_end_timestamp = True

        severity_cutoff = (
            self.alert.severity_cutoff_score if include_severity_cutoff else None
        )

        logger.info(
            f"Getting anomaly data for (KPI: {self.kpi_id}, Alert: "
            f"{self.alert_id}) in the range - start: {start_timestamp} (included: "
            f"{include_start_timestamp}) and end: {end_timestamp} "
            f"(included: {include_end_timestamp})"
        )

        anomaly_data = get_anomaly_data(
            [self.kpi_id],
            anomaly_types=["overall", "subdim"],
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
            created_at=self.now,
            alert_metadata=alert_metadata,
        )

        triggered_alert.update(commit=True)
        logger.info(
            f"(Alert: {self.alert_id}, KPI: {self.kpi_id}) "
            "The triggered alert data was successfully stored.",
        )

    def _find_previous_points(
        self, anomaly_data: List[AnomalyPointOriginal], date: datetime.date
    ) -> List[Optional[AnomalyPointOriginal]]:
        kpi = self._get_kpi()

        time_series_freq: Optional[str] = kpi.anomaly_params.get("frequency")

        current_day_start = datetime.datetime.combine(date, datetime.time())

        # get previous anomaly point for comparison
        prev_day_data = self._get_anomalies(
            this_date_after_time_only=(
                current_day_start - datetime.timedelta(days=1, hours=0, minutes=0)
            ),
            anomalies_only=False,
            include_severity_cutoff=False,
        )

        previous_points: List[Optional[AnomalyPointOriginal]]

        if time_series_freq == "D":
            # daily granularity - find point in the previous day
            previous_points = [
                _find_point(point, prev_day_data) for point in anomaly_data
            ]
        elif time_series_freq == "H":
            # get current day's data for comparison
            cur_day_data = self._get_anomalies(
                this_date_after_time_only=current_day_start,
                anomalies_only=False,
                include_severity_cutoff=False,
            )

            # store a mapping of hour => list of anomaly points for that hour
            hourly_data: DefaultDict[int, List[AnomalyPointOriginal]] = defaultdict(
                list
            )
            for point in cur_day_data:
                hourly_data[point.data_datetime.hour].append(point)

            # used only when a point is present for 00:00
            #  - the previous point in that case will be previous day's 11PM data
            for point in prev_day_data:
                if point.data_datetime.hour == 23:
                    hourly_data[-1].append(point)

            # hourly granularity - find previous hour data
            previous_points = [
                _find_point(point, hourly_data.get(point.data_datetime.hour - 1, []))
                for point in anomaly_data
            ]
        else:
            raise AlertException(
                f"Time series frequency not found or invalid: {time_series_freq}",
                alert_id=self.alert_id,
                kpi_id=self.kpi_id,
            )

        return previous_points

    def _format_anomaly_data(
        self, anomaly_data: List[AnomalyPointOriginal], date: datetime.date
    ) -> List[AnomalyPoint]:

        previous_points = self._find_previous_points(anomaly_data, date)

        formatted_anomaly_data = AnomalyPoint.from_original(
            anomaly_data, previous_points
        )

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

    def _send_email_alert(
        self,
        individual_data: AlertsIndividualData,
    ) -> None:
        alert_channel_conf = individual_data.alert_channel_conf

        if not isinstance(alert_channel_conf, dict):
            raise AlertException(
                f"Alert channel config was not a dict. Got: {alert_channel_conf}",
                alert_id=individual_data.alert_id,
                kpi_id=individual_data.kpi_id,
            )

        recipient_emails = alert_channel_conf.get("email")

        if not recipient_emails:
            raise AlertException(
                f"No recipient emails found. Got: {recipient_emails}",
                alert_id=individual_data.alert_id,
                kpi_id=individual_data.kpi_id,
            )

        subject = (
            f"{individual_data.alert_name} - Chaos Genius Alert "
            f"({individual_data.date.strftime('%b %d')})❗"
        )

        # attach CSV of anomaly data
        filename_date = individual_data.date.strftime(
            ALERT_DATE_CSV_FILENAME_FORMAT_INDIVIDUAL
        )
        files = [
            {
                "fname": (
                    f"chaosgenius_alert_{make_path_safe(individual_data.kpi_name)}"
                    f"_{filename_date}.csv"
                ),
                "fdata": make_anomaly_data_csv(
                    list(
                        iterate_over_all_points(
                            individual_data.all_points, individual_data.include_subdims
                        )
                    )
                ),
                "mime_maintype": "text",
                "mime_subtype": "csv",
            }
        ]

        send_email_using_template(
            "email_alert.html",
            recipient_emails,
            subject,
            files,
            data=individual_data,
            preview_text="Anomaly Alert",
        )

        logger.info(
            f"(Alert: {self.alert_id}, KPI: {self.kpi_id}) The email alert was "
            "successfully sent"
        )

    def _send_slack_alert(
        self,
        individual_data: AlertsIndividualData,
    ):
        err = anomaly_alert_slack(
            individual_data,
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


def make_anomaly_data_csv(
    all_anomaly_points: List[AnomalyPointFormatted], for_report=False
) -> str:
    """Create an in-memory string containing the CSV of given anomaly data.

    Note: all_anomaly_points must come from `iterate_over_all_points`.
    """
    column_name_mapper = (
        ANOMALY_TABLE_COLUMN_NAMES_MAPPER
        if not for_report
        else ANOMALY_REPORT_COLUMN_NAMES_MAPPER
    )

    column_names_ordered = (
        ANOMALY_TABLE_COLUMN_NAMES_ORDERED
        if not for_report
        else ANOMALY_REPORT_COLUMN_NAMES_ORDERED
    )

    anomaly_df = pd.DataFrame(
        [point.dict(include=column_name_mapper.keys()) for point in all_anomaly_points]
    )

    anomaly_df.sort_values(by="severity", inplace=True, ascending=False)

    # this is a property that is calculated, so it needs to be assigned separately
    anomaly_df["expected_range"] = [
        point.expected_range for point in all_anomaly_points
    ]
    # this is a property that is calculated, so it needs to be assigned separately
    anomaly_df["series_type"] = [point.series_type_name for point in all_anomaly_points]
    if for_report:
        anomaly_df["kpi_name"] = [point.kpi_name for point in all_anomaly_points]

    anomaly_df = anomaly_df[column_names_ordered]

    anomaly_df.rename(column_name_mapper, inplace=True, axis="columns")

    with io.StringIO() as buffer:
        anomaly_df.to_csv(buffer, index=False, encoding="utf-8")
        csv_data = buffer.getvalue()

    return csv_data


def _format_anomaly_point_for_template(
    points: Sequence[AnomalyPoint],
    kpi: Kpi,
    alert: Alert,
    include_subdims: Optional[bool] = None,
) -> Sequence[AnomalyPointFormatted]:
    """Formats fields of each point, to be used in alert templates."""
    return AnomalyPointFormatted.from_points(
        points,
        kpi.anomaly_params.get("frequency"),
        kpi.id,
        kpi.name,
        alert.id,
        alert.alert_name,
        alert.alert_channel,
        alert.alert_channel_conf,
        include_subdims if include_subdims is not None else alert.include_subdims,
    )


def top_anomalies(points: Iterable[TAnomalyPointOrig], n=10) -> List[TAnomalyPointOrig]:
    """Returns top n anomalies according to severity."""
    # TODO: how to incorporate impact here?
    return heapq.nlargest(n, points, key=lambda point: point.severity)


def iterate_over_all_points(
    points: List[TAnomalyPoint], include_subdims: bool
) -> Iterator[TAnomalyPoint]:
    """Return an iterator over all points (overall and subdims) in the list.

    Not sorted, but the order can be expected to be the same everytime.
    """
    for point in points:
        if point.is_overall or (point.is_subdim and include_subdims):
            yield point

        if point.is_overall and point.relevant_subdims is not None and include_subdims:
            for subdim_point in point.relevant_subdims:
                yield subdim_point
