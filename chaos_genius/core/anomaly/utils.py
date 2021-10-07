"""Provides utility functions for anomaly detection."""

from datetime import datetime, timedelta
from typing import Any

import pandas as pd

from chaos_genius.connectors.base_connector import get_df_from_db_uri
from chaos_genius.core.anomaly.constants import FREQUENCY_DELTA
from chaos_genius.databases.models.anomaly_data_model import AnomalyDataOutput


def bound_between(min_val, val, max_val):
    """Bound value between min and max."""
    return min(max(val, min_val), max_val)


def get_anomaly_df(
    kpi_info: dict,
    connection_info: dict,
    last_date_in_db: datetime = None,
    end_date: datetime = None,
    days_range: int = 90
) -> pd.DataFrame:
    """Retrieve dataframe for anomaly detection.

    :param kpi_info: KPI information
    :type kpi_info: dict
    :param connection_info: connection information for KPI
    :type connection_info: dict
    :param last_date_in_db: last date for which anomaly was computed, defaults
    to None
    :type last_date_in_db: datetime, optional
    :param end_date: end date for which to run anomaly, defaults to None
    :type end_date: datetime, optional
    :param days_range: days for which to fetch data for, defaults to 90
    :type days_range: int, optional
    :raises ValueError: Raise error is KPI type is not supported.
    :return: dataframe for anomaly detection
    :rtype: pd.DataFrame
    """
    indentifier = ""
    if connection_info["connection_type"] == "mysql":
        indentifier = "`"
    elif connection_info["connection_type"] == "postgresql":
        indentifier = '"'

    if end_date is None:
        end_date = datetime.today()

    num_days = days_range

    freq = kpi_info["anomaly_params"]["ts_frequency"]

    if last_date_in_db is None:
        base_dt_obj = end_date - get_timedelta(freq, num_days)
    else:
        base_dt_obj = last_date_in_db - get_timedelta(freq, num_days)

    base_dt = base_dt_obj.strftime("%Y-%m-%d %H:%M:%S")

    cur_dt = end_date.strftime("%Y-%m-%d %H:%M:%S")

    dt_col_string = f"{indentifier}{kpi_info['datetime_column']}{indentifier}"
    gt_string = f"{dt_col_string} > '{base_dt}'"
    lt_string = f"{dt_col_string} <= '{cur_dt}'"
    base_filter = f"where {gt_string} and {lt_string}"

    kpi_filters = kpi_info["filters"]
    kpi_filters_query = " "
    if kpi_filters:
        kpi_filters_query = " "
        for key, values in kpi_filters.items():
            if values:
                # TODO: Bad Hack to remove the last comma, fix it
                values_str = str(tuple(values))
                values_str = values_str[:-2] + ")"
                key_str = f"{indentifier}{key}{indentifier}"
                kpi_filters_query += f" and {key_str} in {values_str}"

    kpi_type = kpi_info.get("kpi_type")
    if kpi_type == "table":
        base_query = " ".join([
            f"select * from {kpi_info['table_name']}",
            base_filter,
            kpi_filters_query
        ])

    elif kpi_type == "query":
        base_query = " ".join(
            [
                f"select * from ({kpi_info['kpi_query']}) as temp_table",
                base_filter,
                kpi_filters_query,
            ]
        )
    else:
        raise ValueError(
            f"kpi_type:'{kpi_type}' is not from ['table', 'query']")

    return get_df_from_db_uri(connection_info["db_uri"], base_query)


def get_last_date_in_db(
    kpi_id: int,
    series: str,
    subgroup: str = None
) -> Any or None:
    """Get last date for which anomaly was computed.

    :param kpi_id: kpi id to check for
    :type kpi_id: int
    :param series: series type
    :type series: str
    :param subgroup: subgroup id, defaults to None
    :type subgroup: str, optional
    :return: last date for which anomaly was computed
    :rtype: Any | None
    """
    results = (
        AnomalyDataOutput.query.filter(
            (AnomalyDataOutput.kpi_id == kpi_id)
            & (AnomalyDataOutput.anomaly_type == series)
            & (AnomalyDataOutput.series_type == subgroup)
        )
        .order_by(AnomalyDataOutput.data_datetime.desc())
        .first()
    )

    if results:
        return results.data_datetime
    else:
        return None


def get_dq_missing_data(
    input_data: pd.DataFrame,
    dt_col: str,
    metric_col: str,
    freq: str
) -> pd.DataFrame:
    """Generate dataframe with information on missing data.

    :param input_data: input dataframe
    :type input_data: pd.DataFrame
    :param dt_col: datetime column name
    :type dt_col: str
    :param metric_col: metric column name
    :type metric_col: str
    :param freq: frequency of data
    :type freq: str
    :return: dataframe with information on missing data
    :rtype: pd.DataFrame
    """
    data = input_data

    data[dt_col] = pd.to_datetime(data[dt_col])
    missing_data = (
        data.set_index(dt_col)
        .isna()
        .resample(freq)
        .sum()
        .reset_index()[[dt_col, metric_col]]
    )

    missing_data = pd.DataFrame(
        missing_data, columns=[dt_col, metric_col]).set_index(dt_col)

    return missing_data


def get_timedelta(freq, diff):
    """Return a timedelta obj with the diff assigned to the appopriate offset.

    :param freq: string denoting frequency "daily/hourly"
    :type freq: string
    :param diff: a numerical offset to be assigned
        the timedelta
    :type diff: float
    :return: timedelta object with the right offset
    :rtype: timdelta
    """
    offset = {}
    if freq == "D":
        offset["days"] = diff
    elif freq == "H":
        offset["hours"] = diff
    return timedelta(**offset)


def fill_data(
    input_data: pd.DataFrame,
    dt_col: str,
    metric_col: str,
    last_date: datetime,
    period: int,
    end_date: datetime,
    freq: str
) -> pd.DataFrame:
    """Fill data from input_data.

    :param input_data: input data to fill
    :type input_data: pd.DataFrame
    :param dt_col: datetime column name
    :type dt_col: str
    :param metric_col: metric column name
    :type metric_col: str
    :param last_date: last date for which anomaly was computed
    :type last_date: datetime
    :param period: period of data points to use for training
    :type period: int
    :param end_date: end date for anomaly computation
    :type end_date: datetime
    :param freq: frequency of data
    :type freq: str
    :return: filled dataframe
    :rtype: pd.DataFrame
    """
    if last_date is not None:
        last_date_diff_period = (
            last_date - get_timedelta(freq, period) + get_timedelta(freq, 1)
        )
        if last_date_diff_period not in input_data[dt_col]:
            input_data = pd.concat(
                [
                    pd.DataFrame({
                        dt_col: [last_date_diff_period],
                        metric_col: [0]
                    }),
                    input_data,
                ]
            )

    if end_date is not None:
        end_date_diff_1 = end_date - timedelta(**FREQUENCY_DELTA[freq])
        if end_date_diff_1 not in input_data[dt_col]:
            input_data = pd.concat(
                [
                    pd.DataFrame({dt_col: [end_date_diff_1], metric_col: [0]}),
                    input_data
                ]
            )

    return input_data
