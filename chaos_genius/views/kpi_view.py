# -*- coding: utf-8 -*-
"""KPI views for creating and viewing the kpis."""
import traceback
from datetime import datetime, timedelta
from copy import deepcopy

from flask import (
    Blueprint,
    current_app,
    flash,
    redirect,
    render_template,
    request,
    url_for,
    jsonify
)
import numpy as np
import pandas as pd

# from chaos_genius.utils import flash_errors
from chaos_genius.databases.models.kpi_model import Kpi
from chaos_genius.databases.models.data_source_model import DataSource
from chaos_genius.core.rca import RootCauseAnalysis
from chaos_genius.connectors.base_connector import get_df_from_db_uri
from chaos_genius.core.anomaly.constants import date_output, no_date_output


blueprint = Blueprint("api_kpi", __name__, static_folder="../static")


@blueprint.route("/", methods=["GET", "POST"])
def kpi():
    """kpi list view."""
    current_app.logger.info("kpi list")
    # Handle logging in
    if request.method == 'POST':
        if request.is_json:
            # TODO: Add the backend validation
            data = request.get_json()
            new_kpi = Kpi(
                name=data.get('name'),
                is_certified=data.get('is_certified'),
                data_source=data.get('data_source'),
                kpi_type=data.get('dataset_type'),
                kpi_query=data.get('kpi_query'),
                table_name=data.get('table_name'),
                metric=data.get('metric'),
                aggregation=data.get('aggregation'),
                datetime_column=data.get('datetime_column'),
                filters=data.get('filters'),
                dimensions=data.get('dimensions')
            )
            new_kpi.save(commit=True)
            return jsonify({"message": f"DataSource {new_kpi.name} has been created successfully."})
        else:
            return jsonify({"error": "The request payload is not in JSON format"})

    elif request.method == 'GET':
        # kpis = Kpi.query.all()
        # results = [kpi.safe_dict for kpi in kpis]
        results = KPI_DATA
        return jsonify({"count": len(results), "data": results})

@blueprint.route("/<int:kpi_id>/get-dimensions", methods=["GET"])
def kpi_get_dimensions(kpi_id):
    dimensions = []
    try:
        kpi_info = get_kpi_data_from_id(kpi_id)
        dimensions = kpi_info["dimensions"]
    except Exception as err:
        current_app.logger.info(f"Error Found: {err}")
    return jsonify({"dimensions": dimensions, "msg": ""})

@blueprint.route("/<int:kpi_id>/kpi-aggregations", methods=["GET"])
def kpi_get_aggregation(kpi_id):
    data = []
    try:
        kpi_info = get_kpi_data_from_id(kpi_id)
        connection_info = DataSource.get_by_id(kpi_info["data_source"])
        timeline = request.args.get("timeline")
        data = kpi_aggregation(kpi_info, connection_info.as_dict, timeline)
    except Exception as err:
        current_app.logger.info(f"Error Found: {err}")
    return jsonify({"data": data, "msg": ""})

@blueprint.route("/<int:kpi_id>/kpi-line-data", methods=["GET"])
def kpi_get_line_data(kpi_id):
    data = []
    try:
        kpi_info = get_kpi_data_from_id(kpi_id)
        connection_info = DataSource.get_by_id(kpi_info["data_source"])
        timeline = request.args.get("timeline")
        data = kpi_line_data(kpi_info, connection_info.as_dict, timeline)
    except Exception as err:
        current_app.logger.info(f"Error Found: {err}")
    return jsonify({"data": data, "msg": ""})

@blueprint.route("/<int:kpi_id>/rca-analysis", methods=["GET"])
def kpi_rca_analysis(kpi_id):
    current_app.logger.info(f"RCA Analysis Started for KPI ID: {kpi_id}")
    data = []
    try:
        kpi_info = get_kpi_data_from_id(kpi_id)
        connection_info = DataSource.get_by_id(kpi_info["data_source"])
        timeline = request.args.get("timeline")
        dimension = request.args.get("dimension", None)
        data = rca_analysis(kpi_info, connection_info.as_dict, timeline, dimension)
    except Exception as err:
        current_app.logger.info(f"Error Found: {err}")
    current_app.logger.info("RCA Analysis Done")
    return jsonify({"data": data, "msg": ""})

@blueprint.route("/<int:kpi_id>/rca-hierarchical-data", methods=["GET"])
def kpi_rca_hierarchical_data(kpi_id):
    current_app.logger.info(f"RCA Analysis Started for KPI ID: {kpi_id}")
    data = []
    try:
        kpi_info = get_kpi_data_from_id(kpi_id)
        connection_info = DataSource.get_by_id(kpi_info["data_source"])
        timeline = request.args.get("timeline")
        dimension = request.args.get("dimension", None)
        data = rca_hierarchical_data(kpi_info, connection_info.as_dict, timeline, dimension)
    except Exception as err:
        current_app.logger.info(f"Error Found: {err}")
    current_app.logger.info("RCA Analysis Done")
    return jsonify({"data": data, "msg": ""})

@blueprint.route("/<int:kpi_id>/anomaly-detection", methods=["GET"])
def kpi_anomaly_detection(kpi_id):
    current_app.logger.info(f"Anomaly Detection Started for KPI ID: {kpi_id}")
    data = []
    try:
        kpi_info = get_kpi_data_from_id(kpi_id)
        connection_info = DataSource.get_by_id(kpi_info["data_source"])
        data = no_date_output
        df = get_anomaly_df(kpi_info, connection_info.as_dict)
    except Exception as err:
        current_app.logger.info(f"Error Found: {err}")
    current_app.logger.info("Anomaly Detection Done")
    return jsonify({"data": data, "msg": ""})


@blueprint.route("/<int:kpi_id>/anomaly-drilldown", methods=["GET"])
def kpi_anomaly_drilldown(kpi_id):
    current_app.logger.info(f"Anomaly Drilldown Started for KPI ID: {kpi_id}")
    data = []
    try:
        date = request.args.get("date", None)
        if date is None:
            raise ValueError(f"Date is not provided")
        else:
            date_selection_index = int(date.split("-")[0]) % 2
            data = date_output[date_selection_index]
    except Exception as err:
        current_app.logger.info(f"Error Found: {err}")
    current_app.logger.info("Anomaly Drilldown Done")
    return jsonify({"data": data, "msg": ""})


def get_baseline_and_rca_df(kpi_info, connection_info, timeline="mom"):
    today = datetime.today()
    indentifier = ''
    if connection_info["connection_type"] == "mysql":
        indentifier = '`'
    elif connection_info["connection_type"] == "postgresql":
        indentifier = '"'

    if timeline == "mom":
        num_days = 30
    elif timeline == "wow":
        num_days = 7
    base_dt_obj = today - timedelta(days=2*num_days)
    base_dt = str(base_dt_obj.date())
    mid_dt_obj = today - timedelta(days=num_days)
    mid_dt = str(mid_dt_obj.date())
    cur_dt = str(today.date())

    base_filter = f" where {indentifier}{kpi_info['datetime_column']}{indentifier} > '{base_dt}' and {indentifier}{kpi_info['datetime_column']}{indentifier} <= '{mid_dt}' "
    rca_filter = f" where {indentifier}{kpi_info['datetime_column']}{indentifier} > '{mid_dt}' and {indentifier}{kpi_info['datetime_column']}{indentifier}<= '{cur_dt}' "

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
    rca_query = f"select * from {kpi_info['table_name']} {rca_filter} {kpi_filters_query} "
    base_df = get_df_from_db_uri(connection_info["db_uri"], base_query)
    rca_df = get_df_from_db_uri(connection_info["db_uri"], rca_query)

    return base_df, rca_df


def get_anomaly_df(kpi_info, connection_info, days_range=90):
    indentifier = ''
    if connection_info["connection_type"] == "mysql":
        indentifier = '`'
    elif connection_info["connection_type"] == "postgresql":
        indentifier = '"'

    today = datetime.today()
    num_days = days_range
    base_dt_obj = today - timedelta(days=num_days)
    base_dt = str(base_dt_obj.date())

    base_filter = f" where {indentifier}{kpi_info['datetime_column']}{indentifier} > '{base_dt}' "

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


def process_rca_output(chart_data, kpi_info):
    rename_dict = {
        'string': "subgroup",
        f"size_g1": "g1_size",
        f"val_g1": "g1_agg",
        f"count_g1": "g1_count",
        f"size_g2": "g2_size", 
        f"val_g2": "g2_agg", 
        f"count_g2": "g2_count",
        f"impact": "impact",
        "id": "id",
        "parentId": "parentId",
    }
    df = pd.DataFrame(chart_data).rename(columns= rename_dict)
    df = df.drop(set(df.columns) - set(rename_dict.values()), axis= 1)
    df = df.fillna(np.nan).replace([np.nan], [None])
    return df.to_dict(orient= "records")

def kpi_aggregation(kpi_info, connection_info, timeline="mom"):
    try:
        base_df, rca_df = get_baseline_and_rca_df(kpi_info, connection_info, timeline)

        rca = RootCauseAnalysis(
            base_df, rca_df, 
            dims= kpi_info['dimensions'], 
            metric= kpi_info['metric'], 
            agg = kpi_info["aggregation"],
            precision = kpi_info.get("metric_precision", 3),
        )

        panel_metrics = rca.get_panel_metrics()

        final_data = {
            "panel_metrics": panel_metrics,
            "line_chart_data": [],
            "insights": []
        }

        print(final_data)

    except Exception as err:
        # print(traceback.format_exc())
        current_app.logger.error(f"Error in RCA Analysis: {err}")
        final_data = {
            "panel_metrics": [],
            "line_chart_data": [],
            "insights": []
        }
    return final_data


def kpi_line_data(kpi_info, connection_info, timeline="mom"):
    metric = kpi_info["metric"]
    dt_col = kpi_info["datetime_column"]
    agg = kpi_info["aggregation"]
    
    dfs = get_baseline_and_rca_df(kpi_info, connection_info, "mom")
    dfs = list(dfs)

    for i, df in enumerate(dfs):
        df = df.resample("D", on= dt_col).agg({metric: agg}).reset_index().round(kpi_info.get("metric_precision", 3))
        df["day"] = df["date"].dt.day
        df[dt_col] = df[dt_col].dt.strftime('%Y/%m/%d %H:%M:%S')
        dfs[i] = df

    base_df, rca_df = dfs

    output = base_df.merge(rca_df, how="outer", on="day")
    output = output.rename(columns= {
        "date_x": "previousDate", 
        "date_y": "date", 
        f"{metric}_x": "previousValue",
        f"{metric}_y": "value"
    }) 
    output["index"] = output.index
    output = output.drop("day", axis= 1).iloc[:30]
    output.dropna(inplace= True)

    return output.to_dict(orient="records")


def rca_analysis(kpi_info, connection_info, timeline="mom", dimension= None):
    try:
        base_df, rca_df = get_baseline_and_rca_df(kpi_info, connection_info, timeline)

        num_dim_combs_to_consider = list(range(1, min(3, len(kpi_info['dimensions']))))

        rca = RootCauseAnalysis(
            base_df, rca_df, 
            dims= kpi_info['dimensions'], 
            metric= kpi_info['metric'], 
            agg = kpi_info["aggregation"],
            num_dim_combs_to_consider = num_dim_combs_to_consider,
            precision = kpi_info.get("metric_precision", 3),
        )

        if dimension is None or dimension in kpi_info["dimensions"]:
            impact_table, impact_table_col_mapping = rca.get_impact_rows_with_columns(dimension)
            waterfall_table = rca.get_waterfall_table_rows(dimension)
            waterfall_data, y_axis_lim = rca.get_waterfall_plot_data(dimension)

            final_data = {
                "data_table": impact_table,
                "data_columns": impact_table_col_mapping,
                "chart": {
                    "chart_table": waterfall_table,
                    "chart_data": waterfall_data,
                    "y_axis_lim": y_axis_lim
                }
            }
        else:
            raise ValueError(f"Dimension: {dimension} does not exist.")

        tmp_chart_data = final_data['data_table']
        final_data['data_table'] = process_rca_output(tmp_chart_data, kpi_info)
    except Exception as err:
        # print(traceback.format_exc())
        current_app.logger.error(f"Error in RCA Analysis: {err}")
        final_data = {
            "chart": {"chart_data": [], "y_axis_lim": [], "chart_table": []}, 
            "data_table": []
        }
    return final_data

def rca_hierarchical_data(kpi_info, connection_info, timeline="mom", dimension= None):
    try:
        base_df, rca_df = get_baseline_and_rca_df(kpi_info, connection_info, timeline)

        if dimension not in kpi_info["dimensions"]:
            raise ValueError(f"{dimension} not in {kpi_info['dimensions']}")

        num_dim_combs_to_consider = list(range(1, min(3, len(kpi_info['dimensions']))))

        rca = RootCauseAnalysis(
            base_df, rca_df, 
            dims= kpi_info['dimensions'], 
            metric= kpi_info['metric'], 
            agg = kpi_info["aggregation"],
            num_dim_combs_to_consider = num_dim_combs_to_consider,
            precision = kpi_info.get("metric_precision", 3),
        )

        final_data = {
            'data_table': rca.get_hierarchical_table(dimension)
        }

        tmp_chart_data = final_data['data_table']
        final_data['data_table'] = process_rca_output(tmp_chart_data, kpi_info)
    except Exception as err:
        # print(traceback.format_exc())
        current_app.logger.error(f"Error in RCA hierarchical table generation: {err}")
        final_data = {
            "data_table": []
        }
    return final_data


def get_kpi_data_from_id(n: int) -> dict:
    """Returns the corresponding KPI data for the given KPI ID 
    from KPI_DATA.

    :param n: ID of KPI
    :type n: int

    :raises: ValueError

    :returns: KPI data
    :rtype: dict
    """

    for kpi_data in KPI_DATA:
        if kpi_data["id"] == n:
            return kpi_data
    raise ValueError(f"KPI ID {n} not found in KPI_DATA")


KPI_DATA = [
    {"id": 1, "is_certified": True, "kpi_type": "table", "name": "Call/day", "table_name": "marketing_records", "data_source": 2, "datetime_column": "date", "metric": "sum_calls", "metric_precision": 2, "aggregation": "mean", "filters": {}, "dimensions": ["job","marital","education","housing","loan"]},
    {"id": 2, "is_certified": True, "kpi_type": "table", "name": "Conversion per day", "table_name": "marketing_records", "data_source": 2, "datetime_column": "date", "metric": "sum_conversion", "metric_precision": 2, "aggregation": "mean", "filters": {}, "dimensions": ["job","marital","education","housing","loan"]},
  # {"id": 3, "is_certified": True, "kpi_type": "table", "name": "Avg call duration", "table_name": "marketing_records", "data_source": 2, "datetime_column": "date", "metric": "avg_duration", "metric_precision": 2, "aggregation": "mean", "filters": {}, "dimensions": ["job","marital","education","housing","loan"]},
    {"id": 4, "is_certified": True, "kpi_type": "table", "name": "Avg call duration for admin job", "table_name": "marketing_records", "data_source": 2, "datetime_column": "date", "metric": "avg_duration", "metric_precision": 2, "aggregation": "mean", "filters": {"job": ["admin."]}, "dimensions": ["marital","education","housing","loan"]},
    {"id": 5, "is_certified": True, "kpi_type": "table", "name": "Avg call duration for blue collar job", "table_name": "marketing_records", "data_source": 2, "datetime_column": "date", "metric": "avg_duration", "metric_precision": 2, "aggregation": "mean", "filters": {"job": ["blue-collar"]}, "dimensions": ["marital","education","housing","loan"]},
    {"id": 6, "is_certified": True, "kpi_type": "table", "name": "Avg call duration for management job", "table_name": "marketing_records", "data_source": 2, "datetime_column": "date", "metric": "avg_duration", "metric_precision": 2, "aggregation": "mean", "filters": {"job": ["management"]}, "dimensions": ["marital","education","housing","loan"]},
  # {"id": 7, "is_certified": True, "kpi_type": "table", "name": "Total price", "table_name": "mh_food_prices", "data_source": 4, "datetime_column": "date", "metric": "modal_price", "metric_precision": 2, "aggregation": "mean", "filters": {}, "dimensions": ["Commodity", "APMC", "district_name"]},
  # {"id": 8, "is_certified": True, "kpi_type": "table", "name": "Total price for onion", "table_name": "mh_food_prices", "data_source": 4, "datetime_column": "date", "metric": "modal_price", "metric_precision": 2, "aggregation": "mean", "filters": {"Commodity": ["Onion"]}, "dimensions": ["APMC", "district_name"]},
  # {"id": 9, "is_certified": True, "kpi_type": "table", "name": "Total price for maize", "table_name": "mh_food_prices", "data_source": 4, "datetime_column": "date", "metric": "modal_price", "metric_precision": 2, "aggregation": "mean", "filters": {"Commodity": ["Maize"]}, "dimensions": ["APMC", "district_name"]},
  # {"id": 10, "is_certified": True, "kpi_type": "table", "name": "Total price for green chilli", "table_name": "mh_food_prices", "data_source": 4, "datetime_column": "date", "metric": "modal_price", "metric_precision": 2, "aggregation": "mean", "filters": {"Commodity": ["Green Chilli"]}, "dimensions": ["APMC", "district_name"]},
    {"id": 11, "is_certified": True, "kpi_type": "table", "name": "Call/day (MySQL)", "table_name": "marketing_records", "data_source": 5, "datetime_column": "date", "metric": "sum_calls", "metric_precision": 2, "aggregation": "mean", "filters": {}, "dimensions": ["job","marital","education","housing","loan"]},
    {"id": 12, "is_certified": True, "kpi_type": "table", "name": "Conversion per day (MySQL)", "table_name": "marketing_records", "data_source": 5, "datetime_column": "date", "metric": "sum_conversion", "metric_precision": 2, "aggregation": "mean", "filters": {}, "dimensions": ["job","marital","education","housing","loan"]},
    {"id": 13, "is_certified": True, "kpi_type": "table", "name": "Avg call duration (MySQL)", "table_name": "marketing_records", "data_source": 5, "datetime_column": "date", "metric": "avg_duration", "metric_precision": 2, "aggregation": "mean", "filters": {}, "dimensions": ["job","marital","education","housing","loan"]},
  # {"id": 14, "is_certified": True, "kpi_type": "table", "name": "Avg call duration for admin job (MySQL)", "table_name": "marketing_records", "data_source": 5, "datetime_column": "date", "metric": "avg_duration", "metric_precision": 2, "aggregation": "mean", "filters": {"job": ["admin."]}, "dimensions": ["marital","education","housing","loan"]},
  # {"id": 15, "is_certified": True, "kpi_type": "table", "name": "Avg call duration for blue collar job (MySQL)", "table_name": "marketing_records", "data_source": 5, "datetime_column": "date", "metric": "avg_duration", "metric_precision": 2, "aggregation": "mean", "filters": {"job": ["blue-collar"]}, "dimensions": ["marital","education","housing","loan"]},
  # {"id": 16, "is_certified": True, "kpi_type": "table", "name": "Avg call duration for management job (MySQL)", "table_name": "marketing_records", "data_source": 5, "datetime_column": "date", "metric": "avg_duration", "metric_precision": 2, "aggregation": "mean", "filters": {"job": ["management"]}, "dimensions": ["marital","education","housing","loan"]},
    {"id": 17, "is_certified": True, "kpi_type": "table", "name": "E-Com - Total Sales", "table_name": "ecom_retail", "data_source": 22, "datetime_column": "date", "metric": "ItemTotalPrice", "metric_precision": 2, "aggregation": "sum", "filters": {}, "dimensions": ["DayOfWeek", "PurchaseTime", "Country"]},
    {"id": 18, "is_certified": True, "kpi_type": "table", "name": "E-Com - Average Sales", "table_name": "ecom_retail", "data_source": 22, "datetime_column": "date", "metric": "ItemTotalPrice", "metric_precision": 2, "aggregation": "mean", "filters": {}, "dimensions": ["DayOfWeek", "PurchaseTime", "Country"]},
]

DB_DIMS = {
    "marketing_records": ["job","marital","education","housing","loan"],
    "mh_food_prices": ["Commodity", "APMC", "district_name"],
    "ecom_retail": ["DayOfWeek", "PurchaseTime", "Country"]
}