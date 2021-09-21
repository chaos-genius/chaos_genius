from celery import chain, group

from chaos_genius.extensions import db
from chaos_genius.extensions import celery as celery_ext
from chaos_genius.controllers.alert_controller import get_alert_list, get_alert_info
from chaos_genius.alerts.base_alerts import check_and_trigger_alert

celery = celery_ext.celery


@celery.task
def check_alerts(alert_frequency):
    """Check the alert on based on the frequenct

    Args:
        alert_frequency (string): frequency of the alert
    """
    task_group = []
    if alert_frequency in ['weekly', 'daily', 'hourly', 'every_15_minute', 'every_minute']:
        # Using every minute for testing
        alerts = get_alert_list(frequency=alert_frequency, as_obj=True)
        for alert in alerts:
            task_group.append(run_single_alert.s(alert.id))
    else:
        print("Not Alert Found")
        return task_group


    alert_group = group(task_group)
    response = alert_group.apply_async()
    return response


@celery.task
def run_single_alert(alert_id):
    """This function will run the alerts and send it.

    Args:
        alert_id ([type]): [description]
    """
    print(f"Running alert for ALERT ID: {alert_id}")
    status = check_and_trigger_alert(alert_id)
    if status:
        print(f"Triggered the alert ID: {alert_id}.")
    else:
        print(f"Trigger failed for the alert ID: {alert_id}.")
    return status
