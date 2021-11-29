"""A basic view for monitoring services and analytics tasks status."""

from typing import Dict, Optional, cast

from docker.errors import NotFound as ContainerNotFound
from docker.models.containers import Container
from flask import Blueprint, render_template
from chaos_genius.settings import IN_DOCKER
import docker
from chaos_genius.controllers.task_monitor import get_checkpoints

blueprint = Blueprint("status", __name__, static_folder="../static")

client=None
if IN_DOCKER:
    client = docker.from_env()

CONTAINERS: Dict[str, str] = {
    "chaosgenius-server": "ChaosGenius API Server",
    "chaosgenius-webapp": "ChaosGenius WebApp",
    "chaosgenius-db": "ChaosGenius Database",
    "chaosgenius-redis": "ChaosGenius Redis",
    "chaosgenius-scheduler": "ChaosGenius Scheduler",
    "chaosgenius-worker-analytics": "ChaosGenius Analytics Worker",
    "chaosgenius-worker-alerts": "ChaosGenius Alerts Worker",
    "airbyte-db": "Airbyte Database",
    "airbyte-scheduler": "Airbyte Scheduler",
    "airbyte-server": "Airbyte Server",
    "airbyte-webapp": "Airbyte WebApp",
    "airbyte-temporal": "Airbyte Temporal",
}


def container_status() -> Optional[Dict[str, bool]]:
    """Get status of all ChaosGenius containers.

    Returns:
        None if not running using docker-compose.
        A dict mapping container names to status (True if up
            and False if down)
    """
    if IN_DOCKER:
        status = {}
        for container_name in CONTAINERS:
            try:
                container = cast(Container, client.containers.get(container_name))
                status[container_name] = container.status == "running"
            except ContainerNotFound:
                status[container_name] = False

        return status
    else:
        return None


@blueprint.route("/", methods=["GET"])
def task_monitor_view():
    """A view with a basic UI to monitor analytics tasks."""
    tasks = get_checkpoints(track_subtasks=False)
    containers = container_status()

    return render_template(
        "status.html",
        tasks=tasks,
        enumerate=enumerate,
        str=str,
        container_status=containers,
        CONTAINERS=CONTAINERS,
    )
