from chaos_genius.databases.models.anomaly_data_model import AnomalyDataOutput
from datetime import datetime, timedelta

import pandas as pd

from chaos_genius.connectors.base_connector import get_df_from_db_uri


def bound_between(min_val, val, max_val):
    return min(max(val, min_val), max_val)


def get_anomaly_df(kpi_info, connection_info, last_date=None, days_range=90):
    indentifier = ''
    if connection_info["connection_type"] == "mysql":
        indentifier = '`'
    elif connection_info["connection_type"] == "postgresql":
        indentifier = '"'

    if last_date is None:
        end_date = datetime.today()
        if kpi_info['is_static']:
            end_date = kpi_info.get('static_params', {}).get('end_date', {})
            if end_date:
                end_date = datetime.strptime(end_date, '%Y-%m-%d')
    else:
        end_date = last_date

    num_days = days_range
    base_dt_obj = end_date - timedelta(days=num_days)
    base_dt = str(base_dt_obj.date())

    cur_dt = str(end_date.date())

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

    base_query = " ".join([
        f"select * from {kpi_info['table_name']}",
        base_filter,
        kpi_filters_query
    ])
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
        .resample(freq).sum()

    missing_data = pd.DataFrame(
        missing_data,
        columns=[dt_col, metric_col]
    ).set_index(dt_col)

    return missing_data
