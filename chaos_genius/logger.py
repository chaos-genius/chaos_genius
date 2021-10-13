"""Provides utility functions for logging."""
import logging
from logging.handlers import RotatingFileHandler

from pythonjsonlogger import jsonlogger


def configure_logger(app):
    """Configure loggers."""
    logger = logging.getLogger()
    # TODO: Update debug based on env
    logger.setLevel(logging.DEBUG)
    json_handler = RotatingFileHandler(
        "chaosgenius.log", maxBytes=4194304, backupCount=5)
    json_formatter = jsonlogger.JsonFormatter(
        "%(levelname)s %(message)s %(lineno)s %(funcName)s %(filename)s "
    )
    json_handler.setFormatter(json_formatter)

    streamHandler = logging.StreamHandler()
    streamHandler.setFormatter(json_formatter)

    logger.addHandler(json_handler)
    logger.addHandler(streamHandler)

    if not app.logger.handlers:
        app.logger.addHandler(json_handler)
        app.logger.addHandler(streamHandler)
