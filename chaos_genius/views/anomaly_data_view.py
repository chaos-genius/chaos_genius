# -*- coding: utf-8 -*-
"""anomaly data view."""
from datetime import datetime, timedelta
import traceback

from flask import Blueprint, current_app, jsonify, request
import pandas as pd

from chaos_genius.extensions import cache
from chaos_genius.connectors.base_connector import get_df_from_db_uri
from chaos_genius.databases.models.anomaly_data_model import AnomalyDataOutput
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
        kpi_info = get_kpi_data_from_id(kpi_id)
        end_date = get_end_date(kpi_info)

        anom_data = get_overall_data(kpi_id, end_date)

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
    subdim_graphs = []
    try:

        drilldown_date = request.args.get("date")
        if drilldown_date is None:
            raise ValueError("date param is required.")

        drilldown_date = pd.to_datetime(drilldown_date, unit="ms").date()

        subdims = get_drilldowns_series_type(kpi_id, drilldown_date)

        kpi_info = get_kpi_data_from_id(kpi_id)
        end_date = get_end_date(kpi_info)

        for subdim in subdims:
            results = get_dq_and_subdim_data(
                kpi_id, end_date, "subdim", subdim)
            subdim_graphs.append(results)

    except Exception as err:
        current_app.logger.info(f"Error Found: {err}")
    current_app.logger.info("Anomaly Drilldown Done")
    return jsonify({"data": subdim_graphs, "msg": ""})


@blueprint.route("/<int:kpi_id>/anomaly-data-quality", methods=["GET"])
def kpi_anomaly_data_quality(kpi_id):
    current_app.logger.info(f"Anomaly Drilldown Started for KPI ID: {kpi_id}")

    data = []
    try:
        kpi_info = get_kpi_data_from_id(kpi_id)
        end_date = get_end_date(kpi_info)

        for dq in ["max", "mean", "count", "missing"]:
            anom_data = get_dq_and_subdim_data(kpi_id, end_date, "dq", dq)
            data.append(anom_data)

    except Exception as err:
        current_app.logger.info(f"Error Found: {err}")

    current_app.logger.info("Anomaly Drilldown Done")
    return jsonify({"data": data, "msg": ""})


def fill_graph_data(row, graph_data, precision=2):
    """Fills graph_data with intervals, values, and predicted_values for
    a given row.

    :param row: A single row from the anomaly dataframe
    :type row: pandas.core.series.Series
    :param graph_data: Dictionary object with the current graph
    :type graph_data: Dict
    :param precision: Precision to round y and yhat values to, defaults
        to 2
    :type precision: int, optional
    """
    # Do not include rows where there is no data
    if row.notna()['y']:
        # Convert to milliseconds for HighCharts
        timestamp = row['data_datetime'].timestamp() * 1000

        # Create and append a point for the interval
        interval = [timestamp, round(row['yhat_lower'], precision), round(
            row['yhat_upper'], precision)]
        graph_data['intervals'].append(interval)

        # Create and append a point for the value
        value = [timestamp, round(row['y'])]
        graph_data['values'].append(value)

        # Create and append a point for the severity
        severity = [timestamp, round(row['severity'], precision)]
        graph_data['severity'].append(severity)


def convert_to_graph_json(
    results, 
    kpi_id, 
    anomaly_type="overall", 
    series_type=None, 
    precision=2
):
    # TODO: Make the graph title more human-friendly
    title = anomaly_type
    if series_type:
        title += " " + series_type

    kpi_name = kpi_id
    graph_data = {
        'title': title,
        'y_axis_label': kpi_name,
        'x_axis_label': 'Datetime',
        'sub_dimension': anomaly_type,
        'intervals': [],
        'values': [],
        'severity': []
    }

    results.apply(
        lambda row: fill_graph_data(row, graph_data, precision),
        axis=1
    )

    return graph_data


def get_overall_data(kpi_id, end_date: str, n=90):
    start_date = pd.to_datetime(end_date) - timedelta(days=n)
    start_date = start_date.strftime('%Y-%m-%d')
    end_date = end_date.strftime('%Y-%m-%d')

    query = AnomalyDataOutput.query.filter(
        (AnomalyDataOutput.kpi_id == kpi_id)
        & (AnomalyDataOutput.data_datetime <= end_date)
        & (AnomalyDataOutput.data_datetime >= start_date)
        & (AnomalyDataOutput.anomaly_type == "overall")
    )

    results = pd.read_sql(query.statement, query.session.bind)

    return convert_to_graph_json(results, kpi_id, "overall", None)


def get_dq_and_subdim_data(
    kpi_id, 
    end_date, 
    anomaly_type="dq", 
    series_type="max", 
    n=90
):
    start_date = pd.to_datetime(end_date) - timedelta(days=n)
    start_date = start_date.strftime('%Y-%m-%d')
    end_date = end_date.strftime('%Y-%m-%d')

    query = AnomalyDataOutput.query.filter(
        (AnomalyDataOutput.kpi_id == kpi_id)
        & (AnomalyDataOutput.data_datetime <= end_date)
        & (AnomalyDataOutput.data_datetime >= start_date)
        & (AnomalyDataOutput.anomaly_type == anomaly_type)
        & (AnomalyDataOutput.series_type == series_type)
    )

    results = pd.read_sql(query.statement, query.session.bind)

    return convert_to_graph_json(results, kpi_id, anomaly_type, series_type)


def get_drilldowns_series_type(kpi_id, drilldown_date, no_of_graphs=5):
    query = AnomalyDataOutput.query.filter(
        (AnomalyDataOutput.kpi_id == kpi_id)
        & (AnomalyDataOutput.data_datetime == drilldown_date)
        & (AnomalyDataOutput.anomaly_type == "subdim")
    ).order_by(AnomalyDataOutput.severity.desc()).limit(no_of_graphs)

    results = pd.read_sql(query.statement, query.session.bind)

    return results.series_type


def get_end_date(kpi_info: dict) -> datetime:
    """Checks if the KPI has a static end date and returns it. Otherwise
    returns today's date.

    :return: end date for use with anomaly data output
    :rtype: datetime
    """

    end_date = None

    if kpi_info['is_static']:
        end_date = kpi_info.get('static_params', {}).get('end_date', None)
        if end_date is not None:
            end_date = datetime.strptime(end_date, '%Y-%m-%d').date()

    if end_date is None:
        end_date = datetime.today().date()

    return end_date
