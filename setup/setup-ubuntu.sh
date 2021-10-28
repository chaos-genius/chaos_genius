#!/bin/bash

GREEN='\033[1;32m' # Green
BLUE='\033[1;34m' # Blue
GRAY='\033[0;37m' # Grey
RED='\033[1;31m' # Blue
NC='\033[0m' # No Color

printf "${GREEN}-->${NC} Installing ${GREEN}Chaos Genius${NC} ...\n\n"
printf "${GRAY}Chaos Genius is an Open-source Business Observability tool
that helps you monitor your business & system metrics
and get automated RCA with multi-dimension drill-downs.${NC}\n\n"

printf "${BLUE}-->${NC} Checking OS.\n"
distro=$(lsb_release -a | grep "Distributor ID" | cut -d $'\t' -f 2)
if [ "$distro" = "Ubuntu" ]; then
    version=$(lsb_release -a | grep "Description" | cut -d " " -f 2 | cut -d "." -f 1)
    if [ "$version" -lt "20" ]; then
        printf "${RED}-->${NC} Chaos Genius only supports Ubuntu >= 20\n"
        exit 1
    fi
else
    printf "${RED}-->${NC} Chaos Genius only supports Ubuntu and MacOS.\n"
    exit 1
fi
printf "${BLUE}-->${NC} OS is compatible.\n"

printf "\n"

printf "${GREEN}-->${NC} Getting a list of updates \n"
sudo apt-get update

printf "\n"

# Check core dependencies
printf "${GREEN}-->${NC} Checking for core dependencies \n"

# Check python version
if ! hash python3; then
    printf "${RED}-->${NC} Chaos Genius requires python3. It is not installed\n"
    printf "${RED}-->${NC} You can install it by 'sudo apt-get install -y python3' \n"
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

# Check for pip and venv
pip_installed=$(apt -qq list python3-pip --installed)
if [ "$pip_installed" = "" ]; then
    printf "${BLUE}-->${NC} Chaos Genius requires python3-pip. It is not installed\n"
    printf "${BLUE}-->${NC} Installing python3-pip\n"
    sudo apt-get install -y python3-pip
    if [ "$?" = "0" ]; then
        printf "${BLUE}-->${NC} Successfully installed python3-pip\n"
    else
        printf "${RED}-->${NC} Could not install python3-pip.\n"
        printf "${RED}-->${NC} Try installing it with 'sudo apt-get install -y python3-pip'\n"
        exit 1
    fi
else
    printf "${BLUE}-->${NC} Found python3-pip\n"
fi

venv_installed=$(apt -qq list python3-venv --installed)
if [ "$venv_installed" = "" ]; then
    printf "${BLUE}-->${NC} Chaos Genius requires python virtual environments. It is not installed\n"
    printf "${BLUE}-->${NC} Installing python3-venv\n"
    sudo apt-get install -y python3-venv
    if [ "$?" = "0" ]; then
        printf "${BLUE}-->${NC} Successfully installed python3-venv\n"
    else
        printf "${RED}-->${NC} Could not install python3-venv.\n"
        printf "${RED}-->${NC} Try installing it with 'sudo apt-get install -y python3-venv'\n"
        exit 1
    fi
else
    printf "${BLUE}-->${NC} Found python3-venv\n"
fi

# Check npm and node
# TODO: Remove node install (provide link to script)
if ! hash npm; then
    printf "${BLUE}-->${NC} Chaos Genius requires npm. It is not installed.\n"
    printf "${BLUE}-->${NC} Installing node 14."
    bash setup/install-node-ubuntu.sh
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
    printf "${BLUE}-->${NC} Chaos Genius requires node. It is not installed.\n"
    printf "${BLUE}-->${NC} Installing node 14."
    bash setup/install-node-ubuntu.sh
else
    printf "${BLUE}-->${NC} Found node\n"
fi

node_ver=$(node -v 2>&1 | cut -d "." -f 1  | sed s/v//g)
#echo $node_ver
if [ "$node_ver" -lt "14" ]; then
    printf "${RED}-->${NC} Chaos Genius requires node 14.0 or greater\n"
    exit 1
else
    printf "${BLUE}-->${NC} Compatible version found for node\n"
fi

# TODO: Remove install of docker, provide instructions
if ! hash docker; then
    printf "${BLUE}-->${NC} Chaos Genius requires docker. It is not installed\n"
    printf "${BLUE}-->${NC} Installing docker\n"
    sudo apt-get install -y docker.io
    if [ "$?" = "0" ]; then
        printf "${BLUE}-->${NC} Successfully installed docker.\n"
    else
        printf "${RED}-->${NC} Could not install docker.\n"
        printf "${RED}-->${NC} Try installing it with 'sudo apt-get install -y docker.io'\n"
        exit 1
    fi
else
    printf "${BLUE}-->${NC} Found docker\n"
fi

if ! hash docker-compose; then
    printf "${BLUE}-->${NC} Chaos Genius requires docker-compose. It is not installed\n"
    printf "${BLUE}-->${NC} Installing docker-compose.\n"
    sudo apt-get install -y docker-compose
    if [ "$?" = "0" ]; then
        printf "${BLUE}-->${NC} Successfully installed docker-compose.\n"
    else
        printf "${RED}-->${NC} Could not install docker-compose.\n"
        printf "${RED}-->${NC} Try installing it with 'sudo apt-get install -y docker-compose'\n"
        exit 1
    fi
else
    printf "${BLUE}-->${NC} Found docker-compose\n"
fi

printf "\n"

# TODO: Install the redis server

# Check & install DB & connector dependencies
printf "${GREEN}-->${NC} Installing database and connectors.\n"

if ! hash psql; then
    printf "${BLUE}-->${NC} Chaos Genius requires postgresql. It is not installed\n"
    printf "${BLUE}-->${NC} Installing postgres.\n"
    sudo apt-get install -y postgresql
    if [ "$?" = "0" ]; then
        printf "${BLUE}-->${NC} Successfully installed postgresql.\n"
    else
        printf "${RED}-->${NC} Could not install postgresql.\n"
        printf "${RED}-->${NC} Try installing it with 'sudo apt-get install -y postgresql'\n"
        exit 1
    fi
    printf "${BLUE}-->${NC} Configuring postgres.\n"
    source ~/.bashrc
    sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'chaosgenius'";
    sudo -u postgres createdb chaosgenius
    sudo -u postgres createdb chaosgenius_data
    printf "${BLUE}-->${NC} Configured postgres.\n"
else
    printf "${BLUE}-->${NC} Found postgresql\n"
fi

printf "${BLUE}-->${NC} Installing third party connectors\n"
if [ -d "$PWD/.connectors" ]; then
    printf "${BLUE}-->${NC} Third party connectorts for Chaos Genius found\n"
    printf "${BLUE}-->${NC} Updating the connectors...\n"
    cd "$PWD/.connectors"
else
    printf "${BLUE}-->${NC} Third party connectorts for Chaos Genius not found\n"
    printf "${BLUE}-->${NC} Pulling the connectors...\n"
    mkdir "$PWD/.connectors"
    cd "$PWD/.connectors"
    wget https://raw.githubusercontent.com/airbytehq/airbyte/fb72f9ea51af3ba3a01133b397b1a1887f30875c/{.env,docker-compose.yaml}
fi
sudo docker-compose up -d
printf "${BLUE}-->${NC} Updated the third party connectors\n"
cd ..
if [[ $? -ne 0 ]]; then
    printf "${RED}-->${NC} Error in installing the third party connectors\n"
    exit 1
else
    printf "${BLUE}-->${NC} Third party connectors installed\n"
fi

printf "\n"

# Installing core requirements
printf "${GREEN}-->${NC} Installing core requirements.\n"

# Install python requirements
printf "${BLUE}-->${NC} Installing python requirements\n"
if [ -d "$PWD/.venv" ]; then
    printf "${BLUE}-->${NC} Python virtualenv for Chaos Genius found\n"
else
    printf "${BLUE}-->${NC} Python virtualenv for Chaos Genius not found\n"
    printf "${BLUE}-->${NC} Creating the virtualenv and installing the depedencies...\n"
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

printf "\n"


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
echo "DB_USERNAME=postgres" >> .env.dev
echo "DB_PASSWORD='chaosgenius'" >> .env.dev
echo "DB_PORT=5432" >> .env.dev
echo "META_DATABASE=chaosgenius" >> .env.dev
echo "DATA_DATABASE=chaosgenius_data" >> .env.dev
echo "DATABASE_URL_CG_DB='postgresql+psycopg2://postgres:chaosgenius@localhost/chaosgenius'" >> .env.dev
echo "INTEGRATION_SERVER='http://localhost:8001'" >> .env.dev
echo "INTEGRATION_DB_HOST='localhost'" >> .env.dev
echo "INTEGRATION_DB_USERNAME=$(whoami)" >> .env.dev
echo "INTEGRATION_DB_PASSWORD=''" >> .env.dev
echo "INTEGRATION_DB_PORT=5432" >> .env.dev
echo "INTEGRATION_DATABASE=chaosgenius_data" >> .env.dev

printf "${BLUE}-->${NC} Created the ENV file \n"

printf "\n"

# Start services & go!
printf "\n${GREEN}-->${NC} To run chaos-genius: \n"
printf "${BLUE}-->${NC} 1. Run 'bash setup/setup-database.sh' for setting up the database\n"
printf "${BLUE}-->${NC} 2. Run 'bash setup/run-backend-server.sh'\n"
printf "${BLUE}-->${NC} 3. In another terminal run 'bash setup/run-frontend-server.sh'\n"


# Welcome message 
printf "\n${GREEN}-->${NC} Setup complete for ${GREEN}Chaos Genius${NC}!\n"