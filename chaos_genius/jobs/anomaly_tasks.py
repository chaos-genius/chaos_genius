from datetime import datetime
from typing import cast

from celery import chain, group
from celery.app.base import Celery
from sqlalchemy.orm.attributes import flag_modified

from chaos_genius.controllers.kpi_controller import run_anomaly_for_kpi
from chaos_genius.controllers.kpi_controller import run_rca_for_kpi
from chaos_genius.databases.models.kpi_model import Kpi
from chaos_genius.extensions import celery as celery_ext

celery = cast(Celery, celery_ext.celery)


@celery.task
def add_together(a, b):
    print(a + b)
    print("It works...xD")
    # return a + b


@celery.task
def anomaly_single_kpi(kpi_id, end_date=None):
    """Run anomaly detection for the given KPI ID.

    Must be run as a celery task.
    """

    status = run_anomaly_for_kpi(kpi_id, end_date)
    kpi = cast(Kpi, Kpi.get_by_id(kpi_id))
    anomaly_params = kpi.anomaly_params

    if status:
        print(f"Completed the anomaly for KPI ID: {kpi_id}.")
        anomaly_params["scheduler_params"]["anomaly_status"] = "completed"
    else:
        print(f"Anomaly failed for the for KPI ID: {kpi_id}.")
        anomaly_params["scheduler_params"]["anomaly_status"] = "failed"

    flag_modified(kpi, "anomaly_params")
    kpi.update(commit=True, anomaly_params=anomaly_params)

    return status


@celery.task
def rca_single_kpi(anomaly_status: bool, kpi_id: int):
    """Run RCA for the given KPI ID.

    Must be run as a celery task.
    """
    kpi = cast(Kpi, Kpi.get_by_id(kpi_id))
    anomaly_params = kpi.anomaly_params

    if not anomaly_status:
        print(f"Skipping RCA since anomaly failed for KPI ID: {kpi_id}")

        anomaly_params["scheduler_params"]["rca_status"] = "failed"
        flag_modified(kpi, "anomaly_params")
        kpi.update(commit=True, anomaly_params=anomaly_params)

        return anomaly_status

    status = run_rca_for_kpi(kpi_id)

    if status:
        print(f"Completed RCA for KPI ID: {kpi_id}")
        anomaly_params["scheduler_params"]["rca_status"] = "completed"
    else:
        print(f"RCA FAILED for KPI ID: {kpi_id}")
        anomaly_params["scheduler_params"]["rca_status"] = "failed"

    flag_modified(kpi, "anomaly_params")
    kpi.update(commit=True, anomaly_params=anomaly_params)

    return status


@celery.task
def anomaly_kpi():
    kpis = Kpi.query.distinct("kpi_id").filter(
        (Kpi.run_anomaly == True) & (Kpi.active == True)
    )
    task_group = []
    for kpi in kpis:
        print(f"Starting anomaly task for KPI: {kpi.id}")
        task_group.append(anomaly_single_kpi.s(kpi.id))
    g = group(task_group)
    res = g.apply_async()
    return res


# runs every hour
# if hour > scheduled hour, run task
# last_scheduled_time -> if it's < specified hour of today's date, run task
@celery.task
def anomaly_scheduler():
    # find KPIs
    kpis: Kpi = Kpi.query.distinct("kpi_id").filter(
        (Kpi.run_anomaly == True) & (Kpi.active == True)
    )
    task_group = []

    for kpi in kpis:
        kpi: Kpi
        # get scheduler_params, will be None if it's not set
        scheduler_params = kpi.anomaly_params.get("scheduler_params")

        # assume 11am if it's not set
        hour = 11
        if scheduler_params is not None and "hour" in scheduler_params:
            hour = scheduler_params["hour"]

        scheduled_time = datetime.now()
        # today's date, but at 11:00:00am
        scheduled_time = scheduled_time.replace(hour=hour, minute=0, second=0)
        current_time = datetime.now()

        # check if it's already run
        already_run = False
        if (
            scheduler_params is not None
            and "last_scheduled_time" in scheduler_params
            and datetime.fromisoformat(scheduler_params["last_scheduled_time"])
            > scheduled_time
        ):
            already_run = True

        if not already_run and current_time > scheduled_time:
            print(f"Running anomaly for KPI: {kpi.id}")
            task_group.append(
                chain(anomaly_single_kpi.s(kpi.id), rca_single_kpi.s(kpi.id))
            )

            new_scheduler_params = (
                scheduler_params if scheduler_params is not None else {}
            )
            new_scheduler_params["last_scheduled_time"] = current_time.isoformat()
            new_scheduler_params["anomaly_status"] = "in-progress"
            new_scheduler_params["rca_status"] = "in-progress"
            anomaly_params = kpi.anomaly_params
            anomaly_params["scheduler_params"] = new_scheduler_params

            flag_modified(kpi, "anomaly_params")
            kpi.update(commit=True, anomaly_params=anomaly_params)

    if not task_group:
        print("Found no pending KPI tasks.")
        return []

    g = group(task_group)
    res = g.apply_async()
    return res
