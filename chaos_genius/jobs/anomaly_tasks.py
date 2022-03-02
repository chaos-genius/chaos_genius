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


# runs every N time (set in celery_config)
# if time > scheduled time today, run task
# last_scheduled_time -> if it's < specified time of today's date, run task
# TODO: Need to add logic for running RCA after KPI setup.
@celery.task
def anomaly_scheduler():

    task_group = []
    kpis = get_active_kpis()
    for kpi in kpis:
        # if anomaly isn't setup yet, we still run RCA at     tR + 24 hours
        # if anomaly is setup, we run both anomaly and RCA at tA + 24 hours

        # get scheduler_params, will be None if it's not set
        scheduler_params = kpi.scheduler_params

        scheduled_time = datetime.now()
        scheduled_time = scheduled_time.replace(hour=11, minute=0, second=0)
        if scheduler_params is not None and "time" in scheduler_params:
            # HH:MM:SS
            # this is tA
            hour, minute, second = map(int, scheduler_params["time"].split(":"))

            scheduled_time = datetime.now()
            # today's date, but at HH:MM:SS
            scheduled_time = scheduled_time.replace(
                hour=hour, minute=minute, second=second
            )
        else:
            # today's date, but at rca time (tR) or at kpi creation time
            scheduled_time = datetime.now()
            # this is tR
            if scheduler_params is not None and "rca_time" in scheduler_params:
                hour, minute, second = map(int, scheduler_params["rca_time"].split(":"))
                scheduled_time = scheduled_time.replace(
                    hour=hour, minute=minute, second=second
                )
            else:
                # this is kpi creation time
                canon_time = kpi.created_at
                scheduled_time = scheduled_time.replace(
                    hour=canon_time.hour,
                    minute=canon_time.minute,
                    second=canon_time.second,
                )

        current_time = datetime.now()

        # check if we have to run anomaly:
        # 1. not already scheduled today
        # 2. anomaly is set up
        #
        # anomaly is setup if model_name is set in anomaly_params
        anomaly_is_setup = (
            kpi.anomaly_params is not None and "model_name" in kpi.anomaly_params
        )
        anomaly_already_run = (
            scheduler_params is not None
            and "last_scheduled_time_anomaly" in scheduler_params
            and datetime.fromisoformat(scheduler_params["last_scheduled_time_anomaly"])
            > scheduled_time
        )
        to_run_anomaly = (not anomaly_already_run) and anomaly_is_setup

        # check if we have to run RCA
        # 1. if not already scheduled today
        # 2. if anomaly is scheduled, run RCA too
        rca_already_run = (
            scheduler_params is not None
            and "last_scheduled_time_rca" in scheduler_params
            and datetime.fromisoformat(scheduler_params["last_scheduled_time_rca"])
            > scheduled_time
        )
        to_run_rca = to_run_anomaly or (not rca_already_run)

        if current_time > scheduled_time and (to_run_rca or to_run_anomaly):

            if to_run_anomaly:
                print(f"Scheduling anomaly for KPI: {kpi.id}")
                task_group.append(ready_anomaly_task(kpi.id))

            if to_run_rca:
                print(f"Scheduling RCA for KPI: {kpi.id}")
                task_group.append(ready_rca_task(kpi.id))

    if not task_group:
        print("Found no pending KPI tasks.")
        return []

    g = group(task_group)
    res = g.apply_async()
    return res
