import datetime
import logging
from collections import defaultdict
from typing import DefaultDict, Dict, List, Optional, Sequence, Tuple

from chaos_genius.alerts.anomaly_alerts import AnomalyPoint, AnomalyPointFormatted
from chaos_genius.alerts.constants import (
    ALERT_DATE_FORMAT,
    ALERT_READABLE_DATA_TIMESTAMP_FORMAT,
    OVERALL_KPI_SERIES_TYPE_REPR,
)
from chaos_genius.databases.models.alert_model import Alert
from chaos_genius.databases.models.kpi_model import Kpi
from chaos_genius.databases.models.triggered_alerts_model import TriggeredAlerts

logger = logging.getLogger(__name__)


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
) -> TriggeredAlerts:
    """Preprocess a triggered alert for use in digests and alerts dashboard."""
    alert_conf_id = triggered_alert.alert_conf_id
    alert_conf = alert_config_cache[alert_conf_id]

    kpi_id = alert_conf.kpi
    kpi = kpi_cache.get(kpi_id)

    # TODO: make a dataclass for this
    triggered_alert.kpi_id = kpi_id
    triggered_alert.kpi_name = kpi.name if kpi is not None else "Doesn't Exist"
    triggered_alert.alert_name = alert_conf.alert_name
    triggered_alert.alert_channel = alert_conf.alert_channel
    triggered_alert.alert_channel_conf = alert_conf.alert_channel_conf
    triggered_alert.alert_message = alert_conf.alert_message

    if not isinstance(alert_conf.alert_channel_conf, dict):
        triggered_alert.alert_channel_conf = None
    else:
        # in case of email, this makes triggered_alert.alert_channel_conf the list of
        #  emails
        triggered_alert.alert_channel_conf = getattr(
            alert_conf, "alert_channel_conf", {}
        ).get(triggered_alert.alert_channel)

    return triggered_alert


def extract_anomaly_points_from_triggered_alerts(
    triggered_alerts: List[TriggeredAlerts], kpi_cache: Dict[int, Kpi]
) -> List[AnomalyPointFormatted]:
    """Extracts all anomaly points from given (anomaly/KPI) triggered alerts.

    Arguments:
        triggered_alerts: the sequence of triggered alerts to extract points from. Must
            be anomaly alerts.
        kpi_cache: obtained from `get_alert_kpi_configurations`
    """
    anomaly_points: List[AnomalyPointFormatted] = []
    for triggered_alert in triggered_alerts:
        for point in triggered_alert.alert_metadata["alert_data"]:

            try:
                point = AnomalyPointFormatted.from_point(
                    AnomalyPoint.parse_obj(point),
                    time_series_frequency=getattr(
                        kpi_cache.get(triggered_alert.kpi_id), "anomaly_params", {}
                    ).get("frequency"),
                    kpi_id=triggered_alert.kpi_id,
                    kpi_name=triggered_alert.kpi_name,
                    alert_id=triggered_alert.alert_conf_id,
                    alert_name=triggered_alert.alert_name,
                    alert_channel=triggered_alert.alert_channel,
                    alert_channel_conf=triggered_alert.alert_channel_conf,
                )

                anomaly_points.append(point)
            except OverflowError as e:
                logger.error(
                    "Error in extracting an anomaly point from triggered alert",
                    exc_info=e,
                )

    return anomaly_points


def _preprocess_triggered_alerts(
    triggered_alerts: Sequence[TriggeredAlerts],
    alert_config_cache: Dict[int, Alert],
    kpi_cache: Dict[int, Kpi],
) -> List[TriggeredAlerts]:
    """Preprocess triggered alerts for use in the Alert Dashboard."""
    return [
        preprocess_triggered_alert(ta, alert_config_cache, kpi_cache)
        for ta in triggered_alerts
    ]


def _filter_anomaly_alerts(
    anomaly_points: Sequence[AnomalyPointFormatted], include_subdims: bool = False
) -> List[AnomalyPointFormatted]:
    if not include_subdims:
        return [
            point
            for point in anomaly_points
            if point.series_type == OVERALL_KPI_SERIES_TYPE_REPR
        ]
    else:
        counts: DefaultDict[Tuple[int, datetime.datetime], int] = defaultdict(lambda: 0)
        filtered_points: List[AnomalyPointFormatted] = []
        max_subdims = 20

        for point in anomaly_points:

            if point.series_type != OVERALL_KPI_SERIES_TYPE_REPR:
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
    triggered_alert_id: Optional[int] = None, include_subdims: bool = False
):
    """Collects triggered alerts data for alerts dashboard."""
    curr_time = datetime.datetime.now()
    time_diff = datetime.timedelta(days=7)

    filters = [TriggeredAlerts.created_at >= (curr_time - time_diff)]
    if triggered_alert_id is not None:
        filters.append(TriggeredAlerts.id == triggered_alert_id)

    triggered_alerts: Sequence[TriggeredAlerts] = (
        TriggeredAlerts.query.filter(*filters)
        .order_by(TriggeredAlerts.created_at.desc())
        .all()
    )

    alert_config_cache, kpi_cache = get_alert_kpi_configurations(triggered_alerts)

    triggered_alerts = _preprocess_triggered_alerts(
        triggered_alerts, alert_config_cache, kpi_cache
    )

    anomaly_alerts = extract_anomaly_points_from_triggered_alerts(
        [alert for alert in triggered_alerts if alert.alert_type == "KPI Alert"],
        kpi_cache,
    )
    anomaly_alerts = _filter_anomaly_alerts(anomaly_alerts, include_subdims)
    event_alerts_data = [
        alert for alert in triggered_alerts if alert.alert_type == "Event Alert"
    ]
    _preprocess_event_alerts(event_alerts_data)

    return anomaly_alerts, event_alerts_data
