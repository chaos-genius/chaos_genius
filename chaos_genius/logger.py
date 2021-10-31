"""Provides utility functions for logging."""
import logging
from logging.handlers import RotatingFileHandler
from pythonjsonlogger import jsonlogger

from chaos_genius.utils.sentry import init_sentry
from chaos_genius.settings import ENV, SENTRY_DSN


def configure_logger(app):
    """Configure loggers."""
    logger = logging.getLogger()
    json_handler = RotatingFileHandler(
        "chaosgenius.log", maxBytes=4194304, backupCount=5)
    json_formatter = jsonlogger.JsonFormatter(
        "%(asctime) %(levelname)s %(module) "
        "%(message)s %(lineno)s %(funcName)s %(filename)s")
    json_handler.setFormatter(json_formatter)
    streamHandler = logging.StreamHandler()

    if ENV == 'production':
        streamHandler.setFormatter(json_formatter)
        log_level = logging.INFO
        if SENTRY_DSN:
            init_sentry(SENTRY_DSN, app, ENV)
    else:
        log_level = logging.DEBUG

    # log_level = logging.INFO if ENV == "production" else logging.DEBUG
    logger.setLevel(log_level)

    logger.addHandler(json_handler)
    logger.addHandler(streamHandler)

    if not app.logger.handlers:
        app.logger.addHandler(json_handler)
        app.logger.addHandler(streamHandler)
