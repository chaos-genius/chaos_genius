from celery.schedules import crontab

CELERY_IMPORTS = ('chaos_genius.jobs')
CELERY_TASK_RESULT_EXPIRES = 30
CELERY_TIMEZONE = 'UTC'

CELERY_ACCEPT_CONTENT = ['json', 'msgpack', 'yaml']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'

CELERYBEAT_SCHEDULE = {
    'alerts-weekly': {
        'task': 'chaos_genius.jobs.scheduled_task.check_alerts',
        'schedule': crontab(day_of_week="0"), # Weekly: every sunday
        'args': ('weekly',)
    },
    'alerts-daily': {
        'task': 'chaos_genius.jobs.scheduled_task.check_alerts',
        'schedule': crontab(hour="3"), # Daily: at 3am
        'args': ('daily',)
    },
    'alerts-hourly': {
        'task': 'chaos_genius.jobs.scheduled_task.check_alerts',
        'schedule': crontab(hour="*"), # Hourly: at 0th minute
        'args': ('hourly',)
    },
    'alerts-every-15-minute': {
        'task': 'chaos_genius.jobs.scheduled_task.check_alerts',
        'schedule': crontab(minute="*/15"), # Every 15 minutes
        'args': ('every_15_minute',)
    },
    'alerts-every-minute': {
        'task': 'chaos_genius.jobs.scheduled_task.check_alerts',
        'schedule': crontab(minute="*"), # Every minutes
        'args': ('every_minute',)
    }
}


# TODO: Use this for config
class Config:
    enable_utc = True
