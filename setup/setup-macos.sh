#!/bin/bash


GREEN='\033[1;32m' # Green
BLUE='\033[1;34m' # Blue
GRAY='\033[0;37m' # Grey
RED='\033[1;31m' # Blue
NC='\033[0m' # No Color

printf "${GREEN}-->${NC} Installing ${GREEN}Chaos Genius${NC} ...\n\n"
printf "${GRAY}Chaos Genius 🔮 is an Open-source Business Observability tool
that helps you monitor your business & system metrics
and get automated RCA with multi-dimension drill-downs.${NC}\n\n"


printf "${GREEN}-->${NC} Checking for core dependencies \n"

# Check the OS
OS_NAME=$(uname -a 2>&1 | cut -d ' ' -f 1)
printf "${BLUE}-->${NC} Checking OS.\n"
if [ "$OS_NAME" = "Darwin" ]; then :;
else
    printf "${RED}-->${NC} Chaos Genius only support Linux and MacOs\n"
    exit 1
fi
printf "${BLUE}-->${NC} OS is compatible.\n"


# Check the brew version
if ! hash brew; then
    printf "${RED}-->${NC} Chaos Genius requires brew. It is not installed\n"
    printf "${RED}-->${NC} You can install it by visiting https://brew.sh \n"
    exit 1
else
    printf "${BLUE}-->${NC} Found brew\n"
fi


# Check the python3
if ! hash python3; then
    printf "${RED}-->${NC} Chaos Genius requires python3. It is not installed\n"
    printf "${RED}-->${NC} You can install it by 'brew install python@3.8' \n"
    exit 1
else
    printf "${BLUE}-->${NC} Found python3\n"
fi

python_ver=$(python3 -V 2>&1 | sed 's/.* \([0-9]\).\([0-9]\).*/\1\2/')
if [ "$python_ver" -lt "38" ]; then
    printf "${RED}-->${NC} Chaos Genius requires python 3.8 or greater\n"
    exit 1
else
    printf "${BLUE}-->${NC} Compatible version found for python3\n"
fi

###### TEST: Check the python virtualenv on new installation


# Check the npm and node
if ! hash npm; then
    printf "${RED}-->${NC} Chaos Genius requires npm. It is not installed.\n"
    printf "${RED}-->${NC} You can install it by 'brew install npm'\n"
    exit 1
else
    printf "${BLUE}-->${NC} Found npm\n"
fi

npm_ver=$(npm -v 2>&1 | cut -d "." -f 1)
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
if [ "$node_ver" -lt "10" ]; then
    printf "${RED}-->${NC} Chaos Genius requires node 14.0 or greater\n"
    exit 1
else
    printf "${BLUE}-->${NC} Compatible version found for node\n"
fi


# Check the docker and docker-compose
if ! hash docker; then
    printf "${RED}-->${NC} Chaos Genius requires docker. It is not installed\n"
    printf "${RED}-->${NC} You can install it by 'brew install docker'\n"
    exit 1
else
    printf "${BLUE}-->${NC} Found docker\n"
fi

if ! hash docker-compose; then
    printf "${BLUE}-->${NC} Chaos Genius requires docker-compose. It is not installed\n"
    printf "${RED}-->${NC} You can install it by visiting 'https://docs.docker.com/docker-for-mac/install/'\n"
    exit 1
else
    printf "${BLUE}-->${NC} Found docker-compose\n"
fi


# Check the wget
if ! hash wget; then
    printf "${RED}-->${NC} Chaos Genius requires wget. It is not installed\n"
    printf "${RED}-->${NC} You can install it by 'brew install wget'\n"
    exit 1
else
    printf "${BLUE}-->${NC} Found wget\n"
fi


# Check & install DB
printf "\n${GREEN}-->${NC} Installing database & data connectors \n"
if ! hash psql; then
    printf "${RED}-->${NC} Chaos Genius requires postgresql. It is not installed\n"
    printf "${RED}-->${NC} Installing the postgresql...\n"
    brew install postgresql
    if [ "$?" = "0" ]; then
        printf "${BLUE}-->${NC} Successfully installed postgresql.\n"
    else
        printf "${RED}-->${NC} Could not install postgresql.\n"
        printf "${RED}-->${NC} Try installing it with 'brew install postgresql'\n"
        exit 1
    fi
    brew services start postgresql
    printf "${BLUE}-->${NC} Configuring postgres.\n"
    source ~/.bashrc
    createdb chaosgenius
    createdb chaosgenius_data
    if [ "$?" = "0" ]; then
        printf "${BLUE}-->${NC} Successfully configured postgres.\n"
    else
        printf "${RED}-->${NC} Could not configure postgresql.\n"
        printf "${RED}-->${NC} Try creating the two database with name 'chaosgenius' and 'chaosgenius_data'. After that, add the configuration in the .env file\n"
    fi
else
    printf "${BLUE}-->${NC} Found postgresql\n"
fi


# Check & install connector dependencies
printf "${BLUE}-->${NC} Installing third party connectors\n"
if [ -d "$PWD/.connectors" ]; then
    printf "${BLUE}-->${NC} Third party connectorts for Chaos Genius found\n"
    printf "${BLUE}-->${NC} Updating the connectors...\n"
    cd "$PWD/.connectors"
    docker-compose up -d
    cd ..
else
    printf "${BLUE}-->${NC} Third party connectorts for Chaos Genius not found\n"
    printf "${BLUE}-->${NC} Pulling the connectors...\n"
    mkdir "$PWD/.connectors"
    cd "$PWD/.connectors"
    wget https://raw.githubusercontent.com/airbytehq/airbyte/fb72f9ea51af3ba3a01133b397b1a1887f30875c/{.env,docker-compose.yaml}
    docker-compose up -d
    cd ..
fi
if [[ $? -ne 0 ]]; then
    printf "${RED}-->${NC} Error in installing/updating the third party connectors\n"
    exit 1
else
    printf "${BLUE}-->${NC} Third party connectors installed/updated\n"
fi


# Install python requirements
printf "${BLUE}-->${NC} Installing python requirements\n"
if [ -d "$PWD/.venv" ]; then
    printf "${RED}-->${NC} Python virtualenv for Chaos Genius found\n"
else
    printf "${RED}-->${NC} Python virtualenv for Chaos Genius not found\n"
    printf "${RED}-->${NC} Creating the virtualenv and installing the depedencies...\n"
    python3 -m venv .venv
fi
source .venv/bin/activate
pip install -r requirements.txt
if [[ $? -ne 0 ]]; then
    printf "${RED}-->${NC} Error in installing the python requirements\n"
    exit 1
else
    printf "${BLUE}-->${NC} Python requirements installed\n"
fi


# Install node requirements
printf "${BLUE}-->${NC} Installing node requirements\n"
cd "$PWD/frontend"
npm install
cd ..
if [[ $? -ne 0 ]]; then
    printf "${RED}-->${NC} Error in installing the node requirements\n"
    exit 1
else
    printf "${BLUE}-->${NC} Node requirements installed\n"
fi


# create the env file
printf "${GREEN}-->${NC} Creating the ENV file \n"
touch .env.dev
echo "" > .env.dev
echo "FLASK_APP=run" >> .env.dev
echo "FLASK_ENV=production" >> .env.dev
echo "FLASK_DEBUG=0" >> .env.dev
echo "FLASK_RUN_PORT=5000" >> .env.dev
echo "SECRET_KEY=not-so-secret" >> .env.dev
echo "SEND_FILE_MAX_AGE_DEFAULT=31556926" >> .env.dev
echo "DB_HOST=localhost" >> .env.dev
echo "DB_USERNAME=$(whoami)" >> .env.dev
echo "DB_PASSWORD=''" >> .env.dev
echo "DB_PORT=5432" >> .env.dev
echo "META_DATABASE=chaosgenius" >> .env.dev
echo "DATABASE_URL='postgresql+psycopg2://$(whoami):@localhost/chaosgenius'" >> .env.dev
echo "" >> .env.dev
echo "INTEGRATION_SERVER='http://localhost:8001'" >> .env.dev
echo "INTEGRATION_DB_HOST='localhost'" >> .env.dev
echo "INTEGRATION_DB_USERNAME=$(whoami)" >> .env.dev
echo "INTEGRATION_DB_PASSWORD=''" >> .env.dev
echo "INTEGRATION_DB_PORT=5432" >> .env.dev
echo "INTEGRATION_DATABASE=chaosgenius_data" >> .env.dev
printf "${GREEN}-->${NC} Created the ENV file \n"
printf "\n"


# Start services & go!
printf "\n${GREEN}-->${NC} To run chaos-genius: \n"
printf "${BLUE}-->${NC} 1. Run 'bash setup/setup-database.sh' for setting up the database\n"
printf "${BLUE}-->${NC} 2. Run 'bash setup/run-backend-server.sh'\n"
printf "${BLUE}-->${NC} 3. In another terminal run 'bash setup/run-frontend-server.sh'\n"


# Welcome message 
printf "\n${GREEN}-->${NC} Setup complete for ${GREEN}Chaos Genius${NC}! \n🔮\n"

