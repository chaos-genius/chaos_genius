# -*- coding: utf-8 -*-
"""Application configuration.

Most configuration is set via environment variables.

For local development, use a .env file to set
environment variables.
"""
from dotenv import dotenv_values

env = dotenv_values(".env")

ENV = env.get("FLASK_ENV", "production")
DEBUG = ENV == "development"
SQLALCHEMY_DATABASE_URI = env.get("DATABASE_URL")
SECRET_KEY = env.get("SECRET_KEY", "not-so-secret")
SEND_FILE_MAX_AGE_DEFAULT = env.get("SEND_FILE_MAX_AGE_DEFAULT")
BCRYPT_LOG_ROUNDS = env.get("BCRYPT_LOG_ROUNDS", 13)
DEBUG_TB_ENABLED = DEBUG
DEBUG_TB_INTERCEPT_REDIRECTS = False
CACHE_TYPE = "simple"  # Can be "memcached", "redis", etc.
SQLALCHEMY_TRACK_MODIFICATIONS = False
# url = config.get("SLACK_WEBHOOK_URL")

FLASK_RUN_PORT = env.get("FLASK_RUN_PORT", 5000)
META_DATABASE = env.get("META_DATABASE")

CELERY_RESULT_BACKEND=env.get('CELERY_RESULT_BACKEND')
CELERY_BROKER_URL=env.get('CELERY_BROKER_URL')

EMAIL_HOST=env.get('EMAIL_HOST')
EMAIL_HOST_PORT=env.get('EMAIL_HOST_PORT')
EMAIL_HOST_USER=env.get('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD=env.get('EMAIL_HOST_PASSWORD')
EMAIL_SENDER=env.get('EMAIL_SENDER')
