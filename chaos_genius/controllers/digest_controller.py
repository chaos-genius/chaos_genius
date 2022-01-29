import datetime
from typing import List

from chaos_genius.databases.models.triggered_alerts_model import TriggeredAlerts
from chaos_genius.databases.models.alert_model import Alert
from chaos_genius.databases.models.kpi_model import Kpi


def get_alert_kpi_configurations(data):
    alert_config_cache = dict()
    kpi_cache = dict()

    alert_conf_ids = set()
    for alert in data:
        alert_conf_ids.add(getattr(alert, "alert_conf_id"))
    alert_conf_ids = list(alert_conf_ids)
    alert_confs = Alert.query.filter(Alert.id.in_(alert_conf_ids)).all()

    alert_config_cache = {alert.id: alert for alert in alert_confs}

    kpi_ids = set()
    for alert in data:
        kpi_id = alert.alert_metadata.get("kpi")
        if kpi_id is not None:
            kpi_ids.add(kpi_id)
    kpi_ids = list(kpi_ids)

    kpis = Kpi.query.filter(Kpi.id.in_(kpi_ids)).all()

    kpi_cache = {kpi.id: kpi for kpi in kpis}
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
                    lambda point: point["Dimension"] == "Overall KPI",
                    alert.alert_metadata["alert_data"],
                )
            )
    else:
        for alert in anomaly_alerts_data:
            overall_anomaly_points = list(
                filter(
                    lambda point: point["Dimension"] == "Overall KPI",
                    alert.alert_metadata["alert_data"],
                )
            )

            subdim_anomaly_points = list(
                filter(
                    lambda point: point["Dimension"] != "Overall KPI",
                    alert.alert_metadata["alert_data"],
                )
            )

            subdim_anomaly_points = subdim_anomaly_points[0:20]
            alert.alert_metadata["alert_data"] = (
                overall_anomaly_points + subdim_anomaly_points
            )

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
    event_alerts_data = [alert for alert in data if alert.alert_type == "Event Alert"]

    return anomaly_alerts_data, event_alerts_data
