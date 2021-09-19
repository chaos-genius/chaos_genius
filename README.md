# Chaos Genius

Documentation Build Status

[![Netlify Status](https://api.netlify.com/api/v1/badges/1a934fc6-f09d-46ab-9ce5-3a521323b2b6/deploy-status)](https://app.netlify.com/sites/practical-wescoff-5294ef/deploys)

## Prerequisite

- python 3.7 or later
- node 12 or later


## How to install

Frontend

- Go to frontend directory via `cd frontend`
- Install the dependency via `npm install`
- Run the frontend local server via `npm run start`
- Run the backend local server via `npm run start-backend`


Backend

- Install the python virtualenv via `python3 -m venv .venv`
- Activate the environment `source .venv/bin/activate`
- Install the dependancy `pip install -r requirements/dev.txt`
- Run the dev server `bash dev_server.sh`



## Docker

### Build 

1. Build all services with `docker-compose build`
   This will build all the containers.

2. Run all containers with `docker-compose up`
   This will run all containers with airbyte and other dependencies.

3. Shut down all containers with `docker-compose down`

4. Delete all data from volumes with `docker volumes prune`. 
   Make sure you don't have data from other containers. If yes, then we need to do this manually.

### From Image

1. Run all containers with `docker-compose -f docker-compose.image.yml up`
   This will run all containers with airbyte and other dependencies.

2. Shut down all containers with `docker-compose down`

3. Delete all data from volumes with `docker volumes prune`. 
   Make sure you don't have data from other containers. If yes, then we need to do this manually.