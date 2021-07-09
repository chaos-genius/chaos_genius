#!/bin/bash

# Check core dependencies

if ! hash python3; then
    echo "python3 is not installed"
    echo "You can install it by 'brew install python@3.8'"
    exit 1
fi

ver=$(python3 -V 2>&1 | sed 's/.* \([0-9]\).\([0-9]\).*/\1\2/')
if [ "$ver" -lt "38" ]; then
    echo "Chaos Genius requires python 3.8 or greater"
    exit 1
fi

if ! hash docker; then
    echo "docker is not installed"
    echo "You can install it by 'brew install docker'"
    exit 1
fi


# Check & install DB & connector dependencies



# Install python & npm requirements


# Start services & go!