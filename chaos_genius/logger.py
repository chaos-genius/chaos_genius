"""Provides utility functions for logging."""
import logging
from logging.handlers import RotatingFileHandler

from pythonjsonlogger import jsonlogger


def configure_logger(name: str = None) -> logging.Logger:
    """Configure and return a logger.

    :param name: Name of logger, defaults to None
    :type name: str, optional
    :return: logger object
    :rtype: logging.Logger
    """
    logger = logging.getLogger(name)
    # TODO: Update debug based on env
    logger.setLevel(logging.DEBUG)
    # TODO: Switch to rotating file handler
    json_handler = RotatingFileHandler(
        "chaosgenius.log", maxBytes=4194304, backupCount=5)
    json_formatter = jsonlogger.JsonFormatter(
        "%(asctime)s %(lineno)s %(funcName)s %(module)s %(filename)s %(name)s "
        "%(levelname)s %(message)s"
    )
    json_handler.setFormatter(json_formatter)

    stream_handler = logging.StreamHandler()
    stream_formatter = logging.Formatter(
        "%(asctime)s:%(name)s:%(filename)s:%(lineno)s:%(levelname)s"
        ":%(message)s")
    stream_handler.setFormatter(stream_formatter)

    logger.addHandler(json_handler)
    logger.addHandler(stream_handler)
    return logger
