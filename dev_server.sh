source .venv/bin/activate
source .env
export PYTHONDONTWRITEBYTECODE=1
# export DATABASE_URL="postgresql+psycopg2://postgres:y5D87FnikqVHW7eg3NVQ@md-postgres-test-db-instance.cjzi0pwi8ki4.ap-south-1.rds.amazonaws.com/chaos_genius"

# Flask ENV varaibles
export FLASK_ENV=development
export FLASK_DEBUG=1
export FLASK_APP=wsgi

# start the flask server
flask run
