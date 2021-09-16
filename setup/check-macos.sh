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



# Welcome message 
printf "\n${GREEN}-->${NC} System is compatiable for ${GREEN}Chaos Genius${NC}! \n🔮\n"

