"""Utilities for logging and monitoring tasks."""

import traceback
from typing import Optional

from sqlalchemy import func

from chaos_genius.databases.models.task_model import Task
from chaos_genius.extensions import db


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
        + 1
    )

    error = None
    if exc_info is not None:
        error = "".join(traceback.format_tb(exc_info.__traceback__))
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
    exc_info: Exception
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
