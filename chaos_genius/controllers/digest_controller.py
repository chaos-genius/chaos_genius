import datetime
import logging
from collections import defaultdict
from typing import Any, DefaultDict, Dict, List, Optional, Sequence, Tuple
from urllib.parse import quote_plus

from pydantic import BaseModel
from sqlalchemy import and_, or_

from chaos_genius.alerts.anomaly_alerts import (
    AnomalyPoint,
    AnomalyPointFormatted,
    iterate_over_all_points,
    top_anomalies,
)
from chaos_genius.alerts.constants import (
    ALERT_DATE_FORMAT,
    ALERT_READABLE_DATA_TIMESTAMP_FORMAT,
    ALERT_REPORT_OVERALL_TOP_N,
    ALERT_REPORT_SUBDIM_TOP_N,
)
from chaos_genius.alerts.utils import webapp_url_prefix
from chaos_genius.databases.models.alert_model import Alert
from chaos_genius.databases.models.kpi_model import Kpi
from chaos_genius.databases.models.triggered_alerts_model import (
    TriggeredAlerts,
    triggered_alerts_data_datetime,
)

logger = logging.getLogger(__name__)


class TriggeredAlertData(BaseModel):
    """Representation of a TriggeredAlerts row with some additional data."""

    # TODO: could have been derived from the TriggeredAlerts model

    id: int
    alert_conf_id: int
    alert_type: str
    alert_metadata: Any
    alert_name: str
    alert_channel: str
    alert_channel_conf: Any
    alert_message: str

    kpi_id: int
    kpi_name: str

    include_subdims: bool

    created_at: datetime.datetime

    # only used by event alerts
    date_only: str = ""


class TriggeredAlertWithPoints(TriggeredAlertData):
    """TriggeredAlertData but with anomaly points."""

    points: List[AnomalyPointFormatted]

    @staticmethod
    def from_triggered_alert_data(
        data: TriggeredAlertData, points: List[AnomalyPointFormatted]
    ) -> "TriggeredAlertWithPoints":
        """Create a TriggeredAlertWithPoints from a TriggeredAlertData."""
        return TriggeredAlertWithPoints(
            **data.dict(),
            points=points,
        )


class AlertsReportData(BaseModel):
    """Data for formatting an alert report."""

    triggered_alerts: List[TriggeredAlertWithPoints]

    report_date: datetime.date

    top_overall_anomalies: List[AnomalyPointFormatted]

    top_subdim_anomalies: List[AnomalyPointFormatted]

    @staticmethod
    def from_triggered_alerts(
        triggered_alerts: List[TriggeredAlertWithPoints], report_date: datetime.date
    ) -> "AlertsReportData":
        """Create an AlertsReportData."""
        # consider only top 1 subdim per alert
        subdim_points_per_trig_alert = [
            top_anomalies(
                (
                    point
                    for point in iterate_over_all_points(
                        trig_alert.points, trig_alert.include_subdims
                    )
                    if point.is_subdim
                ),
                1,
            )
            for trig_alert in triggered_alerts
        ]

        top_overall_anomalies = top_anomalies(
            [
                point
                for trig_alert in triggered_alerts
                for point in trig_alert.points
                if point.is_overall
            ],
            ALERT_REPORT_OVERALL_TOP_N,
        )

        top_subdim_anomalies = top_anomalies(
            [point for points in subdim_points_per_trig_alert for point in points],
            ALERT_REPORT_SUBDIM_TOP_N,
        )

        return AlertsReportData(
            triggered_alerts=triggered_alerts,
            report_date=report_date,
            top_overall_anomalies=top_overall_anomalies,
            top_subdim_anomalies=top_subdim_anomalies,
        )

    def all_points(self) -> List[AnomalyPointFormatted]:
        """All anomaly points considered in the report."""
        points = [
            point
            for trig_alert in self.triggered_alerts
            for point in iterate_over_all_points(trig_alert.points, True)
        ]

        return points

    @property
    def has_anomalies(self) -> bool:
        """Whether any anomalies have been observed."""
        return bool(self.top_overall_anomalies or self.top_subdim_anomalies)

    @staticmethod
    def kpi_link_prefix() -> str:
        """Return the prefix used to generate a KPI link."""
        return f"{webapp_url_prefix()}#/dashboard/0/anomaly"

    def alert_dashboard_link(self) -> str:
        """Return the link to the alert dashboard."""
        subdim_part = ""
        if self.top_subdim_anomalies:
            subdim_part = "&subdims=true"

        return (
            f"{webapp_url_prefix()}api/digest"
            + "?date="
            + quote_plus(self.report_date.strftime(ALERT_DATE_FORMAT))
            + subdim_part
        )

    def report_date_formatted(self) -> str:
        """Return the report date formatted for readability."""
        return self.report_date.strftime(ALERT_DATE_FORMAT)


def get_alert_kpi_configurations(triggered_alerts: Sequence[TriggeredAlerts]):
    """Gets all alert and KPI configs for given triggered alerts."""
    alert_conf_ids = list(set([alert.alert_conf_id for alert in triggered_alerts]))
    alert_confs = Alert.query.filter(Alert.id.in_(alert_conf_ids)).all()
    alert_config_cache: Dict[int, Alert] = {alert.id: alert for alert in alert_confs}

    kpi_ids = list(
        set(
            [
                alert.alert_metadata.get("kpi")
                for alert in triggered_alerts
                if alert.alert_metadata.get("kpi") is not None
            ]
        )
    )
    kpis = Kpi.query.filter(Kpi.id.in_(kpi_ids)).all()
    kpi_cache: Dict[int, Kpi] = {kpi.id: kpi for kpi in kpis}

    return alert_config_cache, kpi_cache


def preprocess_triggered_alert(
    triggered_alert: TriggeredAlerts,
    alert_config_cache: Dict[int, Alert],
    kpi_cache: Dict[int, Kpi],
) -> TriggeredAlertWithPoints:
    """Preprocess a triggered alert for use in digests and alerts dashboard."""
    alert_conf_id = triggered_alert.alert_conf_id
    alert_conf = alert_config_cache[alert_conf_id]

    kpi_id = alert_conf.kpi
    kpi = kpi_cache.get(kpi_id)

    triggered_alert_data = TriggeredAlertData(
        id=triggered_alert.id,
        alert_conf_id=triggered_alert.alert_conf_id,
        alert_type=triggered_alert.alert_type,
        alert_metadata=triggered_alert.alert_metadata,
        created_at=triggered_alert.created_at,
        # using sentinel values here since this is only possible for event alerts
        kpi_id=kpi_id if kpi_id is not None else 0,
        kpi_name=kpi.name if kpi is not None else "KPI does not exist",
        alert_name=alert_conf.alert_name,
        alert_channel=alert_conf.alert_channel,
        alert_channel_conf=alert_conf.alert_channel_conf,
        alert_message=alert_conf.alert_message,
        include_subdims=alert_conf.include_subdims,
    )

    if not isinstance(alert_conf.alert_channel_conf, dict):
        triggered_alert_data.alert_channel_conf = None
    else:
        # in case of email, this makes triggered_alert.alert_channel_conf the list of
        #  emails
        triggered_alert_data.alert_channel_conf = getattr(
            alert_conf, "alert_channel_conf", {}
        ).get(triggered_alert_data.alert_channel)

    if triggered_alert.alert_type == "KPI Alert":
        points = extract_anomaly_points_from_triggered_alerts(
            [triggered_alert_data], kpi_cache
        )
    else:
        points = []

    return TriggeredAlertWithPoints.from_triggered_alert_data(
        triggered_alert_data, points
    )


def extract_anomaly_points_from_triggered_alerts(
    triggered_alerts: List[TriggeredAlertData], kpi_cache: Dict[int, Kpi]
) -> List[AnomalyPointFormatted]:
    """Extracts all anomaly points from given (anomaly/KPI) triggered alerts.

    Arguments:
        triggered_alerts: the sequence of triggered alerts to extract points from. Must
            be anomaly alerts.
        kpi_cache: obtained from `get_alert_kpi_configurations`
    """
    anomaly_points: List[AnomalyPointFormatted] = []
    for triggered_alert in triggered_alerts:
        trig_alert_points: List[AnomalyPoint] = []
        for point in triggered_alert.alert_metadata["alert_data"]:
            try:
                trig_alert_points.append(AnomalyPoint.parse_obj(point))
            except OverflowError as e:
                logger.error(
                    "Error in extracting an anomaly point from triggered alert",
                    exc_info=e,
                )

        anomaly_params = getattr(
            kpi_cache.get(triggered_alert.kpi_id), "anomaly_params", {}
        )

        # consider only KPIs which have anomaly enabled
        if anomaly_params is not None:
            anomaly_points.extend(
                AnomalyPointFormatted.from_points(
                    trig_alert_points,
                    time_series_frequency=anomaly_params.get("frequency"),
                    kpi_id=triggered_alert.kpi_id,
                    kpi_name=triggered_alert.kpi_name,
                    alert_id=triggered_alert.alert_conf_id,
                    alert_name=triggered_alert.alert_name,
                    alert_channel=triggered_alert.alert_channel,
                    alert_channel_conf=triggered_alert.alert_channel_conf,
                    include_subdims=triggered_alert.include_subdims,
                )
            )

    return anomaly_points


def _preprocess_triggered_alerts(
    triggered_alerts: Sequence[TriggeredAlerts],
    alert_config_cache: Dict[int, Alert],
    kpi_cache: Dict[int, Kpi],
) -> List[TriggeredAlertWithPoints]:
    """Preprocess triggered alerts for use in the Alert Dashboard."""
    return [
        preprocess_triggered_alert(ta, alert_config_cache, kpi_cache)
        for ta in triggered_alerts
    ]


def _filter_anomaly_alerts(
    anomaly_points: Sequence[AnomalyPointFormatted], include_subdims: bool = False
) -> List[AnomalyPointFormatted]:
    if not include_subdims:
        return [point for point in anomaly_points if point.is_overall]
    else:
        counts: DefaultDict[Tuple[int, datetime.datetime], int] = defaultdict(lambda: 0)
        filtered_points: List[AnomalyPointFormatted] = []
        max_subdims = 20

        for point in anomaly_points:

            if point.is_subdim:
                counts[(point.alert_id, point.data_datetime)] += 1
                if counts[(point.alert_id, point.data_datetime)] > max_subdims:
                    continue

            filtered_points.append(point)

        return filtered_points


def _preprocess_event_alerts(event_alerts_data: list):
    for triggered_alert in event_alerts_data:
        new_time = triggered_alert.created_at.strftime(
            ALERT_READABLE_DATA_TIMESTAMP_FORMAT
        )
        triggered_alert.date_only = triggered_alert.created_at.strftime(
            ALERT_DATE_FORMAT
        )
        triggered_alert.created_at = new_time


def get_digest_view_data(
    triggered_alert_id: Optional[int] = None,
    include_subdims: bool = False,
    date: Optional[datetime.date] = None,
):
    """Collects triggered alerts data for alerts dashboard."""
    filters = []

    if date is None:
        curr_time = datetime.datetime.now()
        time_diff = datetime.timedelta(days=7)
        time_lower_bound = curr_time - time_diff

        filters.append(
            or_(
                triggered_alerts_data_datetime() >= time_lower_bound,
                TriggeredAlerts.alert_type == "Event Alert",
            )
        )
        logger.info(
            "Digest: looking for anomalies after %s", time_lower_bound.isoformat()
        )
    else:
        filters.append(
            or_(
                and_(
                    triggered_alerts_data_datetime()
                    >= datetime.datetime.combine(date, datetime.time()),
                    triggered_alerts_data_datetime()
                    < datetime.datetime.combine(
                        date + datetime.timedelta(days=1), datetime.time()
                    ),
                ),
                TriggeredAlerts.alert_type == "Event Alert",
            )
        )
        logger.info("Digest: looking for anomalies on %s", date)

    if triggered_alert_id is not None:
        filters.append(TriggeredAlerts.id == triggered_alert_id)

    triggered_alerts: Sequence[TriggeredAlerts] = (
        TriggeredAlerts.query.filter(*filters)
        .order_by(TriggeredAlerts.created_at.desc())
        .all()
    )

    alert_config_cache, kpi_cache = get_alert_kpi_configurations(triggered_alerts)

    triggered_alerts_data = [
        triggered_alert
        for triggered_alert in _preprocess_triggered_alerts(
            triggered_alerts, alert_config_cache, kpi_cache
        )
    ]

    anomaly_alerts = extract_anomaly_points_from_triggered_alerts(
        [alert for alert in triggered_alerts_data if alert.alert_type == "KPI Alert"],
        kpi_cache,
    )
    anomaly_alerts = list(iterate_over_all_points(anomaly_alerts, True))
    anomaly_alerts = _filter_anomaly_alerts(anomaly_alerts, include_subdims)
    # newest data first
    anomaly_alerts.sort(key=lambda point: point.data_datetime, reverse=True)

    event_alerts_data = [
        alert for alert in triggered_alerts_data if alert.alert_type == "Event Alert"
    ]
    _preprocess_event_alerts(event_alerts_data)

    return anomaly_alerts, event_alerts_data
