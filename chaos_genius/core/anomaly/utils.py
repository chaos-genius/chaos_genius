"""Provides utility functions for anomaly detection."""

from datetime import datetime, timedelta
from typing import Any

import pandas as pd

from chaos_genius.databases.models.anomaly_data_model import AnomalyDataOutput


def bound_between(min_val, val, max_val):
    """Bound value between min and max."""
    return min(max(val, min_val), max_val)


def get_last_date_in_db(kpi_id: int, series: str, subgroup: str = None) -> Any or None:
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
    freq: str,
    preagg_count_col: str = None
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
    :param preagg_count_col: preagg count column name, defaults to None
    :type preagg_count_col: str, optional
    :return: dataframe with information on missing data
    :rtype: pd.DataFrame
    """
    data = input_data

    data[dt_col] = pd.to_datetime(data[dt_col])

    col_list = [dt_col, metric_col, preagg_count_col] if preagg_count_col else [dt_col, metric_col]
    missing_data = (
        data.set_index(dt_col)
        .isna()
        .resample(freq)
        .sum()
        .reset_index()[col_list]
    )

    missing_data = pd.DataFrame(
        missing_data, columns=col_list
    ).set_index(dt_col)

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


def date_time_checker(input_data, datetime_obj, dt_col, freq):
    if freq in {"D", "daily"}:
        temp_dt = input_data[dt_col].apply(
            lambda val: datetime(val.year, val.month, val.day)
        )
        dt_obj = datetime(datetime_obj.year, datetime_obj.month, datetime_obj.day)
        return dt_obj not in temp_dt.to_list()

    if freq in {"H", "hourly"}:
        temp_dt = input_data[dt_col].apply(
            lambda val: datetime(val.year, val.month, val.day, val.hour)
        )
        dt_obj = datetime(
            datetime_obj.year, datetime_obj.month, datetime_obj.day, datetime_obj.hour
        )
        return dt_obj not in temp_dt.to_list()


def fill_data(
    input_data: pd.DataFrame,
    dt_col: str,
    metric_col: str,
    last_date: datetime,
    period: int,
    end_date: datetime,
    freq: str,
    preagg_count_col: str = None
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
    :param preagg_count_col: preagg count column name, defaults to None
    :type preagg_count_col: str, optional
    :return: filled dataframe
    :rtype: pd.DataFrame
    """

    input_data = input_data.copy()
    input_data.loc[:, dt_col] = pd.to_datetime(input_data[dt_col])

    if last_date is not None:
        last_date_diff_period = (
            last_date - get_timedelta(freq, period) + get_timedelta(freq, 1)
        )

        if date_time_checker(input_data, last_date_diff_period, dt_col, freq):
            if preagg_count_col:
                t_df = pd.DataFrame({
                    dt_col: [last_date_diff_period],
                    metric_col: [0],
                    preagg_count_col: [0]
                })
            else:
                t_df = pd.DataFrame({
                    dt_col: [last_date_diff_period],
                    metric_col: [0]
                })
            input_data = pd.concat([t_df, input_data])

    if end_date is not None:
        end_datetime = datetime(end_date.year, end_date.month, end_date.day)

        if date_time_checker(input_data, end_datetime, dt_col, freq):
            if preagg_count_col:
                t_df = pd.DataFrame({
                    dt_col: [end_datetime],
                    metric_col: [0],
                    preagg_count_col: [0]
                })
            else:
                t_df = pd.DataFrame({
                    dt_col: [end_datetime],
                    metric_col: [0]
                })
            input_data = pd.concat([input_data, t_df])

    return input_data
