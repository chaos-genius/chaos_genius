from chaos_genius.databases.models.anomaly_data_model import AnomalyDataOutput
from datetime import datetime, timedelta

import pandas as pd

from chaos_genius.connectors.base_connector import get_df_from_db_uri

def bound_between(min_val, val, max_val):
    return min(max(val, min_val), max_val)


def get_anomaly_df(kpi_info, connection_info, last_date_in_db=None, end_date= None, days_range=90):
    indentifier = ''
    if connection_info["connection_type"] == "mysql":
        indentifier = '`'
    elif connection_info["connection_type"] == "postgresql":
        indentifier = '"'

    if end_date is None:
        end_date = datetime.today()
    
    num_days = days_range

    freq = kpi_info['anomaly_params']['ts_frequency']

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

    kpi_filters = kpi_info['filters']
    kpi_filters_query = " "
    if kpi_filters:
        kpi_filters_query = " "
        for key, values in kpi_filters.items():
            if values:
                # TODO: Bad Hack to remove the last comma, fix it
                values_str = str(tuple(values))
                values_str = values_str[:-2] + ')'
                key_str = f"{indentifier}{key}{indentifier}"
                kpi_filters_query += f" and {key_str} in {values_str}"


    kpi_type = kpi_info.get('kpi_type')
    if kpi_type == 'table':
        base_query = " ".join([
            f"select * from {kpi_info['table_name']}",
            base_filter,
            kpi_filters_query
        ])
    
    elif kpi_type == 'query':
        base_query = " ".join([
            f"select * from ({kpi_info['kpi_query']}) as temp_table",
            base_filter,
            kpi_filters_query
        ])
    else:
        raise ValueError(f"kpi_type:'{kpi_type}' is not from ['table', 'query']")

    return get_df_from_db_uri(connection_info["db_uri"], base_query)


def get_last_date_in_db(kpi_id, series, subgroup=None):
    results = AnomalyDataOutput.query.filter(
        (AnomalyDataOutput.kpi_id == kpi_id)
        & (AnomalyDataOutput.anomaly_type == series)
        & (AnomalyDataOutput.series_type == subgroup)
    ).order_by(AnomalyDataOutput.data_datetime.desc()).first()

    if results:
        return results.data_datetime
    else:
        return None


def get_dq_missing_data(input_data, dt_col, metric_col, freq):
    data = input_data

    data[dt_col] = pd.to_datetime(data[dt_col])
    missing_data = data.set_index(dt_col).isna()\
        .resample(freq).sum().reset_index()[[dt_col, metric_col]]

    missing_data = pd.DataFrame(
        missing_data,
        columns=[dt_col, metric_col]
    ).set_index(dt_col)

    return missing_data


def get_timedelta(freq, diff):
    """Returns a timedelta obj with the diff assigned 
    to the appopriate offset, i.e. days, hours etc.

    :param freq: string denoting frequency "daily/hourly"
    :type freq: string
    :param diff: a numerical offset to be assigned 
        the timedelta
    :type diff: float
    :return: timedelta object with the right offset
    :rtype: timdelta"""

    offset = {}
    if freq == "daily":
        offset['days'] = diff
    elif freq == "hourly": offset['hours'] = diff
    return timedelta(**offset)

def fill_data(input_data, dt_col, metric_col, last_date, period, end_date, freq):
    from chaos_genius.core.anomaly.constants import FREQUENCY_DELTA
    if last_date is not None:
        last_date_diff_period = last_date - get_timedelta(freq, period)\
            + get_timedelta(freq, 1)
        if last_date_diff_period not in input_data[dt_col]:
            input_data = pd.concat([
                pd.DataFrame({
                    dt_col: [last_date_diff_period],
                    metric_col: [0]
                }), 
                input_data
            ])

    if end_date is not None:
        end_date_diff_1 = end_date - timedelta(**FREQUENCY_DELTA[freq])
        if end_date_diff_1 not in input_data[dt_col]:
            input_data = pd.concat([
                pd.DataFrame({
                    dt_col: [end_date_diff_1], 
                    metric_col: [0]
                }),
                input_data
            ])

    return input_data