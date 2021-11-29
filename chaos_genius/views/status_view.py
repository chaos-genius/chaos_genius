"""A basic view for monitoring services and analytics tasks status."""

from flask import Blueprint, render_template

from chaos_genius.controllers.task_monitor import get_checkpoints

blueprint = Blueprint("status", __name__, static_folder="../static")


@blueprint.route("/", methods=["GET"])
def task_monitor_view():
    """A view with a basic UI to monitor analytics tasks."""
    tasks = get_checkpoints(track_subtasks=False)
    return render_template("status.html", tasks=tasks, enumerate=enumerate, str=str)
