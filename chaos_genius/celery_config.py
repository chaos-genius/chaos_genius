from datetime import timedelta

from celery.schedules import crontab, schedule
from chaos_genius.settings import METADATA_SYNC_TIME

CELERY_IMPORTS = "chaos_genius.jobs"
CELERY_TASK_RESULT_EXPIRES = 30
CELERY_TIMEZONE = "UTC"

CELERY_ACCEPT_CONTENT = ["json", "msgpack", "yaml"]
CELERY_TASK_SERIALIZER = "json"
CELERY_RESULT_SERIALIZER = "json"

METADATA_SYNC_TIME_HRS, METADATA_SYNC_TIME_MINS = METADATA_SYNC_TIME.split(":")

CELERYBEAT_SCHEDULE = {
    "anomaly-scheduler": {
        "task": "chaos_genius.jobs.analytics_scheduler.scheduler_wrapper",
        "schedule": schedule(timedelta(minutes=1)),
        "args": (),
    },
    "alert-digest-daily-scheduler": {
        "task": "chaos_genius.jobs.alert_tasks.alert_digest_daily_scheduler",
        "schedule": schedule(timedelta(minutes=10)),
        "args": (),
    },
    "alerts-daily": {
        "task": "chaos_genius.jobs.alert_tasks.check_event_alerts",
        "schedule": crontab(hour="3", minute="0"),  # Daily: at 3am
        "args": ("daily",),
    },
    "alerts-hourly": {
        "task": "chaos_genius.jobs.alert_tasks.check_event_alerts",
        "schedule": crontab(minute="0"),  # Hourly: at 0th minute
        "args": ("hourly",),
    },
    "metadata-prefetch-daily": {
        "task": "chaos_genius.jobs.metadata_prefetch.metadata_prefetch_daily_scheduler",
        "schedule": crontab(
            hour=METADATA_SYNC_TIME_HRS, minute=METADATA_SYNC_TIME_MINS
        ),
        "args": (),
    },
}

CELERY_ROUTES = {
    "chaos_genius.jobs.anomaly_tasks.*": {"queue": "anomaly-rca"},
    "chaos_genius.jobs.analytics_scheduler.*": {"queue": "anomaly-rca"},
    "chaos_genius.jobs.alert_tasks.*": {"queue": "alerts"},
    "chaos_genius.jobs.metadata_prefetch.*": {"queue": "alerts"},
}


# Scheduler runs every hour
# looks at tasks in last n hour
# if they are in processing in 24 hours, schedule them right away
# job expiry window
# add details of job into a table, then schedule it


# TODO: Use this for config
class Config:
    enable_utc = True
