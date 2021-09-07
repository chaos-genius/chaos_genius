from datetime import timedelta
from celery.schedules import crontab, schedule

CELERY_IMPORTS = ("chaos_genius.jobs")
CELERY_TASK_RESULT_EXPIRES = 30
CELERY_TIMEZONE = "UTC"
# 
CELERY_ACCEPT_CONTENT = ["json", "msgpack", "yaml"]
CELERY_TASK_SERIALIZER = "json"
CELERY_RESULT_SERIALIZER = "json"

CELERYBEAT_SCHEDULE = {
    # TODO: Add schedule here
    # 'anomaly-task-every-minute': {
    #     'task': 'chaos_genius.jobs.anomaly_tasks.add_together',
    #     'schedule': crontab(minute="*"), # Every minutes
    #     'args': (5,10,)
    # },
    "anomaly-tasks-all-kpis": {
        "task": "chaos_genius.jobs.anomaly_tasks.anomaly_kpi",
        "schedule": crontab(hour=[11]),
        # "schedule": schedule(timedelta(seconds=5)),  # for testing
        "args": ()
    }
}

# Scheduler runs every hour
# looks at tasks in last n hour
# if they are in processing in 24 hours, schedule them right away
# job expiry window
# add details of job into a table, then schedule it


# baseline



# TODO: Use this for config
class Config:
    enable_utc = True
