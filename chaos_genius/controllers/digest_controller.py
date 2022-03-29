import datetime
from collections import defaultdict
from typing import DefaultDict, Dict, List

from chaos_genius.alerts.constants import (
    ALERT_DATE_FORMAT,
    ALERT_DATETIME_FORMAT,
    DIGEST_DATETIME_FORMAT,
    OVERALL_KPI_SERIES_TYPE_REPR,
)
from chaos_genius.alerts.utils import change_message_from_percent
from chaos_genius.databases.models.alert_model import Alert
from chaos_genius.databases.models.kpi_model import Kpi
from chaos_genius.databases.models.triggered_alerts_model import TriggeredAlerts


def get_alert_kpi_configurations(triggered_alerts: List[TriggeredAlerts]):
    """Gets all alert and KPI configs for given triggered alerts."""
    alert_conf_ids = list(set([alert.alert_conf_id for alert in triggered_alerts]))
    alert_confs = Alert.query.filter(Alert.id.in_(alert_conf_ids)).all()
    alert_config_cache: Dict[int, Alert] = {
        alert.id: alert for alert in alert_confs
    }

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


def triggered_alert_data_processing(data):

    alert_config_cache, kpi_cache = get_alert_kpi_configurations(data)

    for alert in data:
        alert_conf_id = getattr(alert, "alert_conf_id")
        alert_conf = alert_config_cache.get(alert_conf_id, None)

        kpi_id = alert_conf.get("kpi", None)
        kpi = kpi_cache.get(kpi_id) if kpi_id is not None else None

        alert.kpi_name = kpi.get("name") if kpi is not None else "Doesn't Exist"
        alert.kpi_id = kpi_id
        alert.alert_name = alert_conf.get("alert_name")
        alert.alert_channel = alert_conf.get("alert_channel")
        alert.alert_message = alert_conf.get("alert_message")

        if not isinstance(alert_conf.get("alert_channel_conf"), dict):
            alert.alert_channel_conf = None
        else:
            alert.alert_channel_conf = alert_conf.get("alert_channel_conf").get(
                alert.alert_channel, None
            )

    return data


def _filter_anomaly_alerts(
    anomaly_alerts_data: List[TriggeredAlerts], include_subdims: bool = False
):
    if not include_subdims:
        for alert in anomaly_alerts_data:
            alert.alert_metadata["alert_data"] = list(
                filter(
                    lambda point: point["Dimension"] == OVERALL_KPI_SERIES_TYPE_REPR,
                    alert.alert_metadata["alert_data"],
                )
            )
    else:
        for alert in anomaly_alerts_data:
            anomaly_data = []
            counts: DefaultDict[str, int] = defaultdict(lambda: 0)
            max_subdims = 20

            for point in alert.alert_metadata["alert_data"]:
                if point["Dimension"] != OVERALL_KPI_SERIES_TYPE_REPR:
                    counts[point["data_datetime"]] += 1
                    if counts[point["data_datetime"]] > max_subdims:
                        continue

                anomaly_data.append(point)

            alert.alert_metadata["alert_data"] = anomaly_data


def _add_nl_messages_anomaly_alerts(anomaly_alerts_data):
    for triggered_alert in anomaly_alerts_data:
        for point in triggered_alert.alert_metadata["alert_data"]:
            percentage_change = point.get("percentage_change", None)
            if percentage_change is None:
                point["nl_message"] = "Not available for older triggered alerts."
            else:
                point["nl_message"] = change_message_from_percent(percentage_change)


def _preprocess_anomaly_alerts(anomaly_alerts_data: list):
    for triggered_alert in anomaly_alerts_data:
        for point in triggered_alert.alert_metadata["alert_data"]:
            exact_time = point.get("data_datetime")

            if exact_time is None:
                point["date_only"] = "Older Alerts"
            else:
                exact_time = datetime.datetime.strptime(
                    exact_time, ALERT_DATETIME_FORMAT
                )
                point["date_only"] = exact_time.strftime(ALERT_DATE_FORMAT)

    _add_nl_messages_anomaly_alerts(anomaly_alerts_data)


def _preprocess_event_alerts(event_alerts_data: list):
    for triggered_alert in event_alerts_data:
        new_time = triggered_alert.created_at.strftime(DIGEST_DATETIME_FORMAT)
        triggered_alert.date_only = triggered_alert.created_at.strftime(
            ALERT_DATE_FORMAT
        )
        triggered_alert.created_at = new_time


def get_digest_view_data(triggered_alert_id=None, include_subdims: bool = False):

    curr_time = datetime.datetime.now()
    time_diff = datetime.timedelta(days=7)

    filters = [TriggeredAlerts.created_at >= (curr_time - time_diff)]
    if triggered_alert_id is not None:
        filters.append(TriggeredAlerts.id == triggered_alert_id)

    data = (
        TriggeredAlerts.query.filter(*filters)
        .order_by(TriggeredAlerts.created_at.desc())
        .all()
    )
    data = triggered_alert_data_processing(data)

    anomaly_alerts_data = [alert for alert in data if alert.alert_type == "KPI Alert"]
    _filter_anomaly_alerts(anomaly_alerts_data, include_subdims)
    _preprocess_anomaly_alerts(anomaly_alerts_data)
    event_alerts_data = [alert for alert in data if alert.alert_type == "Event Alert"]
    _preprocess_event_alerts(event_alerts_data)

    return anomaly_alerts_data, event_alerts_data
