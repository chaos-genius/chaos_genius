import logging
import sentry_sdk
from sentry_sdk.integrations.logging import LoggingIntegration
from sentry_sdk.integrations.flask import FlaskIntegration
from sentry_sdk.integrations.redis import RedisIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration

from chaos_genius.settings import SENTRY_DSN, ENV


def init_sentry(flask_integration=False):
    """This function will initialised the sentry DSN for the error logging
    and tracking if the env is production
    """
    if SENTRY_DSN and ENV == 'production':
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
            dsn=SENTRY_DSN,
            integrations=integrations,
            environment=ENV,
            before_send=strip_sensitive_data
        )


def strip_sensitive_data(event, hint):
    # modify event here
    return event
