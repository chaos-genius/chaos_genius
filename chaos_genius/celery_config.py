from datetime import timedelta

from celery.schedules import crontab, schedule

CELERY_IMPORTS = ("chaos_genius.jobs")
CELERY_TASK_RESULT_EXPIRES = 30
CELERY_TIMEZONE = "UTC"

CELERY_ACCEPT_CONTENT = ["json", "msgpack", "yaml"]
CELERY_TASK_SERIALIZER = "json"
CELERY_RESULT_SERIALIZER = "json"

CELERYBEAT_SCHEDULE = {
    "anomaly-scheduler": {
        "task": "chaos_genius.jobs.analytics_scheduler.scheduler_wrapper",
        "schedule": schedule(timedelta(minutes=1)),
        "args": ()
    },
    'alerts-daily': {
        'task': 'chaos_genius.jobs.alert_tasks.check_event_alerts',
        'schedule': crontab(hour="3", minute="0"),  # Daily: at 3am
        'args': ('daily',)
    },
    "alert-digest-daily-scheduler": {
        "task": "chaos_genius.jobs.alert_tasks.alert_digest_daily_scheduler",
        "schedule": schedule(timedelta(minutes=10)),
        "args": ()
    },
    # 'anomaly-task-every-minute': {
    #     'task': 'chaos_genius.jobs.anomaly_tasks.add_together',
    #     'schedule': crontab(minute="*"), # Every minutes
    #     'args': (5,10,)
    # },
    # "anomaly-tasks-all-kpis": {
    #     "task": "chaos_genius.jobs.anomaly_tasks.anomaly_kpi",
    #     # "schedule": crontab(hour=[11]),
    #     "schedule": schedule(timedelta(minutes=1)),  # for testing
    #     "args": ()
    # },
    # 'alerts-weekly': {
    #     'task': 'chaos_genius.jobs.alert_tasks.check_event_alerts',
    #     'schedule': crontab(day_of_week="0"), # Weekly: every sunday
    #     'args': ('weekly',)
    # },
    # 'alerts-hourly': {
    #     'task': 'chaos_genius.jobs.alert_tasks.check_event_alerts',
    #     'schedule': crontab(hour="*"), # Hourly: at 0th minute
    #     'args': ('hourly',)
    # },
    # 'alerts-every-15-minute': {
    #     'task': 'chaos_genius.jobs.alert_tasks.check_event_alerts',
    #     'schedule': crontab(minute="*/15"), # Every 15 minutes
    #     'args': ('every_15_minute',)
    # }
}

CELERY_ROUTES = {
    
    "chaos_genius.jobs.anomaly_tasks.*": {"queue": "anomaly-rca"},
    "chaos_genius.jobs.analytics_scheduler.*": {"queue": "anomaly-rca"},
    "chaos_genius.jobs.alert_tasks.*": {"queue": "alerts"},
}

# Scheduler runs every hour
# looks at tasks in last n hour
# if they are in processing in 24 hours, schedule them right away
# job expiry window
# add details of job into a table, then schedule it


# TODO: Use this for config
class Config:
    enable_utc = True
