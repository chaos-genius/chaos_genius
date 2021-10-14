# -*- coding: utf-8 -*-
"""anomaly data view."""
from chaos_genius.databases.base_model import get_readable_validation_error
from datetime import datetime, timedelta
import traceback
from typing import Any, Dict, Optional, Tuple, cast

from flask import Blueprint, current_app, jsonify, request
from marshmallow.exceptions import ValidationError
import pandas as pd
from sqlalchemy.orm.attributes import flag_modified
from chaos_genius.core.anomaly.constants import MODEL_NAME_MAPPING

from chaos_genius.extensions import cache
from chaos_genius.databases.models.anomaly_data_model import AnomalyDataOutput
from chaos_genius.databases.models.rca_data_model import RcaData
from chaos_genius.databases.models.kpi_model import Kpi
from chaos_genius.databases.models.anomaly_params_model import anomaly_params_api_schema
from chaos_genius.views.kpi_view import get_kpi_data_from_id

from chaos_genius.core.rca.rca_utils.string_helpers import convert_query_string_to_user_string


blueprint = Blueprint("anomaly_data", __name__)


@blueprint.route("/", methods=["GET"])
@cache.memoize()
def list_anomaly_data():
    # FIXME: Update home route
    return jsonify({"data": "Hello World!"})


@blueprint.route("/<int:kpi_id>/anomaly-detection", methods=["GET"])
@cache.memoize()
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
        data["chart_data"]["title"] = kpi_info["name"]
    except Exception as err:
        print(traceback.format_exc())
        current_app.logger.info(f"Error Found: {err}")
    current_app.logger.info("Anomaly Detection Done")
    return jsonify({
        "data": data,
        "msg": "",
        "anomaly_end_date": get_anomaly_end_date(kpi_id)
        })


@blueprint.route("/<int:kpi_id>/anomaly-drilldown", methods=["GET"])
def kpi_anomaly_drilldown(kpi_id):
    current_app.logger.info(f"Anomaly Drilldown Started for KPI ID: {kpi_id}")
    subdim_graphs = []
    try:

        drilldown_date = request.args.get("date")
        if drilldown_date is None:
            raise ValueError("date param is required.")

        drilldown_date = pd.to_datetime(drilldown_date, unit="ms")

        subdims = get_drilldowns_series_type(kpi_id, drilldown_date)

        kpi_info = get_kpi_data_from_id(kpi_id)
        end_date = get_end_date(kpi_info)

        for subdim in subdims:
            results = get_dq_and_subdim_data(
                kpi_id, end_date, "subdim", subdim)
            subdim_graphs.append(results)

    except Exception as err:
        print(traceback.format_exc())
        current_app.logger.info(f"Error Found: {err}")
    current_app.logger.info("Anomaly Drilldown Done")
    return jsonify({
        "data": subdim_graphs,
        "msg": "",
        "anomaly_end_date": get_anomaly_end_date(kpi_id)
        })


@blueprint.route("/<int:kpi_id>/anomaly-data-quality", methods=["GET"])
def kpi_anomaly_data_quality(kpi_id):
    current_app.logger.info(f"Anomaly Drilldown Started for KPI ID: {kpi_id}")

    data, status, msg = [], "success", ""
    try:
        kpi_info = get_kpi_data_from_id(kpi_id)
        end_date = get_end_date(kpi_info)

        agg = kpi_info["aggregation"]
        if agg != "mean":
            dq_list = ["max", "count", "mean"]
        else:
            dq_list = ["max", "count"]

        for dq in dq_list:
            anom_data = get_dq_and_subdim_data(kpi_id, end_date, "dq", dq)
            data.append(anom_data)

    except Exception as err:
        status = "failed"
        msg = err
        current_app.logger.info(f"Error Found: {err}")

    current_app.logger.info("Anomaly Drilldown Done")
    return jsonify({
        "data": data,
        "msg": msg,
        "status": status,
        "anomaly_end_date": get_anomaly_end_date(kpi_id)
        })


@blueprint.route("/anomaly-params/meta-info", methods=["GET"])
def kpi_anomaly_params_meta():
    return jsonify(anomaly_params_api_schema.get_meta_info())


@blueprint.route("/<int:kpi_id>/anomaly-params", methods=["POST", "GET"])
def kpi_anomaly_params(kpi_id: int):
    kpi = cast(Kpi, Kpi.get_by_id(kpi_id))

    if kpi is None:
        return jsonify(
            {"error": f"Could not find KPI for ID: {kpi_id}", "status": "failure"}
        ), 400

    # when method is GET we just return the anomaly params
    if request.method == "GET":
        return jsonify({
            "anomaly_params": anomaly_params_api_schema.load_from_kpi(kpi),
        })

    # when it's POST, update anomaly params

    # check if this is first time anomaly setup or edit config
    is_first_time = kpi.anomaly_params is None

    if is_first_time:
        current_app.logger.info(f"Adding anomaly parameters for KPI ID: {kpi_id}")
    else:
        current_app.logger.info(f"Updating existing anomaly parameters for KPI ID: {kpi_id}")

    if not request.is_json:
        return jsonify(
            {"error": "Request body must be a JSON (and Content-Type header must be set correctly)", "status": "failure"}
        ), 400

    req_data: dict = cast(dict, request.get_json())

    if "anomaly_params" not in req_data:
        return jsonify(
            {"error": "The request JSON needs to have anomaly_params as a field", "status": "failure"}
        ), 400

    try:
        new_anomaly_params = anomaly_params_api_schema.load(req_data["anomaly_params"], partial=True)
    except ValidationError as e:
        current_app.logger.error(
            "Could not load anomaly-params from API request for KPI %s",
            kpi_id,
            exc_info=e
        )
        return jsonify({"error": get_readable_validation_error(e), "status": "failure"}), 400

    err, new_kpi = anomaly_params_api_schema.update_anomaly_params(kpi, new_anomaly_params, check_editable=not is_first_time)

    if err != "":
        return jsonify({"error": err, "status": "failure"}), 400

    # we ensure anomaly task is run as soon as analytics is configured
    # we also run RCA at the same time
    if is_first_time:
        # TODO: move this import to top and fix import issue
        from chaos_genius.jobs.anomaly_tasks import ready_anomaly_task, ready_rca_task
        anomaly_task = ready_anomaly_task(new_kpi.id)
        rca_task = ready_rca_task(new_kpi.id)
        if anomaly_task is None or rca_task is None:
            print(
                "Could not run anomaly task since newly configured KPI was not found: "
                f"{new_kpi.id}"
            )
        else:
            anomaly_task.apply_async()
            rca_task.apply_async()

    return jsonify({
        "msg": "Successfully updated Anomaly params",
        "status": "success"
    })


@blueprint.route("/<int:kpi_id>/settings", methods=["GET"])
# @cache.memoize()
def anomaly_settings_status(kpi_id):
    current_app.logger.info(f"Retrieving anomaly settings for kpi: {kpi_id}")
    kpi = cast(Kpi, Kpi.get_by_id(kpi_id))

    if kpi is None:
        return jsonify(
            {"error": f"Could not find KPI for ID: {kpi_id}", "status": "failure"}
        ), 400

    response = DEFAULT_STATUS.copy()

    if kpi.scheduler_params is not None:
        response.update({k: v for k, v in kpi.scheduler_params.items() if k in DEFAULT_STATUS})

    response["is_anomaly_setup"] = kpi.anomaly_params is not None

    rca_data = RcaData.query.filter(
        RcaData.kpi_id == kpi_id
    ).all()
    if len(rca_data) == 0:
        is_precomputed = False
    else:
        is_precomputed = True
    response["is_rca_precomputed"] = is_precomputed

    anomaly_data = AnomalyDataOutput.query.filter(
        AnomalyDataOutput.kpi_id == kpi_id
    ).all()
    response["is_anomaly_precomputed"] = len(anomaly_data) != 0

    current_app.logger.info(f"Anomaly settings retrieved for kpi: {kpi_id}")
    return jsonify(response)


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
    kpi_info = get_kpi_data_from_id(kpi_id)

    if anomaly_type == "overall":    
        title = kpi_info["name"]
    elif anomaly_type == "subdim":
        title = convert_query_string_to_user_string(series_type)
    else:
        title = "DQ " + series_type.capitalize()

    kpi_name = kpi_info["metric"]
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
    start_date = start_date.strftime('%Y-%m-%d %H:%M:%S')
    end_date = end_date.strftime('%Y-%m-%d %H:%M:%S')

    query = AnomalyDataOutput.query.filter(
        (AnomalyDataOutput.kpi_id == kpi_id)
        & (AnomalyDataOutput.data_datetime <= end_date)
        & (AnomalyDataOutput.data_datetime >= start_date)
        & (AnomalyDataOutput.anomaly_type == "overall")
    ).order_by(AnomalyDataOutput.data_datetime)

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
    start_date = start_date.strftime('%Y-%m-%d %H:%M:%S')
    end_date = end_date.strftime('%Y-%m-%d %H:%M:%S')

    query = AnomalyDataOutput.query.filter(
        (AnomalyDataOutput.kpi_id == kpi_id)
        & (AnomalyDataOutput.data_datetime <= end_date)
        & (AnomalyDataOutput.data_datetime >= start_date)
        & (AnomalyDataOutput.anomaly_type == anomaly_type)
        & (AnomalyDataOutput.series_type == series_type)
    ).order_by(AnomalyDataOutput.data_datetime)

    results = pd.read_sql(query.statement, query.session.bind)

    return convert_to_graph_json(results, kpi_id, anomaly_type, series_type)


def get_drilldowns_series_type(kpi_id, drilldown_date, no_of_graphs=5):
    # First we get direction of anomaly
    # Then we get relevant subdims for that anomaly
    is_anomaly = AnomalyDataOutput.query.filter(
        (AnomalyDataOutput.kpi_id == kpi_id)
        & (AnomalyDataOutput.data_datetime == drilldown_date)
        & (AnomalyDataOutput.anomaly_type == "overall")
    ).first().is_anomaly

    if is_anomaly == 0:
        raise ValueError(f"No anomaly found for date {drilldown_date}")

    query = AnomalyDataOutput.query.filter(
        (AnomalyDataOutput.kpi_id == kpi_id)
        & (AnomalyDataOutput.data_datetime == drilldown_date)
        & (AnomalyDataOutput.anomaly_type == "subdim")
        & (AnomalyDataOutput.is_anomaly == is_anomaly)
    ).order_by(AnomalyDataOutput.severity.desc()).limit(no_of_graphs)

    results = pd.read_sql(query.statement, query.session.bind)
    if len(results) == 0:
        start_date = drilldown_date - timedelta(days = 1)
        end_date = drilldown_date + timedelta(days=1)
        query = AnomalyDataOutput.query.filter(
            (AnomalyDataOutput.kpi_id == kpi_id)
            & (AnomalyDataOutput.data_datetime <= end_date)
            & (AnomalyDataOutput.data_datetime >= start_date)
            & (AnomalyDataOutput.anomaly_type == "subdim")
            & (AnomalyDataOutput.severity > 0)
        )

        results = pd.read_sql(query.statement, query.session.bind)

        # Sorting by distance from drilldown data (ascending) and severity of 
        # anomaly (descending), created distance for this purpose only
        results['distance'] = abs(results['data_datetime'] - pd.to_datetime(drilldown_date))
        results.sort_values(['distance', 'severity'], ascending = [True, False], inplace = True)
        results.drop('distance', axis = 1, inplace = True)

        results = results.iloc[:no_of_graphs]

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
            try: end_date = datetime.strptime(end_date, '%Y-%m-%d %H:%M:%S')
            except:
                end_date = end_date + " 00:00:00"
                end_date = datetime.strptime(end_date, '%Y-%m-%d %H:%M:%S')


    #TODO: caused the non viewing of data post 00:00
    if end_date is None:
        end_date = datetime.today()

    return end_date


# --- defaults --- #

DEFAULT_STATUS: Dict[str, Any] = {
    "anomaly_status": None,
    "last_scheduled_time_anomaly": None,
    "last_scheduled_time_rca": None,
    "rca_status": None,
}


def get_anomaly_end_date(kpi_id: int):
    anomaly_end_date = AnomalyDataOutput.query.filter(
            AnomalyDataOutput.kpi_id == kpi_id
        ).order_by(AnomalyDataOutput.data_datetime.desc()).first()
    
    try:
        anomaly_end_date = anomaly_end_date.as_dict['data_datetime']
    except AttributeError:
        anomaly_end_date = None
    except Exception as err:
        current_app.logger.info(f"Error Found: {err}")

    return anomaly_end_date
