import datetime
from typing import List

from chaos_genius.databases.models.alert_model import Alert
from chaos_genius.databases.models.kpi_model import Kpi
from chaos_genius.databases.models.triggered_alerts_model import TriggeredAlerts

def structure_anomaly_data_for_digests(anomaly_data):

    data = dict()
    for point in anomaly_data:
        if point["data_datetime"] not in data.keys():
            data[point["data_datetime"]] = []
        data[point["data_datetime"]].append(point)

    segregated_data = list(data.items())
    segregated_data.sort(key=lambda arr: arr[0], reverse=True)

    anomaly_data_formatted = []
    for _, arr in segregated_data:
        arr.sort(key=lambda point: point["severity"], reverse=True)
        anomaly_data_formatted.extend(arr)
    
    return anomaly_data_formatted

def get_alert_kpi_configurations(data):
    alert_config_cache = dict()
    kpi_cache = dict()

    alert_conf_ids = set()
    for alert in data:
        alert_conf_ids.add(alert.alert_conf_id)
    alert_conf_ids = list(alert_conf_ids)
    alert_confs = Alert.query.filter(Alert.id.in_(alert_conf_ids)).all()

    alert_config_cache = {alert.id: alert.as_dict for alert in alert_confs}

    kpi_ids = set()
    for alert in data:
        kpi_id = alert.alert_metadata.get("kpi")
        if kpi_id is not None:
            kpi_ids.add(kpi_id)
    kpi_ids = list(kpi_ids)

    kpis = Kpi.query.filter(Kpi.id.in_(kpi_ids)).all()

    kpi_cache = {kpi.id: kpi.as_dict for kpi in kpis}
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
            anomaly_data = []
            count = 0
            subdim_len = 20

            for point in alert.alert_metadata["alert_data"]:
                if point["Dimension"] != "Overall KPI":
                    count += 1
                    if count > subdim_len:
                        continue
                anomaly_data.append(point)

            alert.alert_metadata["alert_data"] = anomaly_data

def _add_nl_messages_anomaly_alerts(anomaly_alerts_data):
    
    for triggered_alert in anomaly_alerts_data:
        for point in triggered_alert.alert_metadata["alert_data"]:
            percentage_change = point.get("percentage_change", None)
            if percentage_change is None:
                point["nl_message"] = "These are older triggered alerts"
                continue
            elif percentage_change == "–":
                change_metric = "Increased"
            else:
                change_metric = "Increased" if percentage_change > 0 else "Decreased"
            point["nl_message"] = f"{change_metric} by ({percentage_change}%)"

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
    _add_nl_messages_anomaly_alerts(anomaly_alerts_data)
    event_alerts_data = [alert for alert in data if alert.alert_type == "Event Alert"]

    return anomaly_alerts_data, event_alerts_data
