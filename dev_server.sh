source .venv/bin/activate

# Environment variable overrides for local development
export SECRET_KEY=not-so-secret
export DATABASE_URL="postgresql+psycopg2://postgres:y5D87FnikqVHW7eg3NVQ@md-postgres-test-db-instance.cjzi0pwi8ki4.ap-south-1.rds.amazonaws.com/chaos_genius"
export SEND_FILE_MAX_AGE_DEFAULT=0  # In production, set to a higher number, like 31556926

# Flask ENV varaibles
export FLASK_ENV=development
export FLASK_DEBUG=1
export FLASK_APP=run

# start the flask server
flask run
