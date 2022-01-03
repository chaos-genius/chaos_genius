FROM ubuntu:20.04

WORKDIR /usr/src/app

RUN apt-get update \
    && apt-get install -y python3-pip

COPY requirements /requirements

RUN pip install -r /requirements/prod.txt --no-cache-dir

COPY . .
