"""Module for schedulers and related utils."""

import logging
from datetime import datetime
from typing import Iterable, List, Optional

from celery import group
from celery.canvas import Signature
from celery.result import AsyncResult

from chaos_genius.databases.models.kpi_model import Kpi
from chaos_genius.jobs.anomaly_tasks import ready_anomaly_task, ready_rca_task

logger = logging.getLogger(__name__)


class AnalyticsScheduler:
    """Custom scheduler for running anomaly and deepdrills periodically.

    A new instance of this class must be created for every scheduling invocation.
    """

    def __init__(self):
        self._reset()

    def schedule(self):
        """Check KPIs for analytics tasks and schedule them if needed."""
        kpis = self._find_kpis()

        for kpi in kpis:
            scheduled_time = self._scheduled_time(kpi)
            to_run_anomaly = self._to_run_anomaly(kpi, scheduled_time)
            to_run_rca = self._to_run_rca(kpi, scheduled_time, to_run_anomaly)
            self._add_tasks_to_group(kpi, scheduled_time, to_run_anomaly, to_run_rca)

        return self._exec_task_group_async()

    def _reset(self):
        self._task_group: List[Signature] = []

    def _find_kpis(self) -> Iterable[Kpi]:
        return Kpi.query.distinct("kpi_id").filter(
            (Kpi.active == True) & (Kpi.is_static == False)  # noqa: E712
        )

    def _scheduled_time(self, kpi: Kpi) -> datetime:
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

            logger.debug(
                "Found analytics time: %s, for KPI: %s", scheduled_time, kpi.id
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
                logger.debug("Found RCA time: %s, for KPI: %s", scheduled_time, kpi.id)
            else:
                # this is kpi creation time
                canon_time = kpi.created_at
                scheduled_time = scheduled_time.replace(
                    hour=canon_time.hour,
                    minute=canon_time.minute,
                    second=canon_time.second,
                )
                logger.debug(
                    "Using KPI creation time: %s, for KPI: %s", scheduled_time, kpi.id
                )

        return scheduled_time

    def _to_run_anomaly(self, kpi: Kpi, scheduled_time: datetime) -> bool:
        scheduler_params = kpi.scheduler_params

        # check if we have to run anomaly:
        # 1. not already scheduled today
        # 2. anomaly is set up
        #
        # anomaly is setup if model_name is set in anomaly_params
        anomaly_is_setup = (
            kpi.anomaly_params is not None and "model_name" in kpi.anomaly_params
        )
        last_scheduled_time = None
        if (
            scheduler_params is not None
            and "last_scheduled_time_anomaly" in scheduler_params
        ):
            last_scheduled_time = datetime.fromisoformat(
                scheduler_params["last_scheduled_time_anomaly"]
            )
        anomaly_already_run = (
            last_scheduled_time is not None and last_scheduled_time > scheduled_time
        )
        to_run_anomaly = (not anomaly_already_run) and anomaly_is_setup

        logger.debug(
            "For KPI %s, to_run_anomaly: %s, anomaly_is_setup: %s, "
            "anomaly_already_run: %s, last_scheduled_time: %s",
            kpi.id,
            to_run_anomaly,
            anomaly_is_setup,
            anomaly_already_run,
            last_scheduled_time,
        )

        return to_run_anomaly

    def _to_run_rca(
        self, kpi: Kpi, scheduled_time: datetime, to_run_anomaly: bool
    ) -> bool:
        scheduler_params = kpi.scheduler_params

        # check if we have to run RCA
        # 1. if not already scheduled today
        # 2. if anomaly is scheduled, run RCA too
        last_scheduled_time = None
        if (
            scheduler_params is not None
            and "last_scheduled_time_rca" in scheduler_params
        ):
            last_scheduled_time = datetime.fromisoformat(
                scheduler_params["last_scheduled_time_rca"]
            )

        rca_already_run = (
            last_scheduled_time is not None and last_scheduled_time > scheduled_time
        )
        to_run_rca = to_run_anomaly or (not rca_already_run)

        logger.debug(
            "For KPI %s, to_run_anomaly: %s, to_run_rca: %s, rca_already_run: %s, "
            "last_scheduled_time: %s",
            kpi.id,
            to_run_anomaly,
            to_run_rca,
            last_scheduled_time,
        )

        return to_run_rca

    def _add_tasks_to_group(
        self,
        kpi: Kpi,
        scheduled_time: datetime,
        to_run_anomaly: bool,
        to_run_rca: bool,
    ) -> bool:
        """Schedule anomaly/RCA based on inputs.

        Return True if at least anomaly or RCA was scheduled, False otherwise.
        """
        current_time = datetime.now()

        initial_len = len(self._task_group)

        if current_time > scheduled_time and (to_run_rca or to_run_anomaly):

            if to_run_anomaly:
                logger.info(f"Scheduling anomaly for KPI: {kpi.id}")
                anomaly_task = ready_anomaly_task(kpi.id)
                if anomaly_task is None:
                    logger.warn(f"Could not schedule anomaly for KPI: {kpi.id}.")
                else:
                    self._task_group.append(anomaly_task)

            if to_run_rca:
                logger.info(f"Scheduling RCA for KPI: {kpi.id}")
                rca_task = ready_rca_task(kpi.id)
                if rca_task is None:
                    logger.warn(f"Could not schedule RCA for KPI: {kpi.id}.")
                else:
                    self._task_group.append(rca_task)

        return len(self._task_group) != initial_len

    def _exec_task_group_async(self) -> Optional[AsyncResult]:
        if not self._task_group:
            logger.info("Found no pending KPI tasks.")
            return

        g = group(self._task_group)
        res: AsyncResult = g.apply_async()
        return res
