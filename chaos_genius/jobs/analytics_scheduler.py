"""Analytics Scheduler"""
from datetime import datetime
from typing import Iterable, cast

from celery import group
from celery.app.base import Celery

from chaos_genius.databases.models.kpi_model import Kpi
from chaos_genius.extensions import celery as celery_ext

from .anomaly_tasks import ready_anomaly_task, ready_rca_task

celery = cast(Celery, celery_ext.celery)


class AnalyticsScheduler:
    """Handles scheduling of all analytics related tasks"""

    def __init__(self):
        """[summary]"""
        self.task_group = []

    def _get_scheduled_time(self, kpi: Kpi):

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
        return scheduled_time

    def _to_run_anomaly(self, kpi: Kpi, scheduled_time: datetime) -> bool:
        # check if we have to run anomaly:
        # 1. not already scheduled today
        # 2. anomaly is set up
        # anomaly is setup if model_name is set in anomaly_params
        scheduler_params = kpi.scheduler_params
        anomaly_is_setup = (
            kpi.anomaly_params is not None and "model_name" in kpi.anomaly_params
        )
        anomaly_already_run = (
            scheduler_params is not None
            and "last_scheduled_time_anomaly" in scheduler_params
            and datetime.fromisoformat(scheduler_params["last_scheduled_time_anomaly"])
            > scheduled_time
        )
        return (not anomaly_already_run) and anomaly_is_setup

    def _to_run_rca(self, kpi: Kpi, scheduled_time: datetime, to_run_anomaly):
        # check if we have to run RCA
        # 1. if not already scheduled today
        # 2. if anomaly is scheduled, run RCA too

        # TODO: make rca time column and eliminate duplicate RCA run
        scheduler_params = kpi.scheduler_params
        rca_already_run = (
            scheduler_params is not None
            and "last_scheduled_time_rca" in scheduler_params
            and datetime.fromisoformat(scheduler_params["last_scheduled_time_rca"])
            > scheduled_time
        )
        return to_run_anomaly or (not rca_already_run)

    def _active_kpis(self):
        kpis: Iterable[Kpi] = Kpi.query.distinct("kpi_id").filter(
            (Kpi.active == True) & (Kpi.is_static == False)  # noqa: E712
        )
        return kpis

    def _add_tasks_to_group(
        self,
        kpi: Kpi,
        to_run_anomaly: bool,
        to_run_rca: bool,
        current_time: datetime,
        scheduled_time: datetime,
    ):
        if current_time > scheduled_time and (to_run_rca or to_run_anomaly):

            if to_run_anomaly:
                print(f"Scheduling anomaly for KPI: {kpi.id}")
                self.task_group.append(ready_anomaly_task(kpi.id))

            if to_run_rca:
                print(f"Scheduling RCA for KPI: {kpi.id}")
                self.task_group.append(ready_rca_task(kpi.id))

    def _run_task_group(self):

        if not self.task_group:
            print("Found no pending KPI tasks.")
            return []

        g = group(self.task_group)
        res = g.apply_async()

        return res

    @celery.task
    def scheduler(self):

        for kpi in self._active_kpis():
            # if anomaly isn't setup yet, we still run RCA at     tR + 24 hours
            # if anomaly is setup, we run both anomaly and RCA at tA + 24 hours

            scheduled_time = self._get_scheduled_time(kpi)
            current_time = datetime.now()

            to_run_anomaly = self._to_run_anomaly(kpi, scheduled_time)

            to_run_rca = self._to_run_rca(kpi, scheduled_time, to_run_anomaly)

            self._add_tasks_to_queue(
                kpi, to_run_anomaly, to_run_rca, current_time, scheduled_time
            )

        return self._run_task_group()
