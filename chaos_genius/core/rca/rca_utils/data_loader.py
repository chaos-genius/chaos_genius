"""Provides utilties for loading data for Root Cause Analysis."""

from datetime import datetime, timedelta
import random
import string
from typing import Tuple

import pandas as pd
from chaos_genius.connectors import get_sqla_db_conn
# from chaos_genius.connectors.base_connector import get_df_from_db_uri
from chaos_genius.core.rca.constants import TIMELINE_NUM_DAYS_MAP

def randomword(length):
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(length))


def rca_load_data(
    kpi_info: dict,
    connection_info: dict,
    dt_col: str,
    end_date: datetime,
    timeline: str = "mom",
    tail: int = None
) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """Load data for performing RCA.

    :param kpi_info: kpi info to load data for, defaults to "mom"
    :type kpi_info: dict, optional
    :param connection_info: connection info of the kpi, defaults to "mom"
    :type connection_info: dict, optional
    :param dt_col: datetime column name, defaults to "mom"
    :type dt_col: str, optional
    :param end_date: end date to load data for, defaults to "mom"
    :type end_date: datetime, optional
    :param timeline: timeline to load data for, defaults to "mom"
    :type timeline: str, optional
    :param tail: limit data loaded to this number of rows, defaults to None
    :type tail: int, optional
    :return: tuple with baseline data and rca data for
    :rtype: Tuple[pd.DataFrame, pd.DataFrame]
    """
    end_dt_obj = datetime.today() if end_date is None \
        else end_date
    num_days = TIMELINE_NUM_DAYS_MAP[timeline]

    base_dt_obj = end_dt_obj - timedelta(days=2 * num_days)
    mid_dt_obj = end_dt_obj - timedelta(days=num_days)

    base_dt = str(base_dt_obj.date())
    mid_dt = str(mid_dt_obj.date())
    end_dt = str(end_dt_obj.date())

    base_df, rca_df = _get_kpi_data(
        kpi_info, connection_info, dt_col, base_dt, mid_dt, end_dt, tail)

    return base_df, rca_df


def _get_kpi_data(
    kpi_info: dict,
    connection_info: dict,
    dt_col: str,
    base_dt: str,
    mid_dt: str,
    end_dt: str,
    tail: int = None
) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """Load RCA data for KPI with table defined.

    :param kpi_info: kpi info to load data for, defaults to "mom"
    :type kpi_info: dict, optional
    :param connection_info: connection info of the kpi, defaults to "mom"
    :type connection_info: dict, optional
    :param dt_col: datetime column name, defaults to "mom"
    :type dt_col: str, optional
    :param base_dt: start date to load data for
    :type base_dt: str
    :param mid_dt: mid date to load data for
    :type mid_dt: str
    :param end_dt: end data to load data for
    :type end_dt: str
    :param tail: limit data loaded to this number of rows, defaults to None
    :type tail: int, optional
    :return: tuple with baseline data and rca data for
    :rtype: Tuple[pd.DataFrame, pd.DataFrame]
    """
    indentifier = ""
    if connection_info["connection_type"] == "mysql":
        indentifier = "`"
    elif connection_info["connection_type"] == "postgresql":
        indentifier = '"'

    dt_col_str = f"{indentifier}{dt_col}{indentifier}"

    start_query = f"{dt_col_str} > '{base_dt}'"
    mid_start_query = f"{dt_col_str} <= '{mid_dt}'"
    mid_end_query = f"{dt_col_str} > '{mid_dt}'"
    end_query = f"{dt_col_str} <= '{end_dt}'"

    base_filter = f" where {start_query} and {mid_start_query} "
    rca_filter = f" where {mid_end_query} and {end_query} "

    if kpi_info["kpi_type"] == "table":
        table_name = kpi_info['table_name']
    else:
        table_name = f"({kpi_info['kpi_query']}) as " + \
                     f"{indentifier}{randomword(10)}{indentifier}"

    base_query = f"select * from {table_name} {base_filter} "
    rca_query = f"select * from {table_name} {rca_filter} "

    kpi_filters = kpi_info["filters"]
    if kpi_filters:
        kpi_filters_query = " "
        for key, values in kpi_filters.items():
            if values:
                # TODO: Bad Hack to remove the last comma, fix it
                values_str = str(tuple(values))
                values_str = values_str[:-2] + ")"
                kpi_filters_query += (
                    f" and {indentifier}{key}{indentifier} in {values_str}"
                )
        kpi_filters_query += " "
        base_query += kpi_filters_query
        rca_query += kpi_filters_query

    if tail is not None:
        limit_query = f" limit {tail} "
        base_query += limit_query
        rca_query += limit_query

    db_connection = get_sqla_db_conn(data_source_info=connection_info)
    base_df = db_connection.run_query(base_query)
    rca_df = db_connection.run_query(rca_query)

    if base_df is None:
        raise ValueError("Base dataframe is None.")
    if rca_df is None:
        raise ValueError("RCA dataframe is None.")
    if len(base_df) == 0:
        raise ValueError("Base df has 0 rows.")
    if len(rca_df) == 0:
        raise ValueError("RCA dataframe has 0 rows.")

    base_df[dt_col] = pd.to_datetime(base_df[dt_col])
    rca_df[dt_col] = pd.to_datetime(rca_df[dt_col])

    return base_df, rca_df

