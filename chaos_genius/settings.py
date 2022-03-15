# -*- coding: utf-8 -*-
"""Application configuration.

Most configuration is set via environment variables.

For local development, use a .env file to set
environment variables.
"""
import os
from typing import Union

from dotenv import load_dotenv

from chaos_genius.core.rca.constants import TIME_RANGES_BY_KEY
from chaos_genius.core.utils.constants import SUPPORTED_TIMEZONES
from chaos_genius.utils.utils import latest_git_commit_hash

load_dotenv(".env")  # loads environment variables from .env

"""
load the environment variables from the .env.local files
and override the variables
Here is the order of precedence:
.env.local > os.environ > .env
"""
load_dotenv(".env.local", override=True)


def _make_bool(val: Union[str, bool]) -> bool:
    """Converts a string with true/True/1 values to bool, false otherwise."""
    return val in {True, "true", "True", "1"}


CWD = os.getcwd()

ENV = os.getenv("FLASK_ENV", default="production")
DEBUG = ENV == "development"
SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL_CG_DB")
SECRET_KEY = os.getenv("SECRET_KEY", default="t8GIEp8hWmR8y6VLqd6qQCMXzjRaKsx8nRruWNtFuec=")
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
CHAOSGENIUS_WEBAPP_URL = os.getenv("CHAOSGENIUS_WEBAPP_URL")

EMAIL_HOST = os.getenv('EMAIL_HOST')
EMAIL_HOST_PORT = os.getenv('EMAIL_HOST_PORT', default=587)
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD')
EMAIL_SENDER = os.getenv('EMAIL_SENDER')

AIRBYTE_ENABLED = _make_bool(os.getenv("AIRBYTE_ENABLED", default=False))
INTEGRATION_SERVER = os.getenv("INTEGRATION_SERVER")
INTEGRATION_DB_HOST = os.getenv("INTEGRATION_DB_HOST")
INTEGRATION_DB_USERNAME = os.getenv("INTEGRATION_DB_USERNAME")
INTEGRATION_DB_PASSWORD = os.getenv("INTEGRATION_DB_PASSWORD")
INTEGRATION_DB_PORT = os.getenv("INTEGRATION_DB_PORT")
INTEGRATION_DATABASE = os.getenv("INTEGRATION_DATABASE")

MULTIDIM_ANALYSIS_FOR_ANOMALY = _make_bool(os.getenv('MULTIDIM_ANALYSIS_FOR_ANOMALY', default=False))
MAX_SUBDIM_CARDINALITY = int(os.getenv('MAX_SUBDIM_CARDINALITY', default=100))
TOP_DIMENSIONS_FOR_ANOMALY_DRILLDOWN = int(os.getenv('TOP_DIMENSIONS_FOR_ANOMALY_DRILLDOWN', default=10))
MIN_DATA_IN_SUBGROUP = int(os.getenv('MIN_DATA_IN_SUBGROUP', default=90))
TOP_SUBDIMENSIONS_FOR_ANOMALY = int(os.getenv('TOP_SUBDIMENSIONS_FOR_ANOMALY', default=10))
MAX_ROWS_FOR_DEEPDRILLS = int(os.getenv("MAX_ROWS_FOR_DEEPDRILLS", default=10000000))
MAX_FILTER_SUBGROUPS_ANOMALY = int(os.getenv('MAX_FILTER_SUBGROUPS_ANOMALY', default=100))
MAX_DEEPDRILLS_SLACK_DAYS = int(os.getenv('MAX_DEEPDRILLS_SLACK_DAYS', default=14))
MAX_ANOMALY_SLACK_DAYS = int(os.getenv('MAX_ANOMALY_SLACK_DAYS', default=14))
DAYS_OFFSET_FOR_ANALTYICS = int(os.getenv('DAYS_OFFSET_FOR_ANALTYICS', default=2))
HOURS_OFFSET_FOR_ANALTYICS = int(os.getenv('HOURS_OFFSET_FOR_ANALTYICS', default=0))
DEEPDRILLS_HTABLE_MAX_PARENTS = int(os.getenv('DEEPDRILLS_HTABLE_MAX_PARENTS', default=5))
DEEPDRILLS_HTABLE_MAX_CHILDREN = int(os.getenv('DEEPDRILLS_HTABLE_MAX_CHILDREN', default=5))
DEEPDRILLS_HTABLE_MAX_DEPTH = int(os.getenv('DEEPDRILLS_HTABLE_MAX_DEPTH', default=3))
DEEPDRILLS_ENABLED_TIME_RANGES = os.getenv('DEEPDRILLS_ENABLED_TIME_RANGES', default='last_30_days,last_7_days,previous_day')
DEEPDRILLS_ENABLED_TIME_RANGES = list(map(lambda x: x.strip(), DEEPDRILLS_ENABLED_TIME_RANGES.split(',')))
for enabled_time_range in DEEPDRILLS_ENABLED_TIME_RANGES:
    if enabled_time_range not in TIME_RANGES_BY_KEY.keys():
        raise ValueError(f"Values in DEEPDRILLS_ENABLED_TIME_RANGES must be one of {', '.join(TIME_RANGES_BY_KEY.keys())}. Got: {enabled_time_range}.")
TIMEZONE = os.getenv('TIMEZONE', default='UTC')
if TIMEZONE not in SUPPORTED_TIMEZONES:
    raise ValueError(f"Value of TIMEZONE must be one of {', '.join(SUPPORTED_TIMEZONES)}. Got: {TIMEZONE}.")

SENTRY_DSN = os.getenv('SENTRY_DSN')

IN_DOCKER = _make_bool(os.getenv('IN_DOCKER', default=False))

TASK_CHECKPOINT_LIMIT: int = int(os.getenv("TASK_CHECKPOINT_LIMIT", 1000))
"""Number of last checkpoints to retrieve in Task Monitor"""

CHAOSGENIUS_VERSION_MAIN = os.getenv("CHAOSGENIUS_VERSION_MAIN", "0.5.0")
"""ChaosGenius version - semver part only"""
CHAOSGENIUS_VERSION_POSTFIX = os.getenv("CHAOSGENIUS_VERSION_POSTFIX", "git")
"""ChaosGenius version - postfix to identify deployment"""

# append latest git commit hash if running from main
if CHAOSGENIUS_VERSION_POSTFIX == "git":
    CHAOSGENIUS_VERSION_POSTFIX += "-" + (latest_git_commit_hash() or "unknown")

CHAOSGENIUS_VERSION = CHAOSGENIUS_VERSION_MAIN + "-" + CHAOSGENIUS_VERSION_POSTFIX
"""ChaosGenius full version string"""

CHAOSGENIUS_ENTERPRISE_EDITION_KEY = os.getenv("CHAOSGENIUS_ENTERPRISE_EDITION_KEY")

"""Dynamic Third Party Data Sources"""
SOURCE_GOOGLE_ANALYTICS = _make_bool(os.getenv("SOURCE_GOOGLE_ANALYTICS", default=True))
SOURCE_GOOGLE_SHEETS = _make_bool(os.getenv("SOURCE_GOOGLE_SHEETS", default=True))
SOURCE_SHOPIFY = _make_bool(os.getenv("SOURCE_SHOPIFY", default=False))
SOURCE_STRIPE = _make_bool(os.getenv("SOURCE_STRIPE", default=False))
SOURCE_GOOGLE_ADS = _make_bool(os.getenv("SOURCE_GOOGLE_ADS", default=False))
SOURCE_FACEBOOK_ADS = _make_bool(os.getenv("SOURCE_FACEBOOK_ADS", default=False))
SOURCE_BING_ADS = _make_bool(os.getenv("SOURCE_BING_ADS", default=False))

"""Alert Configuration"""
EVENT_ALERTS_ENABLED = _make_bool(os.getenv("REACT_APP_EVENT_ALERT", default=False))
