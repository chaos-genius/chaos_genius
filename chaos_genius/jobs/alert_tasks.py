import logging
from datetime import datetime, timedelta

from celery import group

from chaos_genius.alerts.base_alert_digests import check_and_trigger_digest
from chaos_genius.alerts import check_and_trigger_alert
from chaos_genius.controllers.alert_controller import get_alert_list
from chaos_genius.controllers.config_controller import get_config_object
from chaos_genius.extensions import celery as celery_ext

celery = celery_ext.celery

logger = logging.getLogger(__name__)


@celery.task
def check_event_alerts(alert_frequency):
    """Check the alert on based on the frequenct

    Args:
        alert_frequency (string): frequency of the alert
    """
    task_group = []
    if alert_frequency in ['weekly', 'daily', 'hourly', 'every_15_minute', 'every_minute']:
        # Using every minute for testing
        alerts = get_alert_list(frequency=alert_frequency, as_obj=True)
        for alert in alerts:
            if alert.alert_type == "Event Alert":
                task_group.append(run_single_alert.s(alert.id))
    else:
        print("No event alerts found")
        return task_group

    if task_group:
        alert_group = group(task_group)
        response = alert_group.apply_async()
        return response
    else:
        return task_group


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


@celery.task
def alert_digest_daily():
    """Sends daily alert digest."""
    check_and_trigger_digest("daily")


@celery.task
def alert_digest_daily_scheduler():
    """Celery task to check and trigger alert digests on given time."""
    digest_config = get_config_object("alert_digest_settings")

    if digest_config is None:
        logger.info("Alert digests have not been enabled.")
        return

    digest_config_settings: dict = digest_config.config_setting

    if not digest_config_settings.get("daily_digest"):
        logger.info("Daily digests have not been enabled.")
        return

    scheduled_time = digest_config_settings["scheduled_time"].split(":")
    if len(scheduled_time) != 2:
        raise ValueError("Scheduled time is invalid. Must be in HH:MM format.")

    current_time = datetime.now()

    scheduled_time_exact = current_time.replace(
        hour=int(scheduled_time[0]),
        minute=int(scheduled_time[1])
    )

    # TODO: store last sent time in DB for robustness
    #  There may be edge cases where this can trigger twice
    if (
        (scheduled_time_exact - timedelta(minutes=5))
        <= current_time
        < (scheduled_time_exact + timedelta(minutes=5))
    ):
        logger.info("Triggering daily digests.")
        check_and_trigger_digest("daily")
