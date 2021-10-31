source .venv/bin/activate
source .env
gunicorn run:app -w 4 -b 0.0.0.0:5000 -t 120
