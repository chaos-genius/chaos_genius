# -*- coding: utf-8 -*-
"""Application configuration.

Most configuration is set via environment variables.

For local development, use a .env file to set
environment variables.
"""
import os
from dotenv import load_dotenv

load_dotenv(".env")  # loads environment variables from .env

# config = {
#     **dotenv_values(".env"),  # load shared project variables
#     **dotenv_values(".env.dev"),  # load developement/sensitive variables
#     **os.environ,  # override loaded values with environment variables
# }

CWD = os.getcwd()

ENV = os.getenv("FLASK_ENV", default="production")
DEBUG = ENV == "development"
SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL_CG_DB")
SECRET_KEY = os.getenv("SECRET_KEY")
SEND_FILE_MAX_AGE_DEFAULT = os.getenv("SEND_FILE_MAX_AGE_DEFAULT")
BCRYPT_LOG_ROUNDS = os.getenv("BCRYPT_LOG_ROUNDS", default=13)
DEBUG_TB_ENABLED = DEBUG
DEBUG_TB_INTERCEPT_REDIRECTS = False
CACHE_TYPE = "FileSystemCache"  # Can be "memcached", "redis", etc.
CACHE_DEFAULT_TIMEOUT = int(os.getenv("CACHE_DEFAULT_TIMEOUT", default=3600))
CACHE_DIR = f"{CWD}/.cache"
SQLALCHEMY_TRACK_MODIFICATIONS = False
CELERY_RESULT_BACKEND = os.getenv('CELERY_RESULT_BACKEND')
CELERY_BROKER_URL = os.getenv('CELERY_BROKER_URL')

EMAIL_HOST = os.getenv('EMAIL_HOST')
EMAIL_HOST_PORT = os.getenv('EMAIL_HOST_PORT', default=587)
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD')
EMAIL_SENDER = os.getenv('EMAIL_SENDER')

INTEGRATION_SERVER = os.getenv("INTEGRATION_SERVER")
INTEGRATION_DB_HOST = os.getenv("INTEGRATION_DB_HOST")
INTEGRATION_DB_USERNAME = os.getenv("INTEGRATION_DB_USERNAME")
INTEGRATION_DB_PASSWORD = os.getenv("INTEGRATION_DB_PASSWORD")
INTEGRATION_DB_PORT = os.getenv("INTEGRATION_DB_PORT")
INTEGRATION_DATABASE = os.getenv("INTEGRATION_DATABASE")

MULTIDIM_ANALYSIS_FOR_ANOMALY = os.getenv('MULTIDIM_ANALYSIS_FOR_ANOMALY', default=False)
if MULTIDIM_ANALYSIS_FOR_ANOMALY == 'True':
    MULTIDIM_ANALYSIS_FOR_ANOMALY = True
elif MULTIDIM_ANALYSIS_FOR_ANOMALY == "False":
    MULTIDIM_ANALYSIS_FOR_ANOMALY = False
MAX_SUBDIM_CARDINALITY = int(os.getenv('MAX_SUBDIM_CARDINALITY', default=100))
TOP_DIMENSIONS_FOR_ANOMALY_DRILLDOWN = int(os.getenv('TOP_DIMENSIONS_FOR_ANOMALY_DRILLDOWN', default=10))
MIN_DATA_IN_SUBGROUP = int(os.getenv('MIN_DATA_IN_SUBGROUP', default=90))
TOP_SUBDIMENSIONS_FOR_ANOMALY = int(os.getenv('TOP_SUBDIMENSIONS_FOR_ANOMALY', default=10))
MAX_ROWS_FOR_DEEPDRILLS = int(os.getenv("MAX_ROWS_FOR_DEEPDRILLS", default=10000000))
MAX_FILTER_SUBGROUPS_ANOMALY = int(os.getenv('MAX_FILTER_SUBGROUPS_ANOMALY', default=100))
MAX_DEEPDRILLS_SLACK_DAYS = int(os.getenv('MAX_DEEPDRILLS_SLACK_DAYS', default=14))
MAX_ANOMALY_SLACK_DAYS = int(os.getenv('MAX_ANOMALY_SLACK_DAYS', default=14))

SENTRY_DSN = os.getenv('SENTRY_DSN')

IN_DOCKER = os.getenv('IN_DOCKER', default=False)
if IN_DOCKER == 'True':
    IN_DOCKER = True
else:
    IN_DOCKER = False

TASK_CHECKPOINT_LIMIT: int = int(os.getenv("TASK_CHECKPOINT_LIMIT", 1000))
"""Number of last checkpoints to retrieve in Task Monitor"""
