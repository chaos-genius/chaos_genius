# -*- coding: utf-8 -*-
"""Application configuration.

Most configuration is set via environment variables.

For local development, use a .env file to set
environment variables.
"""
import os
from environs import Env

CWD = os.getcwd()
env = Env()
env.read_env()

ENV = env.str("FLASK_ENV", default="production")
DEBUG = ENV == "development"
SQLALCHEMY_DATABASE_URI = env.str("DATABASE_URL_CG_DB")
SECRET_KEY = env.str("SECRET_KEY")
SEND_FILE_MAX_AGE_DEFAULT = env.int("SEND_FILE_MAX_AGE_DEFAULT")
BCRYPT_LOG_ROUNDS = env.int("BCRYPT_LOG_ROUNDS", default=13)
DEBUG_TB_ENABLED = DEBUG
DEBUG_TB_INTERCEPT_REDIRECTS = False
CACHE_TYPE = "FileSystemCache"  # Can be "memcached", "redis", etc.
CACHE_DEFAULT_TIMEOUT = env.int("CACHE_DEFAULT_TIMEOUT", default=3600)
CACHE_DIR = f"{CWD}/.cache"
SQLALCHEMY_TRACK_MODIFICATIONS = False
CELERY_RESULT_BACKEND=env.str('CELERY_RESULT_BACKEND')
CELERY_BROKER_URL=env.str('CELERY_BROKER_URL')

EMAIL_HOST=env.str('EMAIL_HOST')
EMAIL_HOST_PORT=env.int('EMAIL_HOST_PORT', default=587)
EMAIL_HOST_USER=env.str('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD=env.str('EMAIL_HOST_PASSWORD')
EMAIL_SENDER=env.str('EMAIL_SENDER')

INTEGRATION_SERVER=env.str("INTEGRATION_SERVER")
INTEGRATION_DB_HOST=env.str("INTEGRATION_DB_HOST")
INTEGRATION_DB_USERNAME=env.str("INTEGRATION_DB_USERNAME")
INTEGRATION_DB_PASSWORD=env.str("INTEGRATION_DB_PASSWORD")
INTEGRATION_DB_PORT=env.str("INTEGRATION_DB_PORT")
INTEGRATION_DATABASE=env.str("INTEGRATION_DATABASE")