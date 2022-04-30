FROM ubuntu:20.04

WORKDIR /usr/src/app

RUN apt-get update \
    && apt-get install -y python3-pip

COPY requirements /requirements

ARG DEV

RUN pip install -r /requirements/prod.txt ${DEV:+-r /requirements/dev.txt} --no-cache-dir

COPY . .
