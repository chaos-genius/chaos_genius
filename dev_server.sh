source .venv/bin/activate

# Environment variable overrides for local development
export SECRET_KEY=not-so-secret
export DATABASE_URL="postgresql+psycopg2://manas:@localhost/argos"
export SEND_FILE_MAX_AGE_DEFAULT=0  # In production, set to a higher number, like 31556926

# Flask ENV varaibles
export FLASK_ENV=development
export FLASK_DEBUG=1
export FLASK_APP=run

# start the flask server
flask run
