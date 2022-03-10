"""Provides utility functions for validating KPIs."""

import logging
from typing import Any, Dict, List, Tuple, Union

import pandas as pd
from pandas.api.types import is_datetime64_any_dtype as is_datetime

from chaos_genius.core.rca.root_cause_analysis import SUPPORTED_AGGREGATIONS
from chaos_genius.core.utils.data_loader import DataLoader
from chaos_genius.settings import MAX_ROWS_FOR_DEEPDRILLS

KPI_VALIDATION_TAIL_SIZE = 1000

logger = logging.getLogger(__name__)


def validate_kpi(kpi_info: Dict[str, Any], data_source: Dict[str, Any]) -> Tuple[bool, str]:
    """Load data for KPI and invoke all validation checks.

    :param kpi_info: Dictionary with all params for the KPI
    :type kpi_info: Dict[str, Any]
    :param data_source: Dictionary describing the data source
    :type data_source: Dict[str, Any]
    :return: Returns a tuple with the status as a bool and a status message
    :rtype: Tuple[bool, str]
    """
    try:
        df = DataLoader(
            kpi_info, tail=KPI_VALIDATION_TAIL_SIZE, validation=True
        ).get_data()
        logger.info(f"Created df with {len(df)} rows for validation")
    except Exception as e:  # noqa: B902
        logger.error("Unable to load data for KPI validation", exc_info=1)
        return False, "Could not load data. Error: " + str(e)

    supports_tz_aware = data_source["connection_type"] == "Druid"

    return _validate_kpi_from_df(
        df,
        kpi_info,
        kpi_column_name=kpi_info["metric"],
        agg_type=kpi_info["aggregation"],
        date_column_name=kpi_info["datetime_column"],
        supports_tz_aware=supports_tz_aware,
    )


def _validate_kpi_from_df(
    df: pd.core.frame.DataFrame,
    kpi_info: Dict[str, Any],
    kpi_column_name: str,
    agg_type: str,
    date_column_name: str,
    debug: bool = False,
    supports_tz_aware: bool = False,
) -> Tuple[bool, str]:
    """Invoke each validation check and break if there's a falsy check.

    :param df: A pandas DataFrame
    :type df: pd.core.frame.DataFrame
    :param kpi_info: Dictionary with all params for the KPI
    :type kpi_info: Dict[str, Any]
    :param kpi_column_name: Name of the column used for KPI
    :type kpi_column_name: str
    :param agg_type: A supported aggregation function
    :type agg_type: str
    :param date_column_name: Name of the date column
    :type date_column_name: str
    :param debug: Bool for using debug mode with extra print statements at each
    validation, defaults to False
    :type debug: bool, optional
    :return: returns a tuple with the status as a bool and a status message
    :rtype: Tuple[bool, str]
    """
    # TODO: Move all checks into a single list and execute them one by one
    # so that there is an order of dependency between them and we don't need to
    # do prelimiary checks first.

    # Preliminary Check that the KPI column exists
    # This check must be done independently
    # Otherwise, the other 3 checks will fail!
    status_bool, status_msg = _column_exists(
        df, column_name=[kpi_column_name, date_column_name]
    )
    logger.info("Check #0: KPI column and Datetime column exist in DataFrame")
    logger.info(", ".join(map(str, [status_bool, status_msg])))
    if not status_bool:
        return status_bool, status_msg

    # Preliminary Check that there are no duplicate column names
    status_bool, status_msg = _validate_no_duplicate_column_names(df)
    logger.info("Check #1: Validate no duplicate column names in data")
    logger.info(f"{status_bool}, {status_msg}")
    if not status_bool:
        return status_bool, status_msg

    # Validation check results
    validations = [
        {
            "debug_str": "Check #2: Validate column fits agg type",
            "status": lambda: _validate_agg_type_fits_column(
                df, column_name=kpi_column_name, agg_type=agg_type
            ),
        },
        {
            "debug_str": "Check #3: Validate kpi not datetime",
            "status": lambda: _validate_kpi_not_datetime(
                df,
                kpi_column_name=kpi_column_name,
                date_column_name=date_column_name,
            ),
        },
        {
            "debug_str": "Check #4: Validate date column is parseable",
            "status": lambda: _validate_date_column_is_parseable(
                df, date_column_name=date_column_name, supports_tz_aware=supports_tz_aware
            ),
        },
        {
            "debug_str": "Check #5: Validate date column is tz-naive if tz-aware not supported",
            "status": lambda: _validate_date_column_is_tz_naive(
                df, date_column_name=date_column_name
            ) if not supports_tz_aware else (True, "Accepted!"),
        },
        {
            "debug_str": "Check #6: Validate dimensions",
            "status": lambda: _validate_dimensions(kpi_info),
        },
        {
            "debug_str": (
                "Check #7: Validate KPI has no more than "
                f"{MAX_ROWS_FOR_DEEPDRILLS} rows"
            ),
            "status": lambda: _validate_for_maximum_kpi_size(kpi_info),
        },
    ]
    for validation in validations:
        status_bool, status_msg = validation["status"]()
        logger.info(validation["debug_str"])
        logger.info(", ".join(map(str, [status_bool, status_msg])))
        if not status_bool:
            return status_bool, status_msg

    # All Validation Checks have passed if code reaches here!
    return True, "Accepted!"


def _column_exists(
    df: pd.core.frame.DataFrame, column_name: Union[str, List[str]]
) -> Tuple[bool, str]:  # sourcery skip: move-assign
    """Validate if a column, or list of columns exist in the input DataFrame.

    :param df: A pandas DataFrame
    :type df: pd.core.frame.DataFrame
    :param column_name: Name of the column to check existence. Or a list of
    column names to check existence of.
    :type column_name: Union[str, List[str]]
    :return: returns a tuple with the status as a bool and a status message
    :rtype: Tuple[bool, str]
    """
    # Lambda function templates to create string output
    valid_str = "Accepted!"
    single_col_str = '"{}" was not found as a column in the table.'
    multi_col_str = "{} were not found as columns in the table."

    # column_name is a string. Single column to check
    if isinstance(column_name, str):
        status = column_name in df.columns
        message = valid_str if status else single_col_str.format(column_name)
        return status, message
    else:
        # Find which cols do not exist in DataFrame
        not_found_cols = [col for col in column_name if col not in df.columns]

        if len(not_found_cols) == 1:
            return False, single_col_str.format(not_found_cols[0])
        if len(not_found_cols) <= 1:
            return True, valid_str

        return False, multi_col_str.format(not_found_cols)


def _validate_agg_type_fits_column(
    df: pd.core.frame.DataFrame, column_name: str, agg_type: str
) -> Tuple[bool, str]:
    """Validate if agg type is supported and is valid for the column.

    :param df: A pandas DataFrame
    :type df: pd.core.frame.DataFrame
    :param column_name: Name of the column to validate
    :type column_name: str
    :param agg_type: A supported aggregation function
    :type agg_type: str
    :return: returns a tuple with the status as a bool and a status message
    :rtype: bool
    """
    # Check if aggregation type is supported
    if agg_type not in SUPPORTED_AGGREGATIONS:
        return (
            False,
            f'"{agg_type}" aggregation is not supported. '
            f'Supported aggregations are {", ".join(SUPPORTED_AGGREGATIONS)}.',
        )

    # Check if trying to use a numerical aggregation on a non-numerical column.
    if str(df[column_name].dtype) == "object" and agg_type != "count":
        return (
            False,
            f'"{column_name}" column is non-numerical. Quantitative data is '
            f"required to perform {agg_type} aggregation.",
        )

    return True, "Accepted!"


def _validate_kpi_not_datetime(
    df: pd.core.frame.DataFrame, kpi_column_name: str, date_column_name: str
) -> Tuple[bool, str]:
    """Validate if kpi column is not the same as the date column.

    :param df: A pandas DataFrame
    :type df: pd.core.frame.DataFrame
    :param kpi_column_name: Name of the column used for KPI
    :type kpi_column_name: str
    :param date_column_name: Name of the date column
    :type date_column_name: str
    :return: returns a tuple with the status as a bool and a status message
    :rtype: Tuple[bool, str]
    """
    status = kpi_column_name != date_column_name
    message = (
        "Accepted!" if status else "KPI column cannot be the date column."
    )
    return status, message


def _validate_date_column_is_parseable(
    df: pd.core.frame.DataFrame,
    date_column_name: str,
    supports_tz_aware: bool,
) -> Tuple[bool, str]:
    """Validate if specified date column is parseable.

    :param df: A pandas DataFrame
    :type df: pd.core.frame.DataFrame
    :param date_column_name: Name of the date column
    :type date_column_name: str
    :return: returns a tuple with the status as a bool and a status message
    :rtype: Tuple[bool, str]
    """
    # has to be datetime only then proceed else exit
    if supports_tz_aware:
        # try to parse date col
        # TODO: ensure this parses only tz-aware data and nothing else
        #       (str, int, float, etc.)
        date_col = pd.to_datetime(df[date_column_name], errors="ignore")
    else:
        # support only datetime type (not datetime with tz, strings, etc.)
        date_col = df[date_column_name]

    if not is_datetime(date_col):
        invalid_type_err_msg = (
            "The datetime column is of the type"
            f" {df[date_column_name].dtype}, use 'cast' to convert to datetime."
        )
        return False, invalid_type_err_msg

    return True, "Accepted!"


def _validate_date_column_is_tz_naive(
    df: pd.core.frame.DataFrame,
    date_column_name: str,
) -> Tuple[bool, str]:
    """Validate if specified date column is tz-naive.

    :param df: A pandas DataFrame
    :type df: pd.core.frame.DataFrame
    :param date_column_name: Name of the date column
    :type date_column_name: str
    :return: returns a tuple with the status as a bool and a status message
    :rtype: Tuple[bool, str]
    """
    date_col = df[date_column_name]
    all_tz_naive = date_col.apply(lambda t: t.tz is None).all()
    if not all_tz_naive:
        invalid_type_err_msg = (
            "The datetime column has timezone aware data,"
            " use 'cast' to convert to timezone naive."
        )
        return False, invalid_type_err_msg

    return True, "Accepted!"


def _validate_for_maximum_kpi_size(
    kpi_info: Dict[str, Any],
) -> Tuple[bool, str]:
    """Validate if KPI size is less than maximum permissible size
    :param kpi_info: Dictionary with all params for the KPI
    :type kpi_info: Dict[str, Any]
    :return: returns a tuple with the status as a bool and a status message
    :rtype: Tuple[bool, str]
    """
    try:
        num_rows = DataLoader(kpi_info, days_before=60).get_count()
    except Exception as e:  # noqa: B902
        logger.error(
            "Unable to load data for KPI validation of max size", exc_info=1
        )
        return False, "Could not load data. Error: " + str(e)

    if num_rows <= MAX_ROWS_FOR_DEEPDRILLS:
        return True, "Accepted!"

    error_message = (
        "Chaos Genius does not currently support datasets with "
        f"monthly rows greater than {num_rows}. Please try materialized views"
        "for such datasets (coming soon)."
    )
    return False, error_message


def _validate_dimensions(kpi_info: dict) -> Tuple[bool, str]:
    """Validate if dimensions are valid."""
    metric_col = kpi_info.get("metric")
    date_col = kpi_info.get("datetime_column")

    dimensions = kpi_info.get("dimensions")

    if metric_col in dimensions:
        return False, "Metric column cannot be in dimensions."

    if date_col in dimensions:
        return False, "Date column cannot be in dimensions."

    return True, "Accepted!"


def _validate_no_duplicate_column_names(df: pd.DataFrame) -> Tuple[bool, str]:
    """Validate if there are no duplicate column names.

    :param df: A pandas DataFrame
    :type df: pd.core.frame.DataFrame
    :return: returns a tuple with the status as a bool and a status message
    :rtype: Tuple[bool, str]
    """
    seen = set()
    dupes = [col for col in df.columns if col in seen or seen.add(col)]
    if dupes:
        return False, f"Duplicate column names found - {', '.join(dupes)}."

    return True, "Accepted!"
