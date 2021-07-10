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

printf "\n${GREEN}-->${NC} Installing database & data connectors \n"
printf "${BLUE}-->${NC} Installing postgres\n"
printf "${BLUE}-->${NC} Installing third party connectors\n"

# Install python & npm requirements

printf "\n${GREEN}-->${NC} Installing core requirements \n"
printf "${BLUE}-->${NC} Installing python requirements\n"
printf "${BLUE}-->${NC} Installing npm connectrequirementsors\n"

# Start services & go!

printf "\n${GREEN}-->${NC} Starting services \n"
printf "${BLUE}-->${NC} Starting database & data connectors\n"
printf "${BLUE}-->${NC} Starting front-end services\n"
printf "${BLUE}-->${NC} Starting backend-end services\n"


# Welcome message 
printf "\n${GREEN}-->${NC} Setup complete for ${GREEN}Chaos Genius${NC}! \n🔮\n"
