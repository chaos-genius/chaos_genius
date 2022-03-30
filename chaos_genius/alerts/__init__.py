"""Alerting logic, email/slack formats and other utilities.

Most of the code in this module has extensive type annotation. Please use the Pylance
VS Code extension (or the Pyright equivalent in other editors) along with flake8 when
developing.
"""
import logging
from typing import List, Optional, Tuple

from chaos_genius.alerts.anomaly_alerts import AnomalyAlertController
from chaos_genius.alerts.event_alerts import StaticEventAlertController
from chaos_genius.alerts.static_kpi_alerts import StaticKpiAlertController
from chaos_genius.databases.models.alert_model import Alert
from chaos_genius.databases.models.data_source_model import DataSource
from chaos_genius.databases.models.kpi_model import Kpi

logger = logging.getLogger()


def check_and_trigger_alert(alert_id: int):
    """Check the alert and trigger the notification if found.

    Args:
        alert_id (int): alert id

    Raises:
        Exception: Raise if the alert record not found

    Returns:
        bool: status of the alert trigger
    """
    alert_info: Optional[Alert] = Alert.get_by_id(alert_id)
    if not alert_info:
        raise Exception("Alert doesn't exist")

    if not (alert_info.active and alert_info.alert_status):
        print("Alert isn't active. Please activate the alert.")
        return True

    # TODO: extract these values of `alert_type` as an enum
    #   ref: https://github.com/chaos-genius/chaos_genius/pull/836#discussion_r838077656
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
        anomaly_obj = AnomalyAlertController(alert_info)
        return anomaly_obj.check_and_send_alert()
    elif alert_info.alert_type == "KPI Alert" and alert_info.kpi_alert_type == "Static":
        # TODO: is this still needed?
        StaticKpiAlertController(alert_info.as_dict)

    return True


def trigger_anomaly_alerts_for_kpi(
    kpi_obj: Kpi,
) -> Tuple[List[int], List[Tuple[int, Exception]]]:
    """Triggers anomaly alerts starting from end_date.

    Args:
        kpi_obj (Kpi): Object of kpi for which alerts are to be triggered
        end_date (dateimte.datetime): Datetime object containing the upper bound of
            anomaly date values

    Returns:
        List[int]: List of alert IDs for which alert messages were successfully sent
        List[Tuple[int, Exception]]: List of alert IDs and exceptions for which alert
            failed
    """
    success_alerts: List[int] = []
    errors: List[Tuple[int, Exception]] = []
    alerts: List[Alert] = Alert.query.filter(
        Alert.kpi == kpi_obj.id,
        Alert.active == True,  # noqa: E712
        Alert.alert_status == True,  # noqa: E712
    ).all()
    for alert in alerts:
        try:
            anomaly_obj = AnomalyAlertController(alert)
            anomaly_obj.check_and_send_alert()
            success_alerts.append(alert.id)
        except Exception as e:
            logger.error(f"Error running alert for Alert ID: {alert.id}", exc_info=e)
            errors.append((alert.id, e))
    return success_alerts, errors
