#!/usr/bin/env sh
watchmedo auto-restart --directory=./ --pattern=*.py --recursive -- celery -A run.celery beat --loglevel=DEBUG
