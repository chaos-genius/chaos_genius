source .venv/bin/activate
source .env
gunicorn -w 4 wsgi:app --bind 0.0.0.0:5000
