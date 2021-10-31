import logging
import sentry_sdk

from sentry_sdk.integrations.logging import LoggingIntegration
from sentry_sdk.integrations.flask import FlaskIntegration
from sentry_sdk.integrations.redis import RedisIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration


def init_sentry(sentry_dsn, flask_integration=False, env=None):
    """This function will initialised the sentry DSN for the error logging
    and tracking if the env is production
    """
    print('Initiated the sentry code')
    integrations = []

    sentry_logging = LoggingIntegration(
        level=logging.INFO,        # Capture info and above as breadcrumbs
        event_level=logging.ERROR  # Send errors as events
    )
    integrations.append(sentry_logging)
    integrations.append(RedisIntegration())
    integrations.append(SqlalchemyIntegration())

    if flask_integration:
        integrations.append(FlaskIntegration())

    sentry_sdk.init(
        dsn=sentry_dsn,
        integrations=integrations,
        environment=env,
        before_send=strip_sensitive_data
    )


def strip_sensitive_data(event, hint):
    # modify event here
    return event


def log_sentry_error(error):
    sentry_sdk.capture_exception(error)
