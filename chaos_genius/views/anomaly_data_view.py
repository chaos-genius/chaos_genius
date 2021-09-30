# -*- coding: utf-8 -*-
"""anomaly data view."""
from datetime import datetime, timedelta
import traceback
from typing import Any, Dict, Optional, Tuple, cast

from flask import Blueprint, current_app, jsonify, request
import pandas as pd
from sqlalchemy.orm.attributes import flag_modified

from chaos_genius.extensions import cache
from chaos_genius.connectors.base_connector import get_df_from_db_uri
from chaos_genius.databases.models.anomaly_data_model import AnomalyDataOutput
from chaos_genius.databases.models.rca_data_model import RcaData
from chaos_genius.databases.models.kpi_model import Kpi
from chaos_genius.views.kpi_view import get_kpi_data_from_id

from chaos_genius.core.rca.rca_utils.string_helpers import convert_query_string_to_user_string


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
        data["chart_data"]["title"] = kpi_info["name"]
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
    return jsonify({"data": subdim_graphs, "msg": ""})


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
    return jsonify({"data": data, "msg": msg, "status": status})


@blueprint.route("/anomaly-params/meta-info", methods=["GET"])
def kpi_anomaly_params_meta():
    return jsonify(ANOMALY_PARAMS_META)


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
            "anomaly_params": kpi.as_dict["anomaly_params"],
        })

    # when it's POST, update anomaly params
    current_app.logger.info(f"Updating anomaly parameters for KPI ID: {kpi_id}")

    if not request.is_json:
        return jsonify(
            {"error": "Request body must be a JSON (and Content-Type header must be set correctly)", "status": "failure"}
        ), 400

    req_data: dict = cast(dict, request.get_json())

    if "anomaly_params" not in req_data:
        return jsonify(
            {"error": "The request JSON needs to have anomaly_params as a field", "status": "failure"}
        ), 400

    err, new_anomaly_params = validate_partial_anomaly_params(req_data["anomaly_params"])

    if err != "":
        return jsonify({"error": err, "status": "failure"}), 400

    new_kpi = update_anomaly_params(kpi, new_anomaly_params)

    # we ensure anomaly task is run as soon as analytics is configured
    # we consider anomaly to be configured when the payload has model_name in it
    # otherwise, it's an update of the existing anomaly_params, so we avoid running
    #
    # we also run RCA at the same time
    if "model_name" in new_anomaly_params:
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
        "anomaly_params": new_kpi.as_dict["anomaly_params"],
        "status": "success"
    })


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
    query = AnomalyDataOutput.query.filter(
        (AnomalyDataOutput.kpi_id == kpi_id)
        & (AnomalyDataOutput.data_datetime == drilldown_date)
        & (AnomalyDataOutput.anomaly_type == "subdim")
        & (AnomalyDataOutput.severity > 0)
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


ANOMALY_PARAM_FIELDS = {
    "anomaly_period",
    "model_name",
    "sensitivity",
    "seasonality",
    "frequency",
    "scheduler_params"
}

ANOMALY_PARAMS_META = {
    "name": "anomaly_params",
    "fields": [
        {
            "name": "anomaly_period",
            "is_editable": False,
            "is_sensitive": False,
        },
        {
            "name": "model_name",
            "is_editable": False,
            "is_sensitive": False,
        },
        {
            "name": "sensitivity",
            "is_editable": True,
            "is_sensitive": False,
        },
        {
            "name": "seasonality",
            "is_editable": False,
            "is_sensitive": False,
        },
        {
            "name": "frequency",
            "is_editable": False,
            "is_sensitive": False,
        },
        {
            "name": "scheduler_params",
            "fields": [
                {
                    "name": "time",
                    "is_editable": True,
                    "is_sensitive": False,
                },
            ],
        },
    ],
}

def validate_partial_anomaly_params(anomaly_params: Dict[str, Any]) -> Tuple[str, Dict[str, Any]]:
    """Check if given *partial* anomaly parameters have valid keys and values.

    Returns an error string. Empty string "" means the params are valid.

    Also returns the validated anomaly_params, with some conversions applied. This is undefined
    when the anomaly_params is not valid. The passed anomaly_params is modified in-place.
    """
    fields = ANOMALY_PARAM_FIELDS

    if fields.isdisjoint(set(anomaly_params.keys())):
        # we don't have any of the possible fields
        return f"anomaly_params needs to have one of the following fields: {', '.join(fields)}", {}

    extra_fields = anomaly_params.keys() - fields
    if extra_fields:
        # some unexpected fields. Return an explicit error instead of ignoring them.
        return (
            f"Got extra fields in anomaly_params: {', '.join(extra_fields)}",
            {k: v for k, v in anomaly_params.items() if k in fields}
        )

    # validate values of available fields
    # maybe there's declarative way to do this?

    # see the returned error messages for validations performed

    if "anomaly_period" in anomaly_params:
        anomaly_period = anomaly_params["anomaly_period"]

        if not isinstance(anomaly_period, int):
            return (
                f"anomaly_period must be an integer number. Got: {repr(anomaly_period)}"
                f" (of type: {type(anomaly_period).__name__})",
                anomaly_params
            )

    frequency_types = {"daily", "hourly"}
    if "frequency" in anomaly_params:
        frequency = anomaly_params["frequency"]

        if not isinstance(frequency, str):
            return (
                f"frequency must be a string, one of: {', '.join(frequency_types)}. Got: {frequency}",
                anomaly_params)

        # we compare (and store) only lower case for this field
        frequency = frequency.lower()
        anomaly_params["frequency"] = frequency

        if frequency not in frequency_types:
            return (
                f"frequency must be one of: {', '.join(frequency_types)}. Got: {frequency}",
                anomaly_params
            )

    sensitivity_types = {"high", "low", "medium"}
    if "sensitivity" in anomaly_params:
        sensitivity = anomaly_params["sensitivity"]

        if not isinstance(sensitivity, str):
            return (
                f"sensitivity must be a string, one of: {', '.join(sensitivity_types)}. Got: {sensitivity}",
                anomaly_params)

        # we compare (and store) only lower case for this field
        sensitivity = sensitivity.lower()
        anomaly_params["sensitivity"] = sensitivity

        if sensitivity not in sensitivity_types:
            return (
                f"sensitivity must be one of: {', '.join(sensitivity_types)}. Got: {sensitivity}",
                anomaly_params
            )

    if "seasonality" in anomaly_params:
        seasonality = anomaly_params["seasonality"]

        if not isinstance(seasonality, list):
            return f"seasonality must be a list. Got: {repr(seasonality)}", anomaly_params

        seasonality_types = {"D", "M", "W"}
        for s in seasonality:

            if not isinstance(s, str):
                return (
                    f"All of the seasonalities must be a string, one of: {', '.join(seasonality_types)}. One of them was: {s}",
                    anomaly_params)

            # no lower case for this since the expecetd values are upper case

            if s not in seasonality_types:
                return (
                    f"All of the seasonalities must one one of: {', '.join(seasonality_types)}. "
                    f"One of them was: {s}",
                    anomaly_params
                )

    if "scheduler_params" in anomaly_params:
        err, scheduler_params = validate_partial_scheduler_params(anomaly_params["scheduler_params"])
        if err != "":
            return err, anomaly_params
        anomaly_params["scheduler_params"] = scheduler_params

    return "", anomaly_params


def update_anomaly_params(kpi: Kpi, new_anomaly_params: Dict[str, Any], run_anomaly=True) -> Kpi:
    """Update anomaly_params for the kpi with the given *partial* *validated* anomaly parameters.

    The new_anomaly_params must be validated using validate_partial_anomaly_params.

    run_anomaly is also set to True in the Kpi table, by default.
    """
    fields = ANOMALY_PARAM_FIELDS

    anomaly_params: dict = kpi.anomaly_params

    # TODO: check if fields are marked as non-editable

    # update the non-nested fields directly
    # currently the only nested field is scheduler_params
    for field in (fields - {"scheduler_params"}) & new_anomaly_params.keys():
        anomaly_params[field] = new_anomaly_params[field]

    if "scheduler_params" in new_anomaly_params:
        scheduler_params: Optional[dict] = anomaly_params["scheduler_params"]

        if scheduler_params is None:
            scheduler_params = {}

        # TODO: check for fields that might be used by the celery scheduler.
        #       we should not let those be changed from the API.
        scheduler_params.update(new_anomaly_params["scheduler_params"])

        anomaly_params["scheduler_params"] = scheduler_params

    flag_modified(kpi, "anomaly_params")
    new_kpi = cast(Kpi, kpi.update(commit=True, anomaly_params=anomaly_params, run_anomaly=run_anomaly))

    return new_kpi


SCHEDULER_PARAM_FIELDS = {"hour"}


def validate_partial_scheduler_params(scheduler_params: Dict[str, Any]) -> Tuple[str, Dict[str, Any]]:
    """Check if the given *partial* scheduler params have valid keys and values.

    see validate_partial_anomaly_params for return value meaning.
    """
    if "time" in scheduler_params:
        time = scheduler_params["time"]

        if not isinstance(time, str):
            return f"time must be a string. Got: {type(time).__name__}", scheduler_params

        times = time.split(":")

        err_msg = "time must be in the format HH:MM:SS"

        if len(times) != 3:
            return f"{err_msg}. Got: {time}", scheduler_params

        hour, minute, second = times

        if not hour.isdigit() or not minute.isdigit() or not second.isdigit():
            return (
                f"hour, minute, second must be numbers. Got: {hour}, {minute}, {second}",
                scheduler_params
            )

        hour = int(hour)

        if hour < 0 or hour > 23:
            return (f"hour must be between 0 and 23 (inclusive). Got: {hour}", scheduler_params)

        minute, second = int(minute), int(second)

        if minute < 0 or minute > 60:
            return (f"minute must be between 0 and 60 (inclusive). Got: {minute}", scheduler_params)

        if second < 0 or second > 60:
            return (f"second must be between 0 and 60 (inclusive). Got: {second}", scheduler_params)

    return "", scheduler_params


@blueprint.route("/<int:kpi_id>/settings", methods=["GET"])
# @cache.memoize(timeout=30000)
def anomaly_settings_status(kpi_id):
    current_app.logger.info(f"Retreiving anomaly settings for kpi: {kpi_id}")
    data = None
    try:
        kpi_info = get_kpi_data_from_id(kpi_id)
        data = kpi_info.get('anomaly_params')
    except ValueError:
        current_app.logger.info(f"No KPI with id: {kpi_id} exists")
    except Exception as err:
        print(traceback.format_exc())
        current_app.logger.info(f"Error Found: {err}")

    if data is None:
        response = DEFAULT_ANOMALY_PARAMS.copy()
    else:
        #FIXME: temporary sanitation
        if 'period' in data:
            data['anomaly_period'] = data['period']
            data.pop('period')

        if 'ts_frequency' in data:
            data['frequency'] = data['ts_frequency']
            data.pop('ts_frequency')

        response = DEFAULT_ANOMALY_PARAMS.copy()
        response.update(data)
        response['scheduler_params'] = DEFAULT_SCHEDULER_PARAMS.copy()
        response['scheduler_params'].update(data['scheduler_params'])
        response['is_anomaly_setup'] = True

    rca_data = RcaData.query.filter(
        RcaData.kpi_id == kpi_id
    ).all()
    if len(rca_data) == 0:
        is_precomputed = False
    else:
        is_precomputed = True
    response["is_rca_precomputed"] = is_precomputed

    current_app.logger.info(f"Anomaly settings retrieved for kpi: {kpi_id}")
    return jsonify(response)


DEFAULT_SCHEDULER_PARAMS = {
    "anomaly_status": None,
    "last_scheduled_time": None,
    "rca_status": None,
    "time": None
  }

DEFAULT_ANOMALY_PARAMS = {
  "anomaly_period": None,
  "frequency": None,
  "model_name": None,
  "scheduler_params": DEFAULT_SCHEDULER_PARAMS,
  "seasonality": [],
  "sensitivity": None,
  "is_anomaly_setup": False
}
