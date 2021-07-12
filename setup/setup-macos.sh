#!/bin/bash

GREEN='\033[1;32m' # Green
BLUE='\033[1;34m' # Blue
GRAY='\033[0;37m' # Grey
RED='\033[1;31m' # Blue
NC='\033[0m' # No Color

printf "${GREEN}-->${NC} Checking for core dependencies \n"
# Check core dependencies

if ! hash python3; then
    printf "${RED}-->${NC} Chaos Genius requires python3. It is not installed\n"
    printf "${RED}-->${NC} You can install it by 'brew install python@3.8' \n"
    exit 1
else
    printf "${BLUE}-->${NC} Found python3\n"
fi

python_ver=$(python3 -V 2>&1 | sed 's/.* \([0-9]\).\([0-9]\).*/\1\2/')
#echo $python_ver
if [ "$python_ver" -lt "38" ]; then
    printf "${RED}-->${NC} Chaos Genius requires python 3.8 or greater\n"
    exit 1
else
    printf "${BLUE}-->${NC} Compatible version found for python3\n"
fi

if ! hash npm; then
    printf "${RED}-->${NC} Chaos Genius requires npm. It is not installed.\n"
    printf "${RED}-->${NC} You can install it by 'brew install npm'\n"
    exit 1
else
    printf "${BLUE}-->${NC} Found npm\n"
fi

npm_ver=$(npm -v 2>&1 | cut -d "." -f 1)
#echo $npm_ver
if [ "$npm_ver" -lt "6" ]; then
    printf "${RED}-->${NC} Chaos Genius requires npm 6.0 or greater\n"
    exit 1
else
    printf "${BLUE}-->${NC} Compatible version found for npm\n"
fi

if ! hash node; then
    printf "${RED}-->${NC} Chaos Genius requires node. It is not installed.\n"
    printf "${RED}-->${NC} You can install it by 'brew install node\n'"
    exit 1
else
    printf "${BLUE}-->${NC} Found node\n"
fi

node_ver=$(node -v 2>&1 | cut -d "." -f 1  | sed s/v//g)
#echo $node_ver
if [ "$node_ver" -lt "10" ]; then
    printf "${RED}-->${NC} Chaos Genius requires node 14.0 or greater\n"
    exit 1
else
    printf "${BLUE}-->${NC} Compatible version found for node\n"
fi

if ! hash docker; then
    printf "${RED}-->${NC} Chaos Genius requires docker. It is not installed\n"
    printf "${RED}-->${NC} You can install it by 'brew install docker'\n"
    exit 1
else
    printf "${BLUE}-->${NC} Found docker\n"
fi

# docker_ver = $(docker -v 2>&1 |  sed 's/.* \([0-9]\).\([0-9]\).*/\1\2/')
# echo $docker_ver
# echo "test"

# Check & install DB & connector dependencies

# printf "\n${GREEN}-->${NC} Installing database & data connectors \n"
if ! hash psql; then
    printf "${RED}-->${NC} Chaos Genius requires postgresql. It is not installed\n"
    printf "${RED}-->${NC} You can install it by 'brew install postgresql'\n"
    brew install postgresql
    createdb chaosgenius
    createdb chaosgenius_data
    exit 1
else
    printf "${BLUE}-->${NC} Found postgresql\n"
fi

printf "${GREEN}-->${NC} Creating the ENV file \n"
touch .env
echo "FLASK_APP=run" >> .env
echo "FLASK_ENV=production" >> .env
echo "FLASK_DEBUG=0" >> .env
echo "FLASK_RUN_PORT=5000" >> .env
echo "SECRET_KEY=not-so-secret" >> .env
echo "SEND_FILE_MAX_AGE_DEFAULT=31556926" >> .env
echo "DB_HOST=localhost" >> .env
echo "DB_USERNAME=$(whoami)" >> .env
echo "DB_PASSWORD=''" >> .env
echo "DB_PORT=5432" >> .env
echo "META_DATABASE=chaosgenius" >> .env
echo "DATA_DATABASE=chaosgenius_data" >> .env
echo "DATABASE_URL='postgresql+psycopg2://$(whoami):@localhost/chaosgenius'" >> .env
printf "${GREEN}-->${NC} Created the ENV file \n"
