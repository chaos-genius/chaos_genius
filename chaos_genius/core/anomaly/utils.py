from chaos_genius.databases.models.anomaly_data_model import AnomalyDataOutput
from datetime import datetime, timedelta

import pandas as pd
from sqlalchemy import exc

from chaos_genius.connectors.base_connector import get_df_from_db_uri

def bound_between(min_val, val, max_val): 
    return min(max(val, min_val), max_val)

def get_anomaly_df(kpi_info, connection_info, days_range=180):
    indentifier = ''
    if connection_info["connection_type"] == "mysql":
        indentifier = '`'
    elif connection_info["connection_type"] == "postgresql":
        indentifier = '"'

    today = datetime.today()
    if kpi_info['is_static']:
        end_date = kpi_info.get('static_params', {}).get('end_date', {})
        if end_date:
            today = datetime.strptime(end_date, '%Y-%m-%d')
    num_days = days_range
    base_dt_obj = today - timedelta(days=num_days)
    base_dt = str(base_dt_obj.date())

    cur_dt = str(today.date())
    base_filter = f" where {indentifier}{kpi_info['datetime_column']}{indentifier} > '{base_dt}' and {indentifier}{kpi_info['datetime_column']}{indentifier} <= '{cur_dt}' "

    kpi_filters = kpi_info['filters']
    kpi_filters_query = " "
    if kpi_filters:
        kpi_filters_query = " "
        for key, values in kpi_filters.items():
            if values:
                # TODO: Bad Hack to remove the last comma, fix it
                values_str = str(tuple(values))
                values_str = values_str[:-2] + ')'
                kpi_filters_query += f" and {indentifier}{key}{indentifier} in {values_str}"

    base_query = f"select * from {kpi_info['table_name']} {base_filter} {kpi_filters_query} "
    base_df = get_df_from_db_uri(connection_info["db_uri"], base_query)

    return base_df

def get_last_date_in_db(kpi_id, series, subgroup= None):
    results = AnomalyDataOutput.query.filter(
        (AnomalyDataOutput.kpi_id == kpi_id) \
        & (AnomalyDataOutput.anomaly_type == series) \
        & (AnomalyDataOutput.series_type == subgroup) \
    ).order_by(AnomalyDataOutput.data_datetime.desc()).first()

    if results:
        return results.data_datetime
    else:
        return None