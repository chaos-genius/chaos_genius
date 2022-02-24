#!/usr/bin/env sh
watchmedo auto-restart --directory=./ --pattern=*.py --recursive -- celery -A run.celery worker --loglevel=INFO --concurrency=2 -P processes -Q alerts
