"""A basic view for monitoring services and analytics tasks status."""

import logging
from typing import Dict, Optional, cast

from docker.errors import DockerException
from docker.errors import NotFound as ContainerNotFound
from docker.models.containers import Container
from flask import Blueprint, render_template

import docker
from chaos_genius.controllers.task_monitor import get_checkpoints
from chaos_genius.settings import AIRBYTE_ENABLED, IN_DOCKER

blueprint = Blueprint("status", __name__, static_folder="../static")
logger = logging.getLogger(__name__)

client = None
if IN_DOCKER:
    try:
        client = docker.from_env()
    except DockerException as e:
        logger.exception("Could not initialize docker client", exc_info=e)


_CHAOS_GENIUS_CONTAINERS: Dict[str, str] = {
    "chaosgenius-server": "ChaosGenius API Server",
    "chaosgenius-webapp": "ChaosGenius WebApp",
    "chaosgenius-db": "ChaosGenius Database",
    "chaosgenius-redis": "ChaosGenius Redis",
    "chaosgenius-scheduler": "ChaosGenius Scheduler",
    "chaosgenius-worker-analytics": "ChaosGenius Analytics Worker",
    "chaosgenius-worker-alerts": "ChaosGenius Alerts Worker",
}

_AIRBYTE_CONTAINERS: Dict[str, str] = {
    "airbyte-db": "Airbyte Database",
    "airbyte-scheduler": "Airbyte Scheduler",
    "airbyte-server": "Airbyte Server",
    "airbyte-webapp": "Airbyte WebApp",
    "airbyte-temporal": "Airbyte Temporal",
}

CONTAINERS = {**_CHAOS_GENIUS_CONTAINERS}
if AIRBYTE_ENABLED:
    CONTAINERS = {**_CHAOS_GENIUS_CONTAINERS, **_AIRBYTE_CONTAINERS}


def container_status() -> Optional[Dict[str, bool]]:
    """Get status of all ChaosGenius containers.

    Returns:
        None if not running using docker-compose.
        A dict mapping container names to status (True if up
            and False if down)
    """
    if IN_DOCKER:
        status = {}

        if client is None:
            raise Exception("Docker client is not initialized")

        for container_name in CONTAINERS:
            try:
                container = cast(Container, client.containers.get(container_name))
                status[container_name] = container.status == "running"
            except ContainerNotFound:
                status[container_name] = False

        return status
    else:
        return None


@blueprint.route("/", methods=["GET"])  # TODO: Remove this
@blueprint.route("", methods=["GET"])
def task_monitor_view():
    """A view with a basic UI to monitor analytics tasks."""
    tasks = get_checkpoints(track_subtasks=False, include_github_issue_link=True)
    containers = container_status()

    return render_template(
        "status.html",
        tasks=tasks,
        enumerate=enumerate,
        str=str,
        repr=repr,
        list=list,
        container_status=containers,
        CONTAINERS=CONTAINERS,
    )
