"""Basic view for monitoring analytics tasks."""

from flask import Blueprint, render_template

from chaos_genius.controllers.task_monitor import get_checkpoints

blueprint = Blueprint("monitor", __name__, static_folder="../static")


@blueprint.route("/", methods=["GET"])
def task_monitor_view():
    """A view with a basic UI to monitor analytics tasks."""
    tasks = get_checkpoints()
    return render_template("jobs.html", tasks=tasks, enumerate=enumerate, str=str)
