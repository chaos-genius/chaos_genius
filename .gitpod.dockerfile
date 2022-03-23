FROM gitpod/workspace-postgres

# Install Redis.
RUN sudo apt-get update  && \
    sudo apt-get install -y redis-server && \
    sudo rm -rf /var/lib/apt/lists/*

ENV PYTHONUSERBASE=/workspace/.pip-modules
ENV PATH=$PYTHONUSERBASE/bin:$PATH
ENV PIP_USER=yes