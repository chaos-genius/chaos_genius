from datetime import datetime, timedelta
from typing import Optional, cast

from celery import group
from celery.app.base import Celery
from celery.utils.log import get_task_logger
from sqlalchemy import func
from sqlalchemy.orm.attributes import flag_modified
from sqlalchemy.sql.functions import coalesce

from chaos_genius.alerts import trigger_anomaly_alerts_for_kpi
from chaos_genius.controllers.task_monitor import (
    checkpoint_failure,
    checkpoint_initial,
    checkpoint_success,
)

from chaos_genius.controllers.kpi_controller import get_anomaly_kpis, get_active_kpis
from chaos_genius.databases.models.kpi_model import Kpi
from chaos_genius.extensions import celery as celery_ext

celery = cast(Celery, celery_ext.celery)
logger = get_task_logger(__name__)


def update_scheduler_params(key: str, value: str):
    """Update a single key in scheduler_params.

    The return value *must* be assigned back to kpi.scheduler_params
    and scheduler_params must be flagged as modified
    and then the Kpi must be updated and saved in DB.

    Warning: do not call this twice before saving to DB. The previous
    change will be lost.
    """
    # TODO: Move this into KPI controller
    return func.jsonb_set(
        coalesce(Kpi.scheduler_params, "{}"), "{" + key + "}", f'"{value}"'
    )


@celery.task
def anomaly_single_kpi(kpi_id, end_date=None):
    """Run anomaly detection for the given KPI ID.

    Must be run as a celery task.
    """
    # TODO: fix circular import
    from chaos_genius.controllers.kpi_controller import run_anomaly_for_kpi

    logger.info(f"Running anomaly for KPI ID: {kpi_id}")
    checkpoint = checkpoint_initial(
        kpi_id, "Anomaly", "Anomaly Scheduler - Task initiated"
    )
    task_id = checkpoint.task_id

    anomaly_end_date = run_anomaly_for_kpi(kpi_id, end_date, task_id=task_id)

    kpi = cast(Kpi, Kpi.get_by_id(kpi_id))

    def _checkpoint_success(checkpoint: str):
        checkpoint_success(task_id, kpi.id, "Anomaly", checkpoint)
        logger.info(
            "(Task: %s, KPI: %d)" " Anomaly - %s - Success", task_id, kpi.id, checkpoint
        )

    def _checkpoint_failure(checkpoint: str, e: Optional[Exception]):
        checkpoint_failure(
            task_id,
            kpi.id,
            "Anomaly",
            checkpoint,
            e,
        )
        logger.exception(
            "(Task: %s, KPI: %d) " "Anomaly - %s - Exception occured.",
            task_id,
            kpi.id,
            checkpoint,
            exc_info=e,
        )

    if anomaly_end_date:
        logger.info(f"Completed the anomaly for KPI ID: {kpi_id}.")
        kpi.scheduler_params = update_scheduler_params("anomaly_status", "completed")
        _checkpoint_success("Anomaly complete")
        try:
            # anomaly_end_date is same as the last date (of data in DB)
            _, errors = trigger_anomaly_alerts_for_kpi(kpi, anomaly_end_date)
            if not errors:
                logger.info(f"Triggered the alerts for KPI {kpi_id}.")
                _checkpoint_success("Alert trigger")
            else:
                logger.error(f"Alert trigger failed for the KPI ID: {kpi_id}.")
                _checkpoint_failure("Alert trigger", None)
        except Exception as e:
            logger.error(f"Alert trigger failed for the KPI ID: {kpi_id}.", exc_info=e)
            _checkpoint_failure("Alert trigger", e)
    else:
        logger.error(f"Anomaly failed for the for KPI ID: {kpi_id}.")
        kpi.scheduler_params = update_scheduler_params("anomaly_status", "failed")
        _checkpoint_failure("Anomaly complete", None)

    flag_modified(kpi, "scheduler_params")
    kpi.update(commit=True)

    return anomaly_end_date


@celery.task
def rca_single_kpi(kpi_id: int):
    """Run RCA for the given KPI ID.

    Must be run as a celery task.
    """
    # TODO: Fix circular imports
    from chaos_genius.controllers.kpi_controller import run_rca_for_kpi

    print(f"Running RCA for KPI ID: {kpi_id}")
    checkpoint = checkpoint_initial(
        kpi_id, "DeepDrills", "DeepDrills Scheduler - Task initiated"
    )
    task_id = checkpoint.task_id

    status = run_rca_for_kpi(kpi_id, task_id=task_id)

    kpi = cast(Kpi, Kpi.get_by_id(kpi_id))

    if status:
        print(f"Completed RCA for KPI ID: {kpi_id}")
        kpi.scheduler_params = update_scheduler_params("rca_status", "completed")
    else:
        print(f"RCA FAILED for KPI ID: {kpi_id}")
        kpi.scheduler_params = update_scheduler_params("rca_status", "failed")

    flag_modified(kpi, "scheduler_params")
    kpi.update(commit=True)

    return status


@celery.task
def anomaly_kpi():
    kpis = get_anomaly_kpis()
    task_group = []
    for kpi in kpis:
        print(f"Starting anomaly task for KPI: {kpi.id}")
        task_group.append(anomaly_single_kpi.s(kpi.id))
    g = group(task_group)
    res = g.apply_async()
    return res


def ready_anomaly_task(kpi_id: int):
    """Set anomaly in-progress and update last_scheduled_time for the KPI.

    Returns a Celery task that *must* be executed (using .apply_async) soon.
    Returns None if the KPI does not exist.
    """
    # get scheduler_params
    kpi = Kpi.get_by_id(kpi_id)
    if kpi is None:
        return None

    # update scheduler params
    kpi.scheduler_params = update_scheduler_params(
        "last_scheduled_time_anomaly", datetime.now().isoformat()
    )
    # write back scheduler_params
    flag_modified(kpi, "scheduler_params")
    kpi = kpi.update(commit=True)

    kpi.scheduler_params = update_scheduler_params("anomaly_status", "in-progress")
    # write back scheduler_params
    flag_modified(kpi, "scheduler_params")
    kpi = kpi.update(commit=True)

    return anomaly_single_kpi.s(kpi_id)


def ready_rca_task(kpi_id: int):
    """Set RCA in-progress and update last_scheduled_time for the KPI.

    Returns a Celery task that *must* be executed (using .apply_async) soon.
    Returns None if the KPI does not exist.
    """
    # get scheduler_params
    kpi = Kpi.get_by_id(kpi_id)
    if kpi is None:
        return None

    # update scheduler params
    kpi.scheduler_params = update_scheduler_params(
        "last_scheduled_time_rca", datetime.now().isoformat()
    )
    # write back scheduler_params
    flag_modified(kpi, "scheduler_params")
    kpi = kpi.update(commit=True)

    kpi.scheduler_params = update_scheduler_params("rca_status", "in-progress")

    # write back scheduler_params
    flag_modified(kpi, "scheduler_params")
    kpi.update(commit=True)

    return rca_single_kpi.s(kpi_id)

