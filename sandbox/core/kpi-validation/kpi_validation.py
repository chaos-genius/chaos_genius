import pandas as pd
from pandas.api.types import is_datetime64_any_dtype as is_datetime
from typing import List, Tuple, Union


def validate_kpi(
    df: pd.core.frame.DataFrame,
    kpi_column_name: str,
    agg_type: str,
    date_column_name: str,
    date_format: str = None,
    unix_unit: str = None,
    debug: bool = False,
) -> Tuple[bool, str]:
    """A wrapper function which cleanly invokes each validation check and breaks if it hits a falsy check.

    :param df: A pandas DataFrame
    :type df: pd.core.frame.DataFrame
    :param kpi_column_name: Name of the column used for KPI
    :type kpi_column_name: str
    :param agg_type: A supported aggregation function
    :type agg_type: str
    :param date_column_name: Name of the date column
    :type date_column_name: str
    :param date_format: Specified strftime to parse (https://docs.python.org/3/library/datetime.html#strftime-and-strptime-behavior), defaults to None
    :type date_format: str, optional
    :param unix_unit: The time unit if specified date column is in Unix format, defaults to None
    :type unix_unit: str, optional
    :param debug: Bool for using debug mode with extra print statements at each validation, defaults to False
    :type debug: bool, optional
    :return: returns a tuple with the status as a bool and a status message
    :rtype: Tuple[bool, str]
    """

    # Preliminary Check that the KPI column exists
    # This check must be done independently. Otherwise, the other 3 checks will fail!
    status_bool, status_msg = column_exists(
        df, column_name=[kpi_column_name, date_column_name]
    )
    if debug:
        print("Check #0: KPI column and Datetime column exist in DataFrame")
        print(status_bool, status_msg, sep=", ")
    if not status_bool:
        return status_bool, status_msg

    # Validation check results
    validations = [
        {
            "debug_str": "Check #1: Validate column fits agg type",
            "status": validate_agg_type_fits_column(
                df, column_name=kpi_column_name, agg_type=agg_type
            ),
        },
        {
            "debug_str": "Check #2: Validate kpi not datetime",
            "status": validate_kpi_not_datetime(
                df, kpi_column_name=kpi_column_name, date_column_name=date_column_name
            ),
        },
        {
            "debug_str": "Check #3: Validate date column is parseable",
            "status": validate_date_column_is_parseable(
                df,
                date_column_name=date_column_name,
                date_format=date_format,
                unix_unit=unix_unit,
            ),
        },
    ]
    for validation in validations:
        status_bool, status_msg = validation["status"]
        if debug:
            print(validation["debug_str"])
            print(status_bool, status_msg, sep=", ")
        if not status_bool:
            return status_bool, status_msg

    # All Validation Checks have passed if code reaches here!
    return True, "Accepted!"


def column_exists(
    df: pd.core.frame.DataFrame, column_name: Union[str, List[str]]
) -> Tuple[bool, str]:
    """Validates if a column, or list of columns exists in the input DataFrame

    :param df: A pandas DataFrame
    :type df: pd.core.frame.DataFrame
    :param column_name: Name of the column to check existence. Or a list of column names to check existence of.
    :type column_name: Union[str, List[str]]
    :return: returns a tuple with the status as a bool and a status message
    :rtype: Tuple[bool, str]
    """
    # Lambda function templates to create string output
    valid_str = "Accepted!"
    single_col_str = lambda col: f'"{col}" was not found as a column in the table!'
    multi_col_str = (
        lambda cols: f"""{", ".join([f'"{col}"' for col in cols])} were not found as columns in the table!"""
    )

    # column_name is a string. Single column to check
    if isinstance(column_name, str):
        status = column_name in df.columns
        message = valid_str if status else single_col_str(column_name)
        return status, message
    # column_name is a list. N cols to check
    else:
        # Find which cols do not exist in DataFrame
        not_found_cols = [col for col in column_name if col not in df.columns]

        if len(not_found_cols) == 1:
            return False, single_col_str(not_found_cols[0])
        if len(not_found_cols) > 1:
            return False, multi_col_str(not_found_cols)
        else:
            return True, valid_str


def validate_agg_type_fits_column(
    df: pd.core.frame.DataFrame, column_name: str, agg_type: str
) -> Tuple[bool, str]:
    """Validates if agggregation type is supported and is valid for the specified column.

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
    SUPPORTED_AGGREGATIONS = ["mean", "sum", "count"]
    if agg_type not in SUPPORTED_AGGREGATIONS:
        return (
            False,
            f'"{agg_type}" aggregation is not supported.\nSupported aggregations are {", ".join(SUPPORTED_AGGREGATIONS)}',
        )

    # Check if trying to use a numerical aggregation on a categorical column.
    if str(df[column_name].dtype) == "object" and agg_type != "count":
        return (
            False,
            f'"{column_name}" column is categorical. Quantitative data is required to perform {agg_type} aggregation.',
        )

    return True, "Accepted!"


def validate_kpi_not_datetime(
    df: pd.core.frame.DataFrame, kpi_column_name: str, date_column_name: str
) -> Tuple[bool, str]:
    """Validates if kpi column is not the same as the date column.

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
        "Accepted!" if status else "KPI column cannot be the same as the date column"
    )
    return status, message


def validate_date_column_is_parseable(
    df: pd.core.frame.DataFrame,
    date_column_name: str,
    date_format: str = None,
    unix_unit: str = None,
) -> Tuple[bool, str]:
    """Validates if specified date column is parseable.

    :param df: A pandas DataFrame
    :type df: pd.core.frame.DataFrame
    :param date_column_name: Name of the date column
    :type date_column_name: str
    :param date_format: Specified strftime to parse (https://docs.python.org/3/library/datetime.html#strftime-and-strptime-behavior), defaults to None
    :type date_format: str, optional
    :param unix_unit: The time unit if specified date column is in Unix format, defaults to None
    :type unix_unit: str, optional
    :return: returns a tuple with the status as a bool and a status message
    :rtype: Tuple[bool, str]
    """
    valid_str = "Accepted!"
    # Exit early if date column is a datetime object.
    if is_datetime(df[date_column_name]):
        return True, valid_str

    generic_err_msg = f'Unable to parse "{date_column_name}" column. Check that your date column is formatted properly and consistely.'
    out_of_bounds_msg = f'Timestamps in "{date_column_name}" were out of bounds. Check that your date column is formatted properly and consistely.'

    if unix_unit:
        # If a unix_unit is specified, it will try to convert with this unit
        try:
            pd.to_datetime(
                df[date_column_name], unit=unix_unit, infer_datetime_format=True
            )
        except pd.errors.OutOfBoundsDatetime as ex:
            return False, out_of_bounds_msg
        except Exception as ex:
            return False, f"{generic_err_msg}"
    elif date_format:
        # If a date_format is specified, it will try to convert with this format
        try:
            pd.to_datetime(
                df[date_column_name], format=date_format, infer_datetime_format=True
            )
        except pd.errors.OutOfBoundsDatetime as ex:
            return False, out_of_bounds_msg
        except Exception as ex:
            return False, f"{generic_err_msg}"
    else:
        # If neither date_format or unix_unit, let pandas do its best to infer datetime format.
        try:
            pd.to_datetime(df[date_column_name], infer_datetime_format=True)
        except pd.errors.OutOfBoundsDatetime as ex:
            return False, out_of_bounds_msg
        except Exception as ex:
            return False, f"{generic_err_msg}"

    # datetime column is parseable if code reaches here.
    return True, valid_str
