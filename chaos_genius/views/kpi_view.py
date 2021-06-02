# -*- coding: utf-8 -*-
"""KPI views for creating and viewing the kpis."""
import traceback
from datetime import datetime, timedelta

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

from chaos_genius.utils import flash_errors
from chaos_genius.databases.models.kpi_model import Kpi
from chaos_genius.databases.models.connection_model import Connection
from chaos_genius.core.rca_analysis import get_waterfall_and_impact_table
from chaos_genius.connectors.base_connector import get_df_from_db_uri


blueprint = Blueprint("api_kpi", __name__, static_folder="../static")


@blueprint.route("/", methods=["GET", "POST"])
def kpi():
    """kpi list view."""
    current_app.logger.info("kpi list")
    # Handle logging in
    if request.method == 'POST':
        if request.is_json:
            data = request.get_json()
            # conn_name = data.get('name')
            # conn_uri = data.get('db_uri')
            # new_connection = Connection(name=conn_name, db_uri=conn_uri)
            # new_connection.save()
            return jsonify({"message": f"Connection new_connection.name has been created successfully."})
        else:
            return jsonify({"error": "The request payload is not in JSON format"})

    elif request.method == 'GET':
        # kpis = Kpi.query.all()
        # results = [kpi.safe_dict for kpi in kpis]
        results = KPI_DATA
        return jsonify({"count": len(results), "data": results})


@blueprint.route("/<int:kpi_id>/rca-analysis", methods=["GET"])
def kpi_rca_analysis(kpi_id):
    current_app.logger.info(f"RCA Analysis Started for KPI ID: {kpi_id}")
    data = []
    try:
        kpi_info = KPI_DATA[kpi_id-1]
        connection_info = Connection.get_by_id(kpi_info["data_source"])
        timeline = request.args.get("timeline")
        data = rca_analysis(kpi_info, connection_info.as_dict, timeline)
    except Exception as err:
        current_app.logger.info(f"Error Found: {err}")
    current_app.logger.info("RCA Analysis Done")
    return jsonify({"data": data, "msg": ""})


def rca_analysis(kpi_info, connection_info, timeline="mom"):
    try:
        today = datetime.today()
        if timeline == "mom":
            base_dt = f"{today.year}-{today.month-1}-01"
            cur_dt = f"{today.year}-{today.month}-01"
            next_dt = f"{today.year}-{today.month+1}-01"
        elif timeline == "wow":
            weekday = today.weekday()
            base_dt_obj = today - timedelta(days=weekday+7)
            base_dt = str(base_dt_obj.date())
            cur_dt_obj = today - timedelta(days=weekday)
            cur_dt = str(cur_dt_obj.date())
            next_dt_obj = cur_dt_obj + timedelta(days=7)
            next_dt = str(next_dt_obj.date())

        base_filter = f" where {kpi_info['datetime_column']} >= '{base_dt}' and {kpi_info['datetime_column']} < '{cur_dt}' "
        rca_filter = f" where {kpi_info['datetime_column']} >= '{cur_dt}' and {kpi_info['datetime_column']} < '{next_dt}' "

        kpi_filters = kpi_info['filters']
        kpi_filters_query = " "
        if kpi_filters:
            kpi_filters_query = " "
            for key, values in kpi_filters.items():
                if values:
                    # TODO: Bad Hack to remove the last comma, fix it
                    values_str = str(tuple(values))
                    values_str = values_str[:-2] + ')'
                    kpi_filters_query += f" and \"{key}\" in {values_str}"

        base_query = f"select * from {kpi_info['kpi_query']} {base_filter} {kpi_filters_query} "
        rca_query = f"select * from {kpi_info['kpi_query']} {rca_filter} {kpi_filters_query} "
        base_df = get_df_from_db_uri(connection_info["db_uri"], base_query)
        rca_df = get_df_from_db_uri(connection_info["db_uri"], rca_query)
        final_data = get_waterfall_and_impact_table(base_df, rca_df, kpi_info["dimensions"], kpi_info["metric"], n=[1, 2, 3])
        tmp_chart_data = final_data['data_table']
        new_tmp = []
        for data in tmp_chart_data:
            new_tmp.append({
                "subgroup": data.get('user_string'),
                "g1_size": round(data.get(f"{kpi_info['metric']}_size_g1", 0.0), 1),
                "g1_agg": round(data.get(f"{kpi_info['metric']}_mean_g1", 0.0), 3),
                "g2_size": round(data.get(f"{kpi_info['metric']}_size_g2", 0.0), 1),
                "g2_agg": round(data.get(f"{kpi_info['metric']}_mean_g2", 0.0), 3),
                "impact": round(data.get(f"{kpi_info['metric']}_impact", 0.0), 3),
            })
        final_data['data_table'] = new_tmp
    except Exception as err:
        # print(traceback.format_exc())
        current_app.logger.error(f"Error in RCA Analysis: {err}")
        final_data = {"chart": {"chart_data": [], "y_axis_lim": []}, "data_table": []}
    return final_data


KPI_DATA = [
    {"id": 1, "name": "Call/day", "kpi_query": "marketing_records", "data_source": 2, "datetime_column": "date", "metric": "sum_calls", "aggregation": "mean", "filters": {}, "dimensions": ["job","marital","education","housing","loan"]},
    {"id": 2, "name": "Conversion per day", "kpi_query": "marketing_records", "data_source": 2, "datetime_column": "date", "metric": "sum_conversion", "aggregation": "mean", "filters": {}, "dimensions": ["job","marital","education","housing","loan"]},
    {"id": 3, "name": "Avg call duration", "kpi_query": "marketing_records", "data_source": 2, "datetime_column": "date", "metric": "avg_duration", "aggregation": "mean", "filters": {}, "dimensions": ["job","marital","education","housing","loan"]},
    {"id": 4, "name": "Avg call duration for admin job", "kpi_query": "marketing_records", "data_source": 2, "datetime_column": "date", "metric": "avg_duration", "aggregation": "mean", "filters": {"job": ["admin."]}, "dimensions": ["marital","education","housing","loan"]},
    {"id": 5, "name": "Avg call duration for blue collar job", "kpi_query": "marketing_records", "data_source": 2, "datetime_column": "date", "metric": "avg_duration", "aggregation": "mean", "filters": {"job": ["blue-collar"]}, "dimensions": ["marital","education","housing","loan"]},
    {"id": 6, "name": "Avg call duration for management job", "kpi_query": "marketing_records", "data_source": 2, "datetime_column": "date", "metric": "avg_duration", "aggregation": "mean", "filters": {"job": ["management"]}, "dimensions": ["marital","education","housing","loan"]},
    {"id": 7, "name": "Total price", "kpi_query": "mh_food_prices", "data_source": 4, "datetime_column": "date", "metric": "modal_price", "aggregation": "mean", "filters": {}, "dimensions": ["Commodity", "APMC", "district_name"]},
    {"id": 8, "name": "Total price for onion", "kpi_query": "mh_food_prices", "data_source": 4, "datetime_column": "date", "metric": "modal_price", "aggregation": "mean", "filters": {"Commodity": ["Onion"]}, "dimensions": ["APMC", "district_name"]},
    {"id": 9, "name": "Total price for maize", "kpi_query": "mh_food_prices", "data_source": 4, "datetime_column": "date", "metric": "modal_price", "aggregation": "mean", "filters": {"Commodity": ["Maize"]}, "dimensions": ["APMC", "district_name"]},
    {"id": 10, "name": "Total price for green chilli", "kpi_query": "mh_food_prices", "data_source": 4, "datetime_column": "date", "metric": "modal_price", "aggregation": "mean", "filters": {"Commodity": ["Green Chilli"]}, "dimensions": ["APMC", "district_name"]}
]
