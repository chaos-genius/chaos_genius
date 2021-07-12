source .venv/bin/activate
source .env
gunicorn -w 4 run:app --bind 0.0.0.0:5000
