source .venv/bin/activate
source .env

# Flask ENV varaibles
export FLASK_ENV=development
export FLASK_DEBUG=1
export FLASK_APP=run

# start the flask server
flask run
