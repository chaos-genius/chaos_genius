# -*- coding: utf-8 -*-
"""Application configuration.

Most configuration is set via environment variables.

For local development, use a .env file to set
environment variables.
"""
import os
from dotenv import load_dotenv

load_dotenv(".env")  # loads environment variables from .env

CWD = os.getcwd()

def get_bool(bool_str):
    if bool_str.lower()=='false':
        return False
    else:
        return True

ENV = os.getenv("FLASK_ENV", default="production")
DEBUG = ENV == "development"
SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL_CG_DB")
SECRET_KEY = os.getenv("SECRET_KEY")
SEND_FILE_MAX_AGE_DEFAULT = os.getenv("SEND_FILE_MAX_AGE_DEFAULT")
BCRYPT_LOG_ROUNDS = os.getenv("BCRYPT_LOG_ROUNDS", default=13)
DEBUG_TB_ENABLED = DEBUG
DEBUG_TB_INTERCEPT_REDIRECTS = False
CACHE_TYPE = "FileSystemCache"  # Can be "memcached", "redis", etc.
CACHE_DEFAULT_TIMEOUT = os.getenv("CACHE_DEFAULT_TIMEOUT", default=3600)
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

SOURCE_GOOGLE_ANALYTICS = get_bool(os.getenv('SOURCE_GOOGLE_ANALYTICS','true'))
SOURCE_GOOGLE_SHEETS = get_bool(os.getenv('SOURCE_GOOGLE_SHEETS','true'))
SOURCE_MYSQL = get_bool(os.getenv('SOURCE_MYSQL'),'false')
SOURCE_POSTGRES = get_bool(os.getenv('SOURCE_POSTGRES','false'))
SOURCE_SHOPIFY = get_bool(os.getenv('SOURCE_SHOPIFY','true'))
SOURCE_STRIPE = get_bool(os.getenv('SOURCE_STRIPE','true'))
SOURCE_GOOGLE_ADS = get_bool(os.getenv('SOURCE_GOOGLE_ADS','true'))
SOURCE_FACEBOOK_ADS = get_bool(os.getenv('SOURCE_FACEBOOK_ADS','true'))
SOURCE_BING_ADS = get_bool(os.getenv('SOURCE_BING_ADS','true'))
SOURCE_GOOGLE_BIG_QUERY = get_bool(os.getenv('SOURCE_GOOGLE_BIG_QUERY','false'))
SOURCE_SNOWFLAKE = get_bool(os.getenv('SOURCE_SNOWFLAKE','false'))




