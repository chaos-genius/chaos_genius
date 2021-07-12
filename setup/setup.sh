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

OS_NAME=$(uname -a 2>&1 | cut -d ' ' -f 1)
if [ "$OS_NAME" = "Darwin" ]; then
    bash "$PWD/setup/setup-macos.sh"
elif [ "$OS_NAME" = "Linux" ]; then
    bash "$PWD/setup/setup-ubuntu.sh"
else
    printf "${RED}-->${NC} Chaos Genius only support Linux and MacOs\n"
    exit 1
fi


# Check & install connector dependencies
printf "${BLUE}-->${NC} Installing third party connectors\n"
if [ -d "$PWD/.connectors" ]; then
    printf "${BLUE}-->${NC} Third party connectorts for Chaos Genius found\n"
    printf "${BLUE}-->${NC} Updating the connectors...\n"
    cd "$PWD/.connectors"
    docker-compose up -d
    cd ..
    printf "${BLUE}-->${NC} Updated the third party connectors\n"
else
    printf "${BLUE}-->${NC} Third party connectorts for Chaos Genius not found\n"
    printf "${BLUE}-->${NC} Pulling the connectors...\n"
    mkdir "$PWD/.connectors"
    cd "$PWD/.connectors"
    wget https://raw.githubusercontent.com/airbytehq/airbyte/master/{.env,docker-compose.yaml}
    docker-compose up -d
    cd ..
    printf "${BLUE}-->${NC} Installed the third party connectors\n"
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


# Start services & go!
# printf "\n${GREEN}-->${NC} Starting services \n"
# printf "${BLUE}-->${NC} Starting database & data connectors\n"
# printf "${BLUE}-->${NC} Starting front-end services\n"
# printf "${BLUE}-->${NC} Starting backend-end services\n"


# Welcome message 
printf "\n${GREEN}-->${NC} Setup complete for ${GREEN}Chaos Genius${NC}! \n🔮\n"
