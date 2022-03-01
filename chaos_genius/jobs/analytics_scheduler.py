"""Analytics Scheduler"""
from datetime import datetime
from typing import Dict, Iterable, Literal, Union, cast

from celery import group
from celery.app.base import Celery

from chaos_genius.databases.models.kpi_model import Kpi
from chaos_genius.extensions import celery as celery_ext

from .anomaly_tasks import ready_anomaly_task, ready_rca_task, update_scheduler_params

celery = cast(Celery, celery_ext.celery)


class AnalyticsScheduler:
    """Handles scheduling of all analytics related tasks"""

    def __init__(self):
        """[summary]"""
        self.task_group = []
        # schedule hourly KPIs after the 10th minute of every hour
        self.hourly_schedule_run_minute = 10

    def _get_scheduled_time_daily(self, kpi: Kpi, time_field: str = "time"):
        """Calculate scheduled time for a daily run.

        `time_field` is the field in scheduler_params which contains the
        scheduled time. KPI creation time will be considered if this is not
        set.
        """
        scheduler_params: Dict[str, str] = kpi.scheduler_params or {}

        scheduled_time = datetime.now()

        if time_field in scheduler_params:
            hour, minute, second = map(int, scheduler_params[time_field].split(":"))
            scheduled_time = scheduled_time.replace(
                hour=hour, minute=minute, second=second
            )
        else:
            creation_time = kpi.created_at
            scheduled_time = scheduled_time.replace(
                hour=creation_time.hour,
                minute=creation_time.minute,
                second=creation_time.second,
            )

        return scheduled_time

    def _get_scheduled_time_hourly(self, kpi: Kpi, time_field: str = "time"):
        """Calculate scheduled time for an hourly run.

        `time_field` is the field in scheduler_params which contains the
        scheduled time. This will be considered only if it's present and
        has only MM:SS.
        """
        scheduler_params: Dict[str, str] = kpi.scheduler_params or {}

        scheduled_time = datetime.now()

        # consider time_field only if it's present and has only MM:SS
        if (
            time_field in scheduler_params
            and len(scheduler_params[time_field].split(":")) == 2
        ):
            minute, second = map(int, scheduler_params[time_field].split(":"))
            scheduled_time = scheduled_time.replace(minute=minute, second=second)
        else:
            scheduled_time = scheduled_time.replace(
                minute=self.hourly_schedule_run_minute,
                second=0,
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
        if "rca_time" not in scheduler_params:
            scheduler_params["rca_time"] = scheduler_params["last_scheduled_time_rca"].split("T")[-1]
            update_scheduler_params("rca_time", scheduler_params["rca_time"])

        if (
            scheduler_params is not None
            and "scheduler_frequency" in scheduler_params
            and scheduler_params["scheduler_frequency"] == "H"
        ):
            hour, minute, second = map(int, scheduler_params["time"].split(":"))
            scheduled_time = scheduled_time.replace(
                hour=hour, minute=minute, second=second
            )

        rca_already_run = (
            scheduler_params is not None
            and "last_scheduled_time_rca" in scheduler_params
            and datetime.fromisoformat(scheduler_params["last_scheduled_time_rca"])
        )

        hour, minute, second = map(int, scheduler_params["rca_time"].split(":"))
        daily_rca_time = datetime.now().replace(hour=hour, minute=minute, second=second)

        to_run_rca = not (
            datetime.fromisoformat(
                scheduler_params["last_scheduled_time_rca"] > daily_rca_time
            )
        )

        return to_run_rca or (not rca_already_run)

    def _active_kpis(self):
        kpis: Iterable[Kpi] = Kpi.query.distinct("kpi_id").filter(
            (Kpi.active == True) & (Kpi.is_static == False)  # noqa: E712
        )
        return kpis

    def _add_task_to_group(
        self,
        kpi: Kpi,
        to_run: bool,
        current_time: datetime,
        scheduled_time: datetime,
        kind: Literal["anomaly", "deepdrills"],  # anomaly or deepdrills
    ):
        if current_time > scheduled_time and to_run:

            if kind == "anomaly":
                print(f"Scheduling anomaly for KPI: {kpi.id}")
                self.task_group.append(ready_anomaly_task(kpi.id))

            elif kind == "deepdrills":
                print(f"Scheduling RCA for KPI: {kpi.id}")
                self.task_group.append(ready_rca_task(kpi.id))

    def _run_task_group(self):

        if not self.task_group:
            print("Found no pending KPI tasks.")
            return []

        g = group(self.task_group)
        res = g.apply_async()

        return res

    # @celery.task
    def schedule(self):

        for kpi in self._active_kpis():
            # if anomaly isn't setup yet, we still run RCA at     tR + 24 hours
            # if anomaly is setup, we run both anomaly and RCA at tA + 24 hours

            # get scheduler_params, will be None if it's not set
            scheduler_params: Dict[str, str] = kpi.scheduler_params or {}
            schedule_frequency = scheduler_params.get("scheduler_frequency", "D")

            current_time = datetime.now()

            if schedule_frequency == "H":
                anomaly_scheduled_time = self._get_scheduled_time_hourly(kpi)
            else:
                anomaly_scheduled_time = self._get_scheduled_time_daily(kpi)

            to_run_anomaly = self._to_run_anomaly(kpi, anomaly_scheduled_time)

            deepdrills_scheduled_time = self._get_scheduled_time_daily(kpi, "rca_time")
            to_run_rca = self._to_run_rca(
                kpi, deepdrills_scheduled_time, to_run_anomaly
            )

            self._add_task_to_group(
                kpi, to_run_anomaly, current_time, anomaly_scheduled_time, "anomaly"
            )
            self._add_task_to_group(
                kpi, to_run_rca, current_time, deepdrills_scheduled_time, "deepdrills"
            )

        return self._run_task_group()


@celery.task
def scheduler_wrapper():
    scheduler = AnalyticsScheduler()
    scheduler.schedule()
