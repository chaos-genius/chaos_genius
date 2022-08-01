"""Provides utility functions for logging."""
import logging
from logging.handlers import RotatingFileHandler

from pythonjsonlogger import jsonlogger

from chaos_genius.settings import ENV, SENTRY_DSN
from chaos_genius.utils.sentry import init_sentry, log_sentry_error


def configure_logger(app):
    """Configure loggers."""
    logger = logging.getLogger("chaos_genius")
    rf_handler = RotatingFileHandler(
        "chaosgenius.log", maxBytes=4194304, backupCount=5
    )
    stream_handler = logging.StreamHandler()

    format_string = "%(asctime)s %(levelname)s %(name)s %(message)s" \
        + "%(lineno)s %(funcName)s %(filename)s"

    if ENV == "production":
        formatter = jsonlogger.JsonFormatter(format_string)
        log_level = logging.INFO
        if SENTRY_DSN:
            init_sentry(SENTRY_DSN, app, ENV)
    else:
        formatter = logging.Formatter(format_string)
        log_level = logging.DEBUG

    rf_handler.setFormatter(formatter)
    stream_handler.setFormatter(formatter)

    logger.setLevel(log_level)

    logger.addHandler(rf_handler)
    logger.addHandler(stream_handler)

    if not app.logger.handlers:
        app.logger.addHandler(rf_handler)
        app.logger.addHandler(stream_handler)


def log_error(error):
    """Log error."""
    log_sentry_error(error)
