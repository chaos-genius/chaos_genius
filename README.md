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

4.  Remove all created containers with `docker-compose rm`.

5. Delete all data from volumes with `docker volumes prune`. 
   Make sure you don't have data from other containers. If yes, then we need to do this manually.

### From Image (Recommended)

#### Linux
##### Prerequisites
1. Make sure you have latest version of docker-compose (at least verison 1.28).
2. Add `172.17.0.1   host.docker.internal` to your `/etc/hosts` file if not already present. This is crucial for Airbyte containers to work properly as they use 'host.docker.internal' as a host home.

##### Removing previous build's residual data
1. Run `./previous_data_cleanup` to clear previous build's data if not cleaned.
2. Run `docker volume prune` to clear any volumes that might have been created in the previous build. Make sure you don't have data from other containers. If yes, then we need to do this manually.

##### Setup And Starting Services
1. Run the first time setup script with`./setup-docker.sh`
   This will fetch the dependencies and run all containers with airbyte and other dependencies.

2. Shut down all containers with `Ctrl + C` in the same terminal window or run `docker-compose -f docker-compose-img.yml down` in a different terminal window.

3. Subsequently (After the first-time setup) use `./start_cg.sh` or `docker-compose -f docker-compose-img.yml up` to start up the services.

##### Cleaning Up
1. Remove all created containers with `docker-compose -f docker-compose-img.yml rm`.

2. Delete all data from volumes with `docker volume prune`.
   Make sure you don't have data from other containers. If yes, then we need to do this manually.

3. Clear residual data and remove related docker images with `./docker-cleanup.sh`. 

NOTE: In the case of 'permission denied' errors while running the scripts, use `sudo chmod +x <script-name>` to give the script executable permissions and try again. If the error persists, use `sudo ./<script name>` to run the scripts.
