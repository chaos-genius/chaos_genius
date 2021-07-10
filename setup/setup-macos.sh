#!/bin/bash

# Check core dependencies

if ! hash python3; then
    echo "Chaos Genius requires python3. It is not installed."
    echo "You can install it by 'brew install python@3.8'"
    exit 1
fi

python_ver=$(python3 -V 2>&1 | sed 's/.* \([0-9]\).\([0-9]\).*/\1\2/')
#echo $python_ver
if [ "$python_ver" -lt "38" ]; then
    echo "Chaos Genius requires python 3.8 or greater"
    exit 1
fi

if ! hash npm; then
    echo "Chaos Genius requires npm. It is not installed."
    echo "You can install it by 'brew install npm'"
    exit 1
fi

npm_ver=$(npm -v 2>&1 | sed 's/.*\([0-9]\).\([0-9]\).\([0-9]\).*/\1\2/')
#echo $npm_ver
if [ "$npm_ver" -lt "60" ]; then
    echo "Chaos Genius requires npm 6.0 or greater"
    exit 1
fi

if ! hash node; then
    echo "Chaos Genius requires node. It is not installed."
    echo "You can install it by 'brew install node'"
    exit 1
fi

node_ver=$(node -v 2>&1 | sed 's/.*v\([0-9]*\).\([0-9]\).\([0-9]\).*/\1\2/')
#echo $node_ver
if [ "$npm_ver" -lt "140" ]; then
    echo "Chaos Genius requires node 14.0 or greater"
    exit 1
fi

if ! hash docker; then
    echo "Chaos Genius requires python3. It is not installed."
    echo "You can install it by 'brew install docker'"
    exit 1
fi

# docker_ver = $(docker -v 2>&1 |  sed 's/.* \([0-9]\).\([0-9]\).*/\1\2/')
# echo $docker_ver
# echo "test"

# Check & install DB & connector dependencies



# Install python & npm requirements


# Start services & go!