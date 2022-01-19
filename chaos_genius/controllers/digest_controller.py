import datetime

from chaos_genius.databases.models.triggered_alerts_model import TriggeredAlerts
from chaos_genius.databases.models.alert_model import Alert
from chaos_genius.databases.models.kpi_model import Kpi

def triggered_alert_data_processing(data):
    alert_config_cache = dict()
    kpi_cache = dict()

    for alert in data:
        id_ = getattr(alert, "alert_conf_id")
        alert_conf = None
        if id_ in alert_config_cache.keys():
            alert_conf = alert_config_cache.get(id_)
        else:
            alert_conf = Alert.query.filter(Alert.id == id_).first().as_dict
            alert_config_cache[id_] = alert_conf
            
        kpi_id = alert_conf.get("kpi")
        kpi = None
        if kpi_id is not None:
            if kpi_id in kpi_cache.keys():
                kpi = kpi_cache.get(kpi_id)
            else:
                kpi = Kpi.query.filter(Kpi.id == kpi_id).first().as_dict
                kpi_cache[kpi_id] = kpi
            
        alert.kpi_name = kpi.get("name") if kpi is not None else "Doesn't Exist"
        alert.alert_name = alert_conf.get("alert_name")
        alert.alert_channel = alert_conf.get("alert_channel")
        alert.alert_message = alert_conf.get("alert_message")

        if alert_conf.get("alert_channel_conf") is None:
            alert.alert_channel_conf = None
        else:
            alert.alert_channel_conf = alert_conf.get("alert_channel_conf").get(alert.alert_channel, None)
    
    return data

def get_digest_view_data(triggered_alert_id=None):

    curr_time = datetime.datetime.now()
    time_diff = datetime.timedelta(days=7)

    filters = [TriggeredAlerts.created_at >= (curr_time - time_diff)]
    if triggered_alert_id is not None:
        filters.append(TriggeredAlerts.id == triggered_alert_id)

    data = TriggeredAlerts.query.filter(*filters).order_by(TriggeredAlerts.created_at.desc()).all()
    data = triggered_alert_data_processing(data)
    

    anomaly_alerts_data = [alert for alert in data if alert.alert_type == "KPI Alert"]
    event_alerts_data = [alert for alert in data if alert.alert_type == "Event Alert"]

    return anomaly_alerts_data, event_alerts_data



            
