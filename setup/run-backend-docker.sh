#!/bin/bash
while ! timeout 1 bash -c "echo > /dev/tcp/server/8001"; do   
  sleep 1
done
flask db upgrade
flask integration-connector
gunicorn -w 4 run:app --bind 0.0.0.0:5000