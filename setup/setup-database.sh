#!/bin/bash

GREEN='\033[1;32m' # Green
BLUE='\033[1;34m' # Blue
GRAY='\033[0;37m' # Grey
RED='\033[1;31m' # Blue
NC='\033[0m' # No Color


while true; do
    printf "${GREEN}-->${NC} Please make sure that you have changed the config in the .env file in case of custom postgresql installation.\n"
    read -p "Selct [y/n] for confirmation: " yn
    case $yn in
        [Yy]* ) break;;
        [Nn]* ) exit;;
        * ) echo "Please answer y/Y or n/N.";;
    esac
done

printf "${GREEN}-->${NC} Starting the database setup...\n"
source .venv/bin/activate
source .env
flask db upgrade
flask integration-connector
printf "${GREEN}-->${NC} Database setup done...\n"
