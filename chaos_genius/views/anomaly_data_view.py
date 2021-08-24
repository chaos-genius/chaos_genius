# -*- coding: utf-8 -*-
"""anomaly data view."""
from datetime import datetime, timedelta
import traceback

from flask import Blueprint, current_app, jsonify, request
import pandas as pd

from chaos_genius.extensions import cache
from chaos_genius.connectors.base_connector import get_df_from_db_uri
from chaos_genius.databases.models.data_source_model import DataSource
from chaos_genius.views.kpi_view import get_kpi_data_from_id


blueprint = Blueprint("anomaly_data", __name__)


@blueprint.route("/", methods=["GET"])
@cache.memoize(timeout=30000)
def list_anomaly_data():
    # FIXME: Update home route
    return jsonify({"data": "Hello World!"})

@blueprint.route("/<int:kpi_id>/anomaly-detection", methods=["GET"])
@cache.memoize(timeout=30000)
def kpi_anomaly_detection(kpi_id):
    current_app.logger.info(f"Anomaly Detection Started for KPI ID: {kpi_id}")
    data = []
    try:
        anom_data = get_overall_data(kpi_id, datetime.today())
        data = {
            "chart_data": anom_data,
            # TODO: base_anomaly_id not needed anymore
            # remove from here once updated in frontend
            "base_anomaly_id": kpi_id
        }
    except Exception as err:
        print(traceback.format_exc())
        current_app.logger.info(f"Error Found: {err}")
    current_app.logger.info("Anomaly Detection Done")
    return jsonify({"data": data, "msg": ""})


@blueprint.route("/<int:kpi_id>/anomaly-drilldown", methods=["GET"])
def kpi_anomaly_drilldown(kpi_id):
    current_app.logger.info(f"Anomaly Drilldown Started for KPI ID: {kpi_id}")
    data = []
    try:
        # FIXME: Figure out how to select subdim for an anomaly date
        # Simple implementation as follows:
        #   From anomaly output select all subdims for mentioned date
        #   Sort by severity (desc) and pick N series
        #   Query for full series and return charts
        raise NotImplementedError
    except Exception as err:
        current_app.logger.info(f"Error Found: {err}")
    current_app.logger.info("Anomaly Drilldown Done")
    return jsonify({"data": data, "msg": ""})


@blueprint.route("/<int:kpi_id>/anomaly-data-quality", methods=["GET"])
def kpi_anomaly_data_quality(kpi_id):
    current_app.logger.info(f"Anomaly Drilldown Started for KPI ID: {kpi_id}")
    
    data = []
    try:
        
        for dq in ["max", "mean", "count", "missing"]:
            anom_data = dq_and_subdim_data(kpi_id, datetime.today(), "dq", dq)
            data.append(anom_data)

    except Exception as err:
        current_app.logger.info(f"Error Found: {err}")
    
    current_app.logger.info("Anomaly Drilldown Done")
    return jsonify({"data": data, "msg": ""})


def convert_to_graph_json(results, kpi_id, anomaly_type = "overall", series_type= None, precision=2):
    # results = pd.DataFrame.from_dict(results)
    def fill_graph_data(row, graph_data, precision=2):
        """Fills graph_data with intervals, values, and predicted_values for a given row.

        :param row: A single row from the anomaly dataframe
        :type row: pandas.core.series.Series
        :param graph_data: Dictionary object with the current graph
        :type graph_data: Dict
        :param precision: Precision to round y and yhat values to, defaults to 2
        :type precision: int, optional
        """
        if row.notna()['y']:  # Do not include rows where there is no data
            # Convert to milliseconds for HighCharts
            timestamp = row['data_datetime'].timestamp() * 1000
            # Create and append a point for the interval
            interval = [timestamp, round(row['yhat_lower'], precision), round(
                row['yhat_upper'], precision)]
            graph_data['intervals'].append(interval)
            # Create and append a point for the value
            value = [timestamp, round(row['y'])]
            graph_data['values'].append(value)
            # Create and append a point for the predicted_value
            
            # predicted_value = [timestamp, round(row['yhat'], precision)]
            # graph_data['predicted_values'].append(predicted_value)
            
            # Create and append a point for the severity
            severity = [timestamp, round(row['severity'], precision)]
            graph_data['severity'].append(severity)

    # TODO: Make this more human-friendly
    title = anomaly_type
    if series_type:
        title += " " + series_type
    
    # add id to name mapping here
    kpi_name = kpi_id
    graph_data = {
            'title': title,
            'y_axis_label': kpi_name,
            'x_axis_label': 'Datetime',
            'sub_dimension': anomaly_type,
            'intervals': [],
            'values': [],
            # 'predicted_values': [],
            'severity': []
        }
    # print(results)
    results.apply(lambda row: fill_graph_data(
            row, graph_data, precision), axis=1)
        
    return graph_data


def get_overall_data(kpi_id, end_date: str, n=90):
    start_date = pd.to_datetime(end_date) - timedelta(days=n)
    start_date = start_date.strftime('%Y-%m-%d')
    end_date = end_date.strftime('%Y-%m-%d')

    # FIXME: Find a better way of doing this
    table_name = "anomaly_test_schema"
    dbUri = "postgresql+psycopg2://postgres:chaosgenius@localhost/anomaly_testing_db"

    sql_query = f"select * from {table_name} where kpi_id = {kpi_id} and data_datetime <= '{end_date}' and data_datetime >= '{start_date}' and anomaly_type='overall'"
    results = get_df_from_db_uri(dbUri, sql_query)
    
    graphData = convert_to_graph_json(results, kpi_id, "overall", None)
    
    return graphData

def dq_and_subdim_data(kpi_id, end_date, anomaly_type="dq", series_type="max", n=90):
    

    start_date = pd.to_datetime(end_date) - timedelta(days=n)
    start_date = start_date.strftime('%Y-%m-%d')
    end_date = end_date.strftime('%Y-%m-%d')

    # FIXME: Find a better way of doing this
    table_name = "anomaly_test_schema"
    dbUri = "postgresql+psycopg2://postgres:chaosgenius@localhost/anomaly_testing_db"
    
    sql_query = f"select * from {table_name} where kpi_id = {kpi_id} and data_datetime <= '{end_date}' and data_datetime >= '{start_date}' and anomaly_type='{anomaly_type}' and series_type='{series_type}'"
    results = get_df_from_db_uri(dbUri, sql_query)

    graphData = convert_to_graph_json(results, kpi_id, anomaly_type, series_type)

    return graphData
