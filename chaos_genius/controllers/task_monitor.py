"""Utilities for logging and monitoring tasks."""

import traceback
from typing import List, Optional

from pygments import highlight
from pygments.formatters import HtmlFormatter
from pygments.lexers import PythonTracebackLexer
from pygments.style import Style
from pygments.token import Generic, Name, Number
from sqlalchemy import func

from chaos_genius.controllers.github_issue_generator import generate_github_issue_link
from chaos_genius.databases.models.kpi_model import Kpi
from chaos_genius.databases.models.task_model import Task
from chaos_genius.extensions import db
from chaos_genius.settings import TASK_CHECKPOINT_LIMIT


def checkpoint_initial(
    kpi_id: int,
    analytics_type: str,
    checkpoint: str,
    status: str = "Success",
    exc_info: Optional[Exception] = None,
) -> Task:
    """Log a task for the first time. Used to get a task_id.

    Args:
        kpi_id (int): ID for the KPI which this task is associated with.
        analytics_type (str): type of task being monitored (Anomaly or DeepDrill)
        checkpoint (str): name or description of this checkpoint.
        status (str): of this checkpoint. One of "Success" or "Failure".
        exc_info (Optional[Exception]): exception object, if status is Failure.
    """
    error = None
    if exc_info is not None:
        error = "".join(traceback.format_tb(exc_info.__traceback__))
    new_checkpoint = Task(
        kpi_id=kpi_id,
        analytics_type=analytics_type,
        checkpoint=checkpoint,
        status=status,
        error=error,
    )
    new_checkpoint = new_checkpoint.save(commit=True)

    return new_checkpoint


def _checkpoint(
    task_id: int,
    kpi_id: int,
    analytics_type: str,
    checkpoint: str,
    status: str,
    exc_info: Optional[Exception] = None,
) -> Task:
    """Log a checkpoint for a task.

    Args:
        task_id (int): ID for the task to log.
        kpi_id (int): ID for the KPI which this task is associated with.
        analytics_type (str): type of task being monitored (Anomaly or DeepDrill)
        checkpoint (str): name or description of this checkpoint.
        status (str): of this checkpoint. One of "Success" or "Failure".
        exc_info (Optional[Exception]): exception object, if status is Failure.
    """
    checkpoint_id = (
        db.session.query(func.max(Task.checkpoint_id))
        .filter(Task.task_id == task_id)
        .first()
    )
    checkpoint_id = checkpoint_id[0] + 1

    error = None
    if exc_info is not None:
        exc_main_info = f"{type(exc_info).__name__}: {exc_info}"
        error = exc_main_info + "\n" + "".join(traceback.format_exception(exc_info.__class__, exc_info, exc_info.__traceback__))
    new_checkpoint = Task(
        task_id=task_id,
        kpi_id=kpi_id,
        checkpoint_id=checkpoint_id,
        analytics_type=analytics_type,
        checkpoint=checkpoint,
        status=status,
        error=error,
    )
    new_checkpoint = new_checkpoint.save(commit=True)

    return new_checkpoint


def checkpoint_success(
    task_id: int,
    kpi_id: int,
    analytics_type: str,
    checkpoint: str,
) -> Task:
    """Log a successful checkpoint for a task.

    Args:
        task_id (int): ID for the task to log.
        kpi_id (int): ID for the KPI which this task is associated with.
        analytics_type (str): type of task being monitored (Anomaly or DeepDrill)
        checkpoint (str): name or description of this checkpoint.
    """
    return _checkpoint(task_id, kpi_id, analytics_type, checkpoint, "Success")


def checkpoint_failure(
    task_id: int,
    kpi_id: int,
    analytics_type: str,
    checkpoint: str,
    exc_info: Optional[Exception]
) -> Task:
    """Log a failed checkpoint for a task.

    Args:
        task_id (int): ID for the task to log.
        kpi_id (int): ID for the KPI which this task is associated with.
        analytics_type (str): type of task being monitored (Anomaly or DeepDrill)
        checkpoint (str): name or description of this checkpoint.
        exc_info (Optional[Exception]): exception object
    """
    return _checkpoint(task_id, kpi_id, analytics_type, checkpoint, "Failure", exc_info)


class _CustomErrorStyle(Style):
    default_style = ""
    background_color = "#F1F5F9"

    styles = {
        Generic.Error: "bold #ef4444",
        Generic.Traceback: "#3730a3",
        Number: "#1d4ed8",
        Name.Builtin: "#059669",
    }


def get_checkpoints(
    sort_by_task_id=True,
    kpi_info=True,
    track_subtasks=True,
    highlight_error=True,
    include_github_issue_link=False,
) -> List[Task]:
    """Get all task checkpoints as a list of Task objects.

    Args:
        sort_by_task_id (bool): whether to sort by task_id, descending (default: True)
        kpi_info (bool): whether to include kpi_name in the Tasks (default: True)
        track_subtasks (bool): whether to include completed_subtasks and total_subtasks in the Tasks (default: True)
        highlight_error (bool): whether to highlight error using Pygments and make the error field an HTML string (default: True)
        include_github_issue_link (bool): whether to generate a new GitHub issue link for tasks which have error (default: False)
    """
    if sort_by_task_id:
        tasks: List[Task] = (
            Task.query.order_by(Task.task_id.desc(), Task.timestamp.desc())
            .limit(TASK_CHECKPOINT_LIMIT)
            .all()
        )
    else:
        tasks: List[Task] = (
            Task.query.order_by(Task.timestamp.desc())
            .limit(TASK_CHECKPOINT_LIMIT)
            .all()
        )

    valid_tasks = tasks

    if kpi_info:
        subtasks_cache = {}
        total_tasks_cache = {}

        valid_tasks: List[Task] = []

        for task in tasks:
            kpi: Kpi | None = Kpi.get_by_id(task.kpi_id)

            if kpi is None:
                continue

            valid_tasks.append(task)

            task.kpi_name = kpi.name

            if include_github_issue_link and task.error:
                task.github_issue_link = generate_github_issue_link(task)

            if highlight_error and task.error:
                # TODO: use a single CSS file if there are too many errors
                error_header, error_body = task.error.split("\n", maxsplit=1)
                task.error = error_header + "\n" + highlight(
                        error_body,
                        PythonTracebackLexer(),
                        HtmlFormatter(
                            noclasses=True,
                            cssstyles="overflow-x: auto; padding: 0.5rem;",
                            style=_CustomErrorStyle
                        )
                )

            if track_subtasks:

                key = (kpi.id, task.analytics_type)

                if key not in total_tasks_cache:
                    if task.analytics_type == "Anomaly":
                        from chaos_genius.core.anomaly.controller import AnomalyDetectionController
                        total_tasks = AnomalyDetectionController.total_tasks(kpi)
                    elif task.analytics_type == "DeepDrills":
                        # TODO: implement this in RCA Controller
                        total_tasks = 10
                    else:
                        raise ValueError(f"Unknown analytics type: {task.analytics_type} for {task}")
                    total_tasks_cache[key] = total_tasks

                if task.task_id not in subtasks_cache:
                    subtasks_cache[task.task_id] = [0]

                task.completed_subtasks = subtasks_cache[task.task_id]
                subtasks_cache[task.task_id][0] += 1
                task.total_subtasks = total_tasks_cache[key]

    return valid_tasks
