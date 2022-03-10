# -*- coding: utf-8 -*-
"""anomaly data view."""
from datetime import date, datetime, timedelta
import time
from typing import Any, Dict, List, Optional, Tuple, cast

from flask import Blueprint, current_app, jsonify, request
from sqlalchemy import func, delete
import pandas as pd
from sqlalchemy.orm.attributes import flag_modified
from chaos_genius.core.anomaly.constants import MODEL_NAME_MAPPING
from chaos_genius.core.utils.round import round_number
from chaos_genius.settings import (
    TOP_DIMENSIONS_FOR_ANOMALY_DRILLDOWN,
    TOP_SUBDIMENSIONS_FOR_ANOMALY,
)

from chaos_genius.extensions import db
from chaos_genius.databases.models.anomaly_data_model import AnomalyDataOutput
from chaos_genius.databases.models.rca_data_model import RcaData
from chaos_genius.databases.models.kpi_model import Kpi
from chaos_genius.controllers.kpi_controller import get_kpi_data_from_id

from chaos_genius.core.rca.rca_utils.string_helpers import (
    convert_query_string_to_user_string,
)
from chaos_genius.utils.datetime_helper import (
    get_datetime_string_with_tz,
    get_lastscan_string_with_tz,
)


blueprint = Blueprint("anomaly_data", __name__)


@blueprint.route("/", methods=["GET"])  # TODO: Remove this
@blueprint.route("", methods=["GET"])
def list_anomaly_data():
    # FIXME: Update home route
    return jsonify({"data": "Hello World!"})


@blueprint.route("/<int:kpi_id>/anomaly-detection", methods=["GET"])
def kpi_anomaly_detection(kpi_id):
    current_app.logger.info(f"Anomaly Detection Started for KPI ID: {kpi_id}")
    data = []
    end_date = None
    try:
        kpi_info = get_kpi_data_from_id(kpi_id)
        period = kpi_info["anomaly_params"]["anomaly_period"]
        hourly = kpi_info["anomaly_params"]["frequency"] == "H"

        end_date = get_anomaly_output_end_date(kpi_info)

        anom_data = get_overall_data(kpi_id, end_date, period)

        anom_data["x_axis_limits"] = get_anomaly_graph_x_lims(end_date, period, hourly)

        data = {
            "chart_data": anom_data,
            # TODO: base_anomaly_id not needed anymore
            # remove from here once updated in frontend
            "base_anomaly_id": kpi_id,
        }
        data["chart_data"]["title"] = kpi_info["name"]
        current_app.logger.info(f"Anomaly DD Retrieval Completed for KPI ID: {kpi_id}")

        end_date = get_datetime_string_with_tz(end_date, hourly)
        anomaly_last_scan = get_lastscan_string_with_tz(
            kpi_info["scheduler_params"]["last_scheduled_time_anomaly"]
        )

    except:  # noqa: E722
        current_app.logger.error("Error in Anomaly Overall Retrieval", exc_info=1)

    return jsonify(
        {
            "data": data,
            "msg": "",
            "anomaly_end_date": end_date,
            "last_run_time_anomaly": anomaly_last_scan,
        }
    )


@blueprint.route("/<int:kpi_id>/anomaly-drilldown", methods=["GET"])
def kpi_anomaly_drilldown(kpi_id):
    current_app.logger.info(f"Anomaly Drilldown Started for KPI ID: {kpi_id}")
    subdim_graphs = []
    end_date = None
    try:

        drilldown_date = request.args.get("date")
        if drilldown_date is None:
            raise ValueError("date param is required.")

        drilldown_date = pd.to_datetime(drilldown_date, unit="ms")

        subdims = get_drilldowns_series_type(kpi_id, drilldown_date)

        kpi_info = get_kpi_data_from_id(kpi_id)
        period = kpi_info["anomaly_params"]["anomaly_period"]
        hourly = kpi_info["anomaly_params"]["frequency"] == "H"

        end_date = get_anomaly_output_end_date(kpi_info)

        graph_xlims = get_anomaly_graph_x_lims(end_date, period, hourly)

        for subdim in subdims:
            anom_data = get_dq_and_subdim_data(
                kpi_id, end_date, "subdim", subdim, period
            )
            anom_data["x_axis_limits"] = graph_xlims
            subdim_graphs.append(anom_data)
        current_app.logger.info(f"Anomaly DD Retrieval Completed for KPI ID: {kpi_id}")

    except:  # noqa: E722
        current_app.logger.error("Error in Anomaly DD Retrieval", exc_info=1)

    return jsonify({"data": subdim_graphs, "msg": ""})


@blueprint.route("/<int:kpi_id>/anomaly-data-quality", methods=["GET"])
def kpi_anomaly_data_quality(kpi_id):
    current_app.logger.info(f"Anomaly Drilldown Started for KPI ID: {kpi_id}")

    data = []
    end_date = None
    try:
        kpi_info = get_kpi_data_from_id(kpi_id)
        period = kpi_info["anomaly_params"]["anomaly_period"]
        hourly = kpi_info["anomaly_params"]["frequency"] == "H"

        end_date = get_anomaly_output_end_date(kpi_info)

        graph_xlims = get_anomaly_graph_x_lims(end_date, period, hourly)

        agg = kpi_info["aggregation"]
        dq_list = ["max", "count", "mean"] if agg != "mean" else ["max", "count"]
        for dq in dq_list:
            anom_data = get_dq_and_subdim_data(kpi_id, end_date, "dq", dq, period)
            anom_data["x_axis_limits"] = graph_xlims
            if anom_data["values"] != []:
                data.append(anom_data)

        current_app.logger.info(f"Anomaly DQ Retrieval Completed for KPI ID: {kpi_id}")

    except:  # noqa: E722
        current_app.logger.error("Error in Anomaly DQ Retrieval: {err}", exc_info=1)

    return jsonify({"data": data, "msg": ""})


@blueprint.route("/<int:kpi_id>/subdim-anomaly", methods=["GET"])
def kpi_subdim_anomaly(kpi_id):
    current_app.logger.info(f"Subdimension Anomaly Started for KPI ID: {kpi_id}")
    subdim_graphs = []
    end_date = None
    try:
        kpi_info = get_kpi_data_from_id(kpi_id)
        period = kpi_info["anomaly_params"]["anomaly_period"]
        hourly = kpi_info["anomaly_params"]["frequency"] == "H"

        end_date = get_anomaly_output_end_date(kpi_info)
        graph_xlims = get_anomaly_graph_x_lims(end_date, period, hourly)
        if hourly:
            # Use a 24 hour window to find peak severity per subdim and rank in descending order
            start_date = end_date - timedelta(hours=23)
            query = (
                db.session.query(
                    AnomalyDataOutput.series_type,
                    func.max(AnomalyDataOutput.severity),
                )
                .filter(
                    (AnomalyDataOutput.kpi_id == kpi_id)
                    & (AnomalyDataOutput.data_datetime >= start_date)
                    & (AnomalyDataOutput.data_datetime <= end_date)
                    & (AnomalyDataOutput.anomaly_type == "subdim")
                    & (AnomalyDataOutput.is_anomaly != 0)
                )
                .group_by(AnomalyDataOutput.series_type)
                .order_by(func.max(AnomalyDataOutput.severity).desc())
                .limit(TOP_SUBDIMENSIONS_FOR_ANOMALY)
            )

        else:
            query = (
                AnomalyDataOutput.query.filter(
                    (AnomalyDataOutput.kpi_id == kpi_id)
                    & (AnomalyDataOutput.data_datetime == end_date)
                    & (AnomalyDataOutput.anomaly_type == "subdim")
                    & (AnomalyDataOutput.is_anomaly != 0)
                )
                .order_by(AnomalyDataOutput.severity.desc())
                .limit(TOP_SUBDIMENSIONS_FOR_ANOMALY)
            )
        results = pd.read_sql(query.statement, query.session.bind)

        if len(results) == 0:
            end_date_str = ""
            current_app.logger.error("No Subdimension Anomaly Found", exc_info=1)
        else:
            end_date_str = get_datetime_string_with_tz(end_date, hourly)

        subdims = results.series_type
        for subdim in subdims:
            anom_data = get_dq_and_subdim_data(
                kpi_id, end_date, "subdim", subdim, period
            )
            anom_data["x_axis_limits"] = graph_xlims
            subdim_graphs.append(anom_data)
        current_app.logger.info(
            f"Subdimension Anomaly Retrieval Completed for KPI ID: {kpi_id}"
        )

        anomaly_last_scan = get_lastscan_string_with_tz(
            kpi_info["scheduler_params"]["last_scheduled_time_anomaly"]
        )

    except:  # noqa: E722
        current_app.logger.error("Error in Subdimension Anomaly Retrieval", exc_info=1)

    return jsonify(
        {
            "data": subdim_graphs,
            "msg": "",
            "anomaly_end_date": end_date_str,
            "last_run_time_anomaly": anomaly_last_scan,
        }
    )


@blueprint.route("/anomaly-params/meta-info", methods=["GET"])
def kpi_anomaly_params_meta():
    # TODO: Move this dict into the corresponding data model
    return jsonify(ANOMALY_PARAMS_META)


@blueprint.route("/<int:kpi_id>/anomaly-params", methods=["POST", "GET"])
def kpi_anomaly_params(kpi_id: int):
    kpi = cast(Kpi, Kpi.get_by_id(kpi_id))

    if kpi is None:
        return (
            jsonify(
                {"error": f"Could not find KPI for ID: {kpi_id}", "status": "failure"}
            ),
            400,
        )

    # when method is GET we just return the anomaly params
    if request.method == "GET":
        return jsonify(
            {
                "anomaly_params": get_anomaly_params_dict(kpi),
            }
        )

    # when it's POST, update anomaly params

    # check if this is first time anomaly setup or edit config
    is_first_time = kpi.anomaly_params is None

    if is_first_time:
        current_app.logger.info(f"Adding anomaly parameters for KPI ID: {kpi_id}")
    else:
        current_app.logger.info(
            f"Updating existing anomaly parameters for KPI ID: {kpi_id}"
        )

    if not request.is_json:
        return (
            jsonify(
                {
                    "error": "Request body must be a JSON (and Content-Type header must be set correctly)",
                    "status": "failure",
                }
            ),
            400,
        )

    req_data: dict = cast(dict, request.get_json())

    if "anomaly_params" not in req_data:
        return (
            jsonify(
                {
                    "error": "The request JSON needs to have anomaly_params as a field",
                    "status": "failure",
                }
            ),
            400,
        )

    err, new_anomaly_params = validate_partial_anomaly_params(
        req_data["anomaly_params"]
    )

    if err != "":
        return jsonify({"error": err, "status": "failure"}), 400

    err, new_kpi = update_anomaly_params(
        kpi, new_anomaly_params, check_editable=not is_first_time
    )

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

    return jsonify({"msg": "Successfully updated Anomaly params", "status": "success"})


@blueprint.route("/<int:kpi_id>/settings", methods=["GET"])
def anomaly_settings_status(kpi_id):
    current_app.logger.info(f"Retrieving anomaly settings for kpi: {kpi_id}")
    kpi = cast(Kpi, Kpi.get_by_id(kpi_id))

    if kpi is None:
        return (
            jsonify(
                {"error": f"Could not find KPI for ID: {kpi_id}", "status": "failure"}
            ),
            400,
        )

    response = DEFAULT_STATUS.copy()
    response["kpi_id"] = kpi_id

    if kpi.scheduler_params is not None:
        response.update(
            {k: v for k, v in kpi.scheduler_params.items() if k in DEFAULT_STATUS}
        )

    response["is_anomaly_setup"] = kpi.anomaly_params is not None

    num_rca_data = RcaData.query.filter(RcaData.kpi_id == kpi_id).count()

    response["is_rca_precomputed"] = num_rca_data != 0

    anomaly_data = AnomalyDataOutput.query.filter(
        (AnomalyDataOutput.kpi_id == kpi_id) & (AnomalyDataOutput.anomaly_type == "overall")
    ).count()
    response["is_anomaly_precomputed"] = anomaly_data != 0

    current_app.logger.info(f"Anomaly settings retrieved for kpi: {kpi_id}")
    return jsonify(response)


@blueprint.route("/<int:kpi_id>/retrain", methods=["POST", "GET"])
def kpi_anomaly_retraining(kpi_id):
    # TODO: Move the deletion into KPI controller file
    # delete all data in anomaly output table
    delete_kpi_query = delete(AnomalyDataOutput).where(AnomalyDataOutput.kpi_id == kpi_id)
    db.session.execute(delete_kpi_query)
    db.session.commit()

    # add anomaly to queue
    from chaos_genius.jobs.anomaly_tasks import ready_anomaly_task
    anomaly_task = ready_anomaly_task(kpi_id)
    if anomaly_task is not None:
        anomaly_task.apply_async()
        current_app.logger.info(f"Retraining started for KPI ID: {kpi_id}")
        return jsonify({"msg" : f"retraining started for KPI: {kpi_id}"})
    else:
        return jsonify({"msg" : f"retraining failed for KPI: {kpi_id}, KPI id is None"})


def fill_graph_data(row, graph_data):
    """Fills graph_data with intervals, values, and predicted_values for
    a given row.
    :param row: A single row from the anomaly dataframe
    :type row: pandas.core.series.Series
    :param graph_data: Dictionary object with the current graph
    :type graph_data: Dict
    """
    # Do not include rows where there is no data
    if row.notna()["y"]:
        # Convert to milliseconds for HighCharts
        timestamp = row["data_datetime"].timestamp() * 1000

        # Create and append a point for the interval
        interval = [
            timestamp,
            round_number(row["yhat_lower"]),
            round_number(row["yhat_upper"]),
        ]
        graph_data["intervals"].append(interval)

        # Create and append a point for the value
        value = [timestamp, round_number(row["y"])]
        graph_data["values"].append(value)

        # Create and append a point for the severity
        severity = [timestamp, round_number(row["severity"])]
        graph_data["severity"].append(severity)


def convert_to_graph_json(
    results,
    kpi_id,
    anomaly_type="overall",
    series_type=None,
):
    kpi_info = get_kpi_data_from_id(kpi_id)

    if anomaly_type == "overall":
        title = kpi_info["name"]
    elif anomaly_type == "subdim":
        title = convert_query_string_to_user_string(series_type)
    else:
        title = series_type.title()

    kpi_name = kpi_info["metric"]
    graph_data = {
        "title": title,
        "y_axis_label": kpi_name,
        "x_axis_label": "Datetime",
        "sub_dimension": anomaly_type,
        "intervals": [],
        "values": [],
        "severity": [],
    }

    results.apply(lambda row: fill_graph_data(row, graph_data), axis=1)

    return graph_data


def get_overall_data(kpi_id, end_date: datetime, n=90):
    start_date = end_date - timedelta(days=n)
    start_date = start_date.strftime("%Y-%m-%d %H:%M:%S")
    end_date = end_date.strftime("%Y-%m-%d %H:%M:%S")

    # TODO: Add the series type filter
    query = AnomalyDataOutput.query.filter(
        (AnomalyDataOutput.kpi_id == kpi_id)
        & (AnomalyDataOutput.data_datetime <= end_date)
        & (AnomalyDataOutput.data_datetime >= start_date)
        & (AnomalyDataOutput.anomaly_type == "overall")
    ).order_by(AnomalyDataOutput.data_datetime)

    results = pd.read_sql(query.statement, query.session.bind)

    return convert_to_graph_json(results, kpi_id, "overall", None)


def get_dq_and_subdim_data(
    kpi_id, end_date, anomaly_type="dq", series_type="max", n=90
):
    start_date = pd.to_datetime(end_date) - timedelta(days=n)
    start_date = start_date.strftime("%Y-%m-%d %H:%M:%S")
    end_date = end_date.strftime("%Y-%m-%d %H:%M:%S")

    query = AnomalyDataOutput.query.filter(
        (AnomalyDataOutput.kpi_id == kpi_id)
        & (AnomalyDataOutput.data_datetime <= end_date)
        & (AnomalyDataOutput.data_datetime >= start_date)
        & (AnomalyDataOutput.anomaly_type == anomaly_type)
        & (AnomalyDataOutput.series_type == series_type)
    ).order_by(AnomalyDataOutput.data_datetime)

    results = pd.read_sql(query.statement, query.session.bind)

    return convert_to_graph_json(results, kpi_id, anomaly_type, series_type)


def get_drilldowns_series_type(kpi_id, drilldown_date):
    # First we get direction of anomaly
    # Then we get relevant subdims for that anomaly
    # TODO: Add the series type filter
    is_anomaly = (
        AnomalyDataOutput.query.filter(
            (AnomalyDataOutput.kpi_id == kpi_id)
            & (AnomalyDataOutput.data_datetime == drilldown_date)
            & (AnomalyDataOutput.anomaly_type == "overall")
        )
        .first()
        .is_anomaly
    )

    if is_anomaly == 0:
        raise ValueError(f"No anomaly found for date {drilldown_date}")

    query = (
        AnomalyDataOutput.query.filter(
            (AnomalyDataOutput.kpi_id == kpi_id)
            & (AnomalyDataOutput.data_datetime == drilldown_date)
            & (AnomalyDataOutput.anomaly_type == "subdim")
            & (AnomalyDataOutput.is_anomaly == is_anomaly)
        )
        .order_by(AnomalyDataOutput.severity.desc())
        .limit(TOP_DIMENSIONS_FOR_ANOMALY_DRILLDOWN)
    )

    results = pd.read_sql(query.statement, query.session.bind)
    if len(results) == 0:
        start_date = drilldown_date - timedelta(days=1)
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
        results["distance"] = abs(
            results["data_datetime"] - pd.to_datetime(drilldown_date)
        )
        results.sort_values(
            ["distance", "severity"], ascending=[True, False], inplace=True
        )
        results.drop("distance", axis=1, inplace=True)

        results = results.iloc[:TOP_DIMENSIONS_FOR_ANOMALY_DRILLDOWN]

    return results.series_type


def get_anomaly_output_end_date(kpi_info: dict) -> datetime:
    """Checks if the KPI has a static end date and returns it. Otherwise it tries to get
    end date of overall anomaly detection, and will finally return today's date if that
    is also not found.
    :return: end date for use with anomaly data output
    :rtype: datetime
    """

    end_date = None

    if kpi_info["is_static"]:
        end_date = kpi_info.get("static_params", {}).get("end_date", None)
        if end_date is not None:
            try:
                end_date = datetime.strptime(end_date, "%Y-%m-%d %H:%M:%S")
            except:  # noqa E722
                end_date = end_date + " 00:00:00"
                end_date = datetime.strptime(end_date, "%Y-%m-%d %H:%M:%S")

    hourly = kpi_info["anomaly_params"]["frequency"] == "H"

    # TODO: caused the non viewing of data post 00:00
    if end_date is None:
        end_date = get_anomaly_end_date(kpi_info["id"], hourly=hourly)

    if end_date is None:
        end_date = datetime.today()

    if not hourly:
        end_date = pd.to_datetime(end_date.date())
    else:
        end_date = pd.to_datetime(end_date)

    return end_date.to_pydatetime()


# --- anomaly params meta information --- #
ANOMALY_PARAMS_META = {
    "name": "anomaly_params",
    "fields": [
        {
            "name": "anomaly_period",
            "is_editable": False,
            "is_sensitive": False,
            "type": "integer",
        },
        {
            "name": "model_name",
            "is_editable": False,
            "is_sensitive": False,
            "type": "select",
            "options": [
                {
                    "value": key,
                    "name": value,
                }
                for key, value in MODEL_NAME_MAPPING.items()
            ],
        },
        {
            "name": "sensitivity",
            "is_editable": True,
            "is_sensitive": False,
            "type": "select",
            "options": [
                {
                    "value": "high",
                    "name": "High",
                },
                {
                    "value": "medium",
                    "name": "Medium",
                },
                {
                    "value": "low",
                    "name": "Low",
                },
            ],
        },
        {
            "name": "seasonality",
            "is_editable": False,
            "is_sensitive": False,
            "type": "multiselect",
            "options": [
                {
                    "value": "M",
                    "name": "Monthly",
                },
                {
                    "value": "W",
                    "name": "Weekly",
                },
                {
                    "value": "D",
                    "name": "Daily",
                },
            ],
        },
        {
            "name": "frequency",
            "is_editable": False,
            "is_sensitive": False,
            "type": "select",
            "options": [
                {
                    "value": "D",
                    "name": "Daily",
                },
                {
                    "value": "H",
                    "name": "Hourly",
                },
            ],
        },
        {
            "name": "scheduler_params_time",
            "is_editable": True,
            "is_sensitive": False,
            "type": "time",
        },
        {
            "name": "scheduler_frequency",
            "is_editable": False,
            "is_sensitive": False,
            "type": "select",
            "options": [
                {
                    "value": "D",
                    "name": "Daily",
                },
                {
                    "value": "H",
                    "name": "Hourly",
                },
            ],
        },
    ],
}


ANOMALY_PARAM_FIELDS = {
    "anomaly_period",
    "model_name",
    "sensitivity",
    "seasonality",
    "frequency",
    "scheduler_params_time",
    "scheduler_frequency",
    "run_optional",
}


DEFAULT_ANOMALY_PARAMS = {
    "anomaly_period": None,
    "frequency": None,
    "model_name": None,
    "seasonality": [],
    "sensitivity": None,
    # scheduler params
    "scheduler_params_time": "11:00:00",
    "scheduler_frequency": "D",
}


DEFAULT_STATUS: Dict[str, Any] = {
    "anomaly_status": None,
    "last_scheduled_time_anomaly": None,
    "last_scheduled_time_rca": None,
    "rca_status": None,
    "kpi_id": None,
}


# --- anomaly params helper functions --- #
# TODO: move default, meta and anomaly_params helpers to a class?


def anomaly_params_field_is_editable(field_name: str):
    for field in ANOMALY_PARAMS_META["fields"]:
        if field["name"] == field_name:
            return field["is_editable"]

    return True


def validate_partial_anomaly_params(
    anomaly_params: Dict[str, Any]
) -> Tuple[str, Dict[str, Any]]:
    """Check if given *partial* anomaly parameters have valid keys and values.
    Returns an error string. Empty string "" means the params are valid.
    Also returns the validated anomaly_params, with some conversions applied. This is undefined
    when the anomaly_params is not valid. The passed anomaly_params is modified in-place.
    """
    fields = ANOMALY_PARAM_FIELDS

    if fields.isdisjoint(set(anomaly_params.keys())):
        # we don't have any of the possible fields
        return (
            f"anomaly_params needs to have one of the following fields: {', '.join(fields)}",
            {},
        )

    extra_fields = anomaly_params.keys() - fields
    if extra_fields:
        # some unexpected fields. Return an explicit error instead of ignoring them.
        return (
            f"Got extra fields in anomaly_params: {', '.join(extra_fields)}",
            {k: v for k, v in anomaly_params.items() if k in fields},
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
                anomaly_params,
            )

    def validate_frequency(frequency, field_name, frequency_types={"D", "H"}):
        if not isinstance(frequency, str):
            return (
                f"{field_name} must be a string, one of: {', '.join(frequency_types)}. Got: {frequency}",
                anomaly_params,
            )

        anomaly_params[field_name] = frequency

        if frequency not in frequency_types:
            return (
                f"{field_name} must be one of: {', '.join(frequency_types)}. Got: {frequency}",
                anomaly_params,
            )

        return "", anomaly_params

    if "frequency" in anomaly_params:
        frequency = anomaly_params["frequency"]

        err, anomaly_params = validate_frequency(frequency, "frequency")

        if err != "":
            return err, anomaly_params

    if "scheduler_frequency" in anomaly_params:
        frequency = anomaly_params["scheduler_frequency"]

        err, anomaly_params = validate_frequency(
            frequency, "scheduler_frequency", {"D", "H"}
        )

        if err != "":
            return err, anomaly_params

    sensitivity_types = {"high", "low", "medium"}
    if "sensitivity" in anomaly_params:
        sensitivity = anomaly_params["sensitivity"]

        if not isinstance(sensitivity, str):
            return (
                f"sensitivity must be a string, one of: {', '.join(sensitivity_types)}. Got: {sensitivity}",
                anomaly_params,
            )

        # we compare (and store) only lower case for this field
        sensitivity = sensitivity.lower()
        anomaly_params["sensitivity"] = sensitivity

        if sensitivity not in sensitivity_types:
            return (
                f"sensitivity must be one of: {', '.join(sensitivity_types)}. Got: {sensitivity}",
                anomaly_params,
            )

    if "seasonality" in anomaly_params:
        seasonality = anomaly_params["seasonality"]

        if not isinstance(seasonality, list):
            return (
                f"seasonality must be a list. Got: {repr(seasonality)}",
                anomaly_params,
            )

        seasonality_types = {"D", "M", "W"}
        for s in seasonality:

            if not isinstance(s, str):
                return (
                    f"All of the seasonalities must be a string, one of: {', '.join(seasonality_types)}. One of them was: {s}",
                    anomaly_params,
                )

            # no lower case for this since the expecetd values are upper case

            if s not in seasonality_types:
                return (
                    f"All of the seasonalities must one one of: {', '.join(seasonality_types)}. "
                    f"One of them was: {s}",
                    anomaly_params,
                )

    if "scheduler_params_time" in anomaly_params:
        err, time = validate_scheduled_time(anomaly_params["scheduler_params_time"])

        if err != "":
            return err, anomaly_params

        anomaly_params["scheduler_params_time"] = time

    if "run_optional" in anomaly_params:
        run_optional = anomaly_params["run_optional"]
        if not isinstance(run_optional, dict):
            err = (
                "The run_optional parameter must be a dictionary."
                f"Got {repr(run_optional)}"
            )
            return err, anomaly_params

        run_optional_types = {"overall", "subdim", "data_quality"}

        for option, choice in run_optional.items():
            if option not in run_optional_types:
                err = (
                    "Optional choices must be one of: "
                    f"{', '.join(run_optional_types)}. One of them was: "
                    f"{option}"
                )
                return err, anomaly_params
            if not isinstance(choice, bool):

                err = (
                    "Optional choice values must be of boolean type. The "
                    f"{repr(option)} field is not a boolean value"
                )

                return err, anomaly_params

    return "", anomaly_params


def check_dimensions(kpi: Kpi) -> bool:
    return kpi.dimensions is not None and kpi.dimensions


def update_anomaly_params(
    kpi: Kpi, new_anomaly_params: Dict[str, Any], run_anomaly=True, check_editable=False
) -> Tuple[str, Kpi]:
    """Update anomaly_params for the kpi with the given *partial* *validated* anomaly parameters.
    The new_anomaly_params must be validated using validate_partial_anomaly_params.
    run_anomaly is also set to True in the Kpi table, by default.
    If check_editable is set to True, only the editable fields are allowed to be updated.
    """
    fields = ANOMALY_PARAM_FIELDS

    anomaly_params: dict = kpi.anomaly_params or {}

    def is_editable(field_name: str, old_val, new_val):
        if not check_editable:
            return ""

        if not anomaly_params_field_is_editable(field_name):
            if old_val != new_val:
                return f"{field_name} is not editable. Old value: {old_val}, New value: {new_val}"

        return ""

    # update the non-nested fields directly
    # currently the only nested field is scheduler_params
    for field in (
        fields - {"scheduler_params_time", "scheduler_frequency"}
    ) & new_anomaly_params.keys():
        err = is_editable(field, anomaly_params.get(field), new_anomaly_params[field])
        if err != "":
            return err, kpi

        anomaly_params[field] = new_anomaly_params[field]

    if "scheduler_params_time" in new_anomaly_params:
        # TODO: use JSONB functions to update these, to avoid data races
        scheduler_params: Optional[dict] = kpi.scheduler_params

        if scheduler_params is None:
            scheduler_params = {}

        err = is_editable(
            "scheduler_params_time",
            scheduler_params.get("time"),
            new_anomaly_params["scheduler_params_time"],
        )
        if err != "":
            return err, kpi

        scheduler_params["time"] = new_anomaly_params["scheduler_params_time"]

        kpi.scheduler_params = scheduler_params
        flag_modified(kpi, "scheduler_params")

    if "scheduler_frequency" in new_anomaly_params:
        # TODO: use JSONB functions to update these, to avoid data races
        scheduler_params: Optional[dict] = kpi.scheduler_params

        if scheduler_params is None:
            scheduler_params = {}

        err = is_editable(
            "scheduler_frequency",
            scheduler_params.get("scheduler_frequency"),
            new_anomaly_params["scheduler_frequency"],
        )
        if err != "":
            return err, kpi

        scheduler_params["scheduler_frequency"] = new_anomaly_params[
            "scheduler_frequency"
        ]

        kpi.scheduler_params = scheduler_params
        flag_modified(kpi, "scheduler_params")

    if not check_dimensions(kpi):
        anomaly_params["run_optional"] = {
            "data_quality": True,
            "overall": True,
            "subdim": False,
        }

    flag_modified(kpi, "anomaly_params")
    new_kpi = cast(
        Kpi,
        kpi.update(commit=True, anomaly_params=anomaly_params, run_anomaly=run_anomaly),
    )

    return "", new_kpi


def get_anomaly_params_dict(kpi: Kpi):
    anomaly_params = DEFAULT_ANOMALY_PARAMS.copy()

    if kpi.anomaly_params is None:
        return anomaly_params

    kpi_dict = kpi.as_dict

    anomaly_params_db = kpi_dict["anomaly_params"]
    scheduler_params_db = kpi_dict.get("scheduler_params")

    # FIXME: temporary sanitation
    if "period" in anomaly_params_db and "anomaly_period" not in anomaly_params_db:
        anomaly_params_db["anomaly_period"] = anomaly_params_db["period"]
    if "ts_frequency" in anomaly_params_db and "frequency" not in anomaly_params_db:
        anomaly_params_db["frequency"] = anomaly_params_db["ts_frequency"]

    anomaly_params.update(
        {k: v for k, v in anomaly_params_db.items() if k in ANOMALY_PARAM_FIELDS}
    )

    if scheduler_params_db is not None:
        anomaly_params.update(
            {k: v for k, v in scheduler_params_db.items() if k in ANOMALY_PARAM_FIELDS}
        )

        anomaly_params["scheduler_params_time"] = scheduler_params_db.get(
            "time", DEFAULT_ANOMALY_PARAMS["scheduler_params_time"]
        )

    return anomaly_params


def validate_scheduled_time(time):
    if not isinstance(time, str):
        return f"time must be a string. Got: {type(time).__name__}", time

    times = time.split(":")

    err_msg = "time must be in the format HH:MM:SS"

    if len(times) != 3:
        return f"{err_msg}. Got: {time}", time

    hour, minute, second = times

    if not hour.isdigit() or not minute.isdigit() or not second.isdigit():
        return (
            f"hour, minute, second must be numbers. Got: {hour}, {minute}, {second}",
            time,
        )

    hour = int(hour)

    if hour < 0 or hour > 23:
        return (f"hour must be between 0 and 23 (inclusive). Got: {hour}", time)

    minute, second = int(minute), int(second)

    if minute < 0 or minute > 60:
        return (f"minute must be between 0 and 60 (inclusive). Got: {minute}", time)

    if second < 0 or second > 60:
        return (f"second must be between 0 and 60 (inclusive). Got: {second}", time)

    return "", time


def get_anomaly_end_date(kpi_id: int, hourly: bool) -> datetime:
    anomaly_end_date = None

    anomaly_end_date_data = (
        AnomalyDataOutput.query.filter(
            (AnomalyDataOutput.kpi_id == kpi_id)
            & (AnomalyDataOutput.anomaly_type == "overall")
        )
        .order_by(AnomalyDataOutput.data_datetime.desc())
        .first()
    )

    try:
        anomaly_end_date = anomaly_end_date_data.as_dict["data_datetime"]
        if hourly:
            anomaly_end_date = pd.to_datetime(anomaly_end_date)
        else:
            anomaly_end_date = pd.to_datetime(anomaly_end_date.date())
        anomaly_end_date = anomaly_end_date.to_pydatetime()
    except Exception as err:
        current_app.logger.info(f"Error Found: {err}")

    return anomaly_end_date


def get_anomaly_graph_x_lims(end_date: date, period: int, hourly: bool) -> List[int]:
    start_date = end_date - timedelta(days=period)
    start_date = start_date.timetuple()
    if hourly:
        end_date = (end_date + timedelta(hours=12)).timetuple()
    else:
        end_date = (end_date + timedelta(days=1)).timetuple()
    return [time.mktime(start_date), time.mktime(end_date)]
