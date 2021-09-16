from chaos_genius.extensions import db
from chaos_genius.extensions import celery as celery_ext
from chaos_genius.controllers.alert_controller import get_alert_list, get_alert_info

celery = celery_ext.celery


@celery.task
def check_alerts(alert_frequency):
    """Check the alert on based on the frequenct

    Args:
        alert_frequency (string): frequency of the alert
    """
    print('---------')
    print(alert_frequency)
    if alert_frequency == 'every_minute':
        # Using every minute for testing
        alerts = get_alert_list(alert_frequency)
        print(x)
        return True


def run_and_send_alert(alert_id):
    """This function will run the alerts and send it.

    Args:
        alert_id ([type]): [description]
    """
    alert_info = get_alert_info(id)
    print(alert_info)
