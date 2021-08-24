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
    # FIXME: Find a better way of doing this
    table_name = "anomaly_test_schema"
    dbUri = "postgresql+psycopg2://postgres:chaosgenius@localhost/anomaly_testing_db"

    sql_query = f"select * from {table_name} where kpi_id = {kpi_id} and anomaly_type='{series}'"
    if subgroup is not None:
        sql_query += f" and series_type='{subgroup}'"

    sql_query += "order by data_datetime desc limit 1;"

    print(sql_query)

    try:
        results = get_df_from_db_uri(dbUri, sql_query)
    except:
        results = []

    if len(results) == 0:
        return None
    else:
        return results["data_datetime"].values[0]