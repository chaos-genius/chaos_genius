frontend: cd frontend
backend: bash dev_server.sh
celery_beat: celery -A wsgi.celery beat --loglevel=INFO
celery_worker: celery -A wsgi.celery worker --loglevel=INFO --concurrency=2
