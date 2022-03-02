#!/usr/bin/env sh

source .venv/bin/activate

(trap 'kill 0' SIGINT EXIT; \
./scripts/celery/dev_scheduler.sh & \
./scripts/celery/dev_worker-analytics.sh & \
./scripts/celery/dev_worker-alerts.sh )
