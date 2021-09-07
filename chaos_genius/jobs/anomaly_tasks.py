from typing import cast

from celery import group
from celery.app.base import Celery

from chaos_genius.controllers.kpi_controller import run_anomaly_for_kpi
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
    status = run_anomaly_for_kpi(kpi_id, end_date)
    if status:
        print(f"Completed the anomaly for KPI ID: {kpi_id}.")
    else:
        print(f"Anomaly failed for the for KPI ID: {kpi_id}.")
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
