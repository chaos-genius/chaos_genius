import logging
from datetime import datetime, timedelta

from flask import current_app  # noqa: F401

from chaos_genius.core.anomaly.controller import AnomalyDetectionController
from chaos_genius.core.rca.rca_controller import RootCauseAnalysisController
from chaos_genius.core.utils.data_loader import DataLoader
from chaos_genius.databases.models.kpi_model import Kpi

RCA_SLACK_DAYS = 5
logger = logging.getLogger(__name__)


def _is_data_present_for_end_date(
    kpi_info: dict,
    end_date: datetime = None
) -> bool:
    df_count = DataLoader(kpi_info, end_date=end_date, days_before=1).get_count()
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

def run_anomaly_for_kpi(kpi_id: int, end_date: datetime = None) -> bool:

    try:
        logger.info(f"Starting Anomaly Detection for KPI ID: {kpi_id}.")
        kpi_info = get_kpi_data_from_id(kpi_id)
        logger.info("Retrieved KPI information.")

        logger.info("Selecting end date.")
        # by default we always calculate for n-1
        if end_date is None:
            end_date = datetime.today() - timedelta(days=1)

        # Check if n-1 data is available or not then try for n-2
        if not _is_data_present_for_end_date(kpi_info, end_date):
            end_date = end_date - timedelta(days=1)
            logger.info("Decreasing end date by 1.")

        logger.info(f"End date is {end_date}.")

        adc = AnomalyDetectionController(kpi_info, end_date)
        adc.detect()
        logger.info(f"Anomaly Detection has completed for KPI ID: {kpi_id}.")

    except Exception:  # noqa: B902
        logger.error(
            f"Anomaly Detection encountered an error for KPI ID: {kpi_id}", exc_info=1
        )
        return False

    return True


def _get_end_date_for_rca_kpi(kpi_info: dict, end_date: datetime = None) -> datetime:
    # by default we always calculate for n-1
    if end_date is None:
        end_date = datetime.today() - timedelta(days=1)

    count = 0
    while not _is_data_present_for_end_date(kpi_info, end_date):
        logger.info(f"Checking for end date: {end_date}.")
        end_date = end_date - timedelta(days=1)
        count += 1
        if count > RCA_SLACK_DAYS:
            raise ValueError(f"KPI has no data for the last {RCA_SLACK_DAYS} days.")

    return end_date


def run_rca_for_kpi(kpi_id: int, end_date: datetime = None) -> bool:
    try:
        logger.info(f"Starting RCA for KPI ID: {kpi_id}.")
        kpi_info = get_kpi_data_from_id(kpi_id)
        logger.info("Retrieved KPI information.")

        logger.info("Selecting end date.")
        end_date = _get_end_date_for_rca_kpi(kpi_info, end_date)
        logger.info(f"End date is {end_date}.")

        rca_controller = RootCauseAnalysisController(kpi_info, end_date)
        rca_controller.compute()
        logger.info(f"Completed RCA for KPI ID: {kpi_id}.")

    except Exception:  # noqa: B902
        logger.error(f"RCA encountered an error for KPI ID: {kpi_id}", exc_info=1)
        return False

    return True
