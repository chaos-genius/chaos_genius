import logging
import typing
from datetime import date, datetime, timedelta
from typing import Any, Dict, Iterator, List, Optional, Tuple, Union

from flask import current_app

from chaos_genius.controllers.dashboard_controller import create_dashboard_kpi_mapper  # noqa: F401
from chaos_genius.controllers.task_monitor import checkpoint_failure, checkpoint_success
from chaos_genius.core.anomaly.controller import AnomalyDetectionController
from chaos_genius.core.rca.rca_controller import RootCauseAnalysisController
from chaos_genius.core.utils.data_loader import DataLoader
from chaos_genius.core.utils.kpi_validation import validate_kpi
from chaos_genius.databases.models.kpi_model import Kpi
from chaos_genius.settings import DAYS_OFFSET_FOR_ANALTYICS, MAX_DEEPDRILLS_SLACK_DAYS

logger = logging.getLogger(__name__)


def add_kpi(
    data: Dict[str, Any],
    validate=True,
    run_analytics=True
) -> Tuple[Kpi, str, bool]:
    """Adds a new KPI.

    Also handles adding the KPI to the default dashboard, running analytics and
    validations.

    If "anomaly_params" is present in data, it also performs anomaly params validation
    and runs anomaly.

    Arguments:
        data: the KPI data. Field names are same as the KPI model.
        validate: whether to perform KPI validation. (Default: True).
        run_rca: whether to start RCA task after adding. (Default: True).

    Returns:
        A tuple of (newly added KPI, error message - empty if success, boolean
        indicating whether error was critical)
    """
    data["dimensions"] = data.get("dimensions", [])

    data["kpi_query"] = _kpi_query_strip_trailing_semicolon(
        (data.get("kpi_query", "") or "")
    )

    has_anomaly_setup = "anomaly_params" in data
    new_anomaly_params = {}

    new_kpi = Kpi(
        name=data.get("name"),
        is_certified=data.get("is_certified"),
        data_source=data.get("data_source"),
        kpi_type=data.get("dataset_type") or data.get("kpi_type"),
        kpi_query=data.get("kpi_query"),
        schema_name=data.get("schema_name"),
        table_name=data.get("table_name"),
        metric=data.get("metric"),
        aggregation=data.get("aggregation"),
        datetime_column=data.get("datetime_column"),
        filters=data.get("filters"),
        dimensions=data.get("dimensions"),
        run_anomaly=data.get("run_anomaly", True),
    )

    if has_anomaly_setup:
        from chaos_genius.views.anomaly_data_view import validate_partial_anomaly_params

        # validate anomaly params
        err, new_anomaly_params = validate_partial_anomaly_params(
            data["anomaly_params"]
        )
        if err != "":
            return (
                new_kpi,
                f"Error in validating anomaly params for KPI {data['name']}: {err}",
                True,
            )

    if validate:
        # Perform KPI Validation
        status, message = validate_kpi(new_kpi.as_dict)
        if status is not True:
            return new_kpi, message, True

    new_kpi.save(commit=True)

    # Add KPI to dashboard 0 and all required dashboards
    _add_kpi_to_dashboards(new_kpi.id, data.get("dashboard", []) + [0])

    if has_anomaly_setup:
        from chaos_genius.views.anomaly_data_view import update_anomaly_params

        # update anomaly params
        err, new_kpi = update_anomaly_params(
            new_kpi, new_anomaly_params, check_editable=False
        )

        if err != "":
            return (
                new_kpi,
                f"Error updating anomaly params for KPI {new_kpi.name}: {err}",
                True
            )

    if run_analytics:
        # we ensure analytics tasks are run as soon as analytics is configured
        from chaos_genius.jobs.anomaly_tasks import queue_kpi_analytics
        queue_kpi_analytics(new_kpi.id, has_anomaly_setup)

    return new_kpi, "", False


def _kpi_query_strip_trailing_semicolon(query: str) -> str:
    if not query:
        return ""

    query = query.strip()

    # remove trailing semicolon
    if query[-1] == ";":
        query = query[:-1]
    return query


def _add_kpi_to_dashboards(kpi_id: int, dashboards: List[int]):
    dashboards = list(set(dashboards))
    create_dashboard_kpi_mapper(dashboards, [kpi_id])


def _is_data_present_for_end_date(
    kpi_info: dict,
    end_date: date = None
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
        # by default we always calculate for n-1
        if end_date is None:
            end_date = datetime.today().date() - timedelta(days=(DAYS_OFFSET_FOR_ANALTYICS - 1))

        # Check if n-1 data is available or not then try for n-2
        if not _is_data_present_for_end_date(kpi_info, end_date):
            end_date = end_date - timedelta(days=1)
            logger.info("Decreasing end date by 1.")

        logger.info(f"End date is {end_date}.")

        adc = AnomalyDetectionController(kpi_info, end_date, task_id=task_id)
        adc.detect()
        logger.info(f"Anomaly Detection has completed for KPI ID: {kpi_id}.")

    except Exception:  # noqa: B902
        logger.error(
            f"Anomaly Detection encountered an error for KPI ID: {kpi_id}", exc_info=True
        )
        return False

    return end_date


def _get_end_date_for_rca_kpi(kpi_info: dict, end_date: date = None) -> date:
    # by default we always calculate for n-1
    if end_date is None:
        end_date = datetime.today().date() - timedelta(days=(DAYS_OFFSET_FOR_ANALTYICS - 1))

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
