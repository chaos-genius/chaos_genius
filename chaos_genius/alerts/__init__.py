import logging
from datetime import date
from typing import List, Tuple

from chaos_genius.alerts.anomaly_alerts import AnomalyAlertController
from chaos_genius.alerts.event_alerts import StaticEventAlertController
from chaos_genius.alerts.static_kpi_alerts import StaticKpiAlertController
from chaos_genius.databases.models.alert_model import Alert
from chaos_genius.databases.models.data_source_model import DataSource
from chaos_genius.databases.models.kpi_model import Kpi

logger = logging.getLogger()


def check_and_trigger_alert(alert_id):
    """Check the alert and trigger the notification if found

    Args:
        alert_id (int): alert id

    Raises:
        Exception: Raise if the alert record not found

    Returns:
        bool: status of the alert trigger
    """
    alert_info = Alert.get_by_id(alert_id)
    if not alert_info:
        raise Exception("Alert doesn't exist")

    if not (alert_info.active and alert_info.alert_status):
        print("Alert isn't active. Please activate the alert.")
        return True

    if alert_info.alert_type == "Event Alert":

        data_source_id = alert_info.data_source
        data_source_obj = DataSource.get_by_id(data_source_id)
        static_alert_obj = StaticEventAlertController(
            alert_info.as_dict, data_source_obj.as_dict
        )
        static_alert_obj.check_and_prepare_alert()
    elif (
        alert_info.alert_type == "KPI Alert" and alert_info.kpi_alert_type == "Anomaly"
    ):
        anomaly_obj = AnomalyAlertController(alert_info.as_dict)
        return anomaly_obj.check_and_prepare_alert()
    elif alert_info.alert_type == "KPI Alert" and alert_info.kpi_alert_type == "Static":
        static_kpi_alert = StaticKpiAlertController(alert_info.as_dict)

    return True


def trigger_anomaly_alerts_for_kpi(
    kpi_obj: Kpi, end_date: date
) -> Tuple[List[int], List[int]]:
    """Triggers anomaly alerts starting from end_date.

    Args:
        kpi_obj (Kpi): Object of kpi for which alerts are to be triggered
        end_date (dateimte.datetime): Datetime object containing the upper bound of anomaly date values

    Returns:
        List[int]: List of alert IDs for which alert messages were successfully sent
        List[int]: List of alert IDs for which alert failed
    """
    success_alerts = []
    errors = []
    alerts = Alert.query.filter(
        Alert.kpi == kpi_obj.id, Alert.active == True, Alert.alert_status == True
    ).all()
    for alert in alerts:
        try:
            anomaly_obj = AnomalyAlertController(
                alert.as_dict, anomaly_end_date=end_date
            )
            anomaly_obj.check_and_prepare_alert()
            success_alerts.append(alert.id)
        except Exception as e:
            logger.error(f"Error running alert for Alert ID: {alert.id}", exc_info=e)
            errors.append(alert.id)
    return success_alerts, errors
