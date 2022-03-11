import logging
import typing
from datetime import date, datetime, timedelta
from typing import Optional, Union, Iterator

from flask import current_app  # noqa: F401

from chaos_genius.controllers.task_monitor import checkpoint_failure, checkpoint_success
from chaos_genius.core.anomaly.controller import AnomalyDetectionController
from chaos_genius.core.rca.rca_controller import RootCauseAnalysisController
from chaos_genius.core.utils.data_loader import DataLoader
from chaos_genius.databases.models.kpi_model import Kpi

from chaos_genius.settings import (
    MAX_DEEPDRILLS_SLACK_DAYS,
    DAYS_OFFSET_FOR_ANALTYICS,
)


logger = logging.getLogger(__name__)


def _is_data_present_for_end_date(
    kpi_info: dict,
    end_date: date = None
) -> bool:
    df_count = DataLoader(kpi_info, end_date=end_date, days_before=0).get_count()
    return df_count != 0


def get_kpi_data_from_id(n: int) -> dict:
    """Returns the corresponding KPI data for the given KPI ID
    from KPI_DATA.

    :param n: ID of KPI
    :type n: int

    :raises: ValueError

    :returns: KPI data
    :rtype: dict
    """
    # TODO: Move to utils module

    kpi_info = Kpi.get_by_id(n)
    if kpi_info and kpi_info.as_dict:
        return kpi_info.as_dict
    raise ValueError(f"KPI ID {n} not found in KPI_DATA")


def run_anomaly_for_kpi(
    kpi_id: int,
    end_date: date = None,
    task_id: Optional[int] = None
) -> Union["typing.Literal[False]", date]:

    try:
        logger.info(f"Starting Anomaly Detection for KPI ID: {kpi_id}.")
        kpi_info = get_kpi_data_from_id(kpi_id)
        logger.info("Retrieved KPI information.")

        logger.info("Selecting end date.")

        if end_date is None and kpi_info["scheduler_params"]["scheduler_frequency"] == "D":
            # by default we always calculate for n-days_offset_for_analytics
            end_date = datetime.today().date() - timedelta(days=(DAYS_OFFSET_FOR_ANALTYICS))
            # Check if data is available or not then try for n-days_offset_for_analytics-1
            if not _is_data_present_for_end_date(kpi_info, end_date):
                end_date = end_date - timedelta(days=1)
                logger.info("Decreasing end date by 1.")

        elif end_date is None and kpi_info["scheduler_params"]["scheduler_frequency"] == "H":
            end_date = datetime.today().date()

        logger.info(f"End date is {end_date}.")

        adc = AnomalyDetectionController(kpi_info, end_date, task_id=task_id)
        adc.detect()
        logger.info(f"Anomaly Detection has completed for KPI ID: {kpi_id}.")
        
        if kpi_info["scheduler_params"]["scheduler_frequency"] == "H":
            end_date = adc.end_date
            logger.info(f"End date for hourly alerts is {end_date}.")

    except Exception:  # noqa: B902
        logger.error(
            f"Anomaly Detection encountered an error for KPI ID: {kpi_id}", exc_info=True
        )
        return False

    return end_date


def _get_end_date_for_rca_kpi(kpi_info: dict, end_date: date = None) -> date:
    # by default we always calculate for n-1
    if end_date is None:
        end_date = datetime.today().date() - timedelta(days=(DAYS_OFFSET_FOR_ANALTYICS))

    count = 0
    while not _is_data_present_for_end_date(kpi_info, end_date):
        logger.info(f"Checking for end date: {end_date}.")
        end_date = end_date - timedelta(days=1)
        count += 1
        if count > MAX_DEEPDRILLS_SLACK_DAYS:
            raise ValueError(f"KPI has no data for the last {MAX_DEEPDRILLS_SLACK_DAYS} days.")

    return end_date


def run_rca_for_kpi(kpi_id: int, end_date: date = None, task_id: Optional[int] = None) -> bool:
    try:
        logger.info(f"Starting RCA for KPI ID: {kpi_id}.")
        kpi_info = get_kpi_data_from_id(kpi_id)
        logger.info("Retrieved KPI information.")
        try:
            logger.info("Selecting end date.")
            end_date = _get_end_date_for_rca_kpi(kpi_info, end_date)
            logger.info(f"End date is {end_date}.")
            if task_id is not None:
                checkpoint_success(
                    task_id, kpi_id, "DeepDrills", "Data Loader and Validation"
                )
            logger.info(
                f"(Task: {task_id}, KPI: {kpi_id}) DeepDrills - Data Loader and Validation - Success",
            )
        except Exception as e:  # noqa: B902
            logger.error(f"Getting end date failed for KPI: {kpi_id}.", exc_info=e)
            if task_id is not None:
                checkpoint_failure(
                    task_id, kpi_id, "DeepDrills", "Data Loader and Validation", e
                )
            logger.error(
                f"(Task: {task_id}, KPI: {kpi_id}) DeepDrills - Data Loader and Validation - Exception occured.",
                exc_info=e
            )
            return False

        rca_controller = RootCauseAnalysisController(kpi_info, end_date, task_id=task_id)
        rca_controller.compute()
        logger.info(f"Completed RCA for KPI ID: {kpi_id}.")

    except Exception as e:  # noqa: B902
        logger.error(f"RCA encountered an error for KPI ID: {kpi_id}", exc_info=e)
        if task_id is not None:
            checkpoint_failure(task_id, kpi_id, "DeepDrills", "DeepDrills complete", e)
        return False

    if task_id is not None:
        checkpoint_success(task_id, kpi_id, "DeepDrills", "DeepDrills complete")

    return True


def get_anomaly_kpis() -> Iterator[Kpi]:
    """Returns a list of all KPIs for which anomaly needs to run."""
    kpis = Kpi.query.distinct("kpi_id").filter(
        (Kpi.run_anomaly == True) & (Kpi.active == True)
    )
    return kpis


def get_active_kpis() -> Iterator[Kpi]:
    """Returns a list of all active KPIs."""
    kpis = Kpi.query.distinct("kpi_id").filter(
        (Kpi.active == True) & (Kpi.is_static == False)
    )
    return kpis


# def delete_data(kpi, query):
#     db.session.execute(query)
#     db.session.commit()