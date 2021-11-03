import logging
import traceback
from datetime import datetime, timedelta

from flask import current_app  # noqa: F401

from chaos_genius.core.anomaly.controller import AnomalyDetectionController
from chaos_genius.core.rca.rca_controller import RootCauseAnalysisController
from chaos_genius.core.rca.rca_utils.data_loader import rca_load_data
from chaos_genius.databases.models.data_source_model import DataSource
from chaos_genius.views.kpi_view import get_kpi_data_from_id

RCA_SLACK_DAYS = 5
logger = logging.getLogger(__name__)


def _is_data_present_for_end_date(kpi_info: dict, end_date: datetime = None) -> bool:
    connection_info = DataSource.get_by_id(kpi_info["data_source"]).as_dict
    _, rca_df = rca_load_data(
        kpi_info, connection_info, kpi_info["datetime_column"], end_date, "dod", 100
    )
    return len(rca_df) != 0


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
