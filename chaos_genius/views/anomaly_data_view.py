# -*- coding: utf-8 -*-
"""anomaly data view."""
import logging
import time
from collections import defaultdict
from datetime import date, datetime, timedelta
from typing import Any, DefaultDict, Dict, List, Optional, Sequence, Set, Tuple, cast

import pandas as pd
from flask.blueprints import Blueprint
from flask.globals import request
from flask.json import jsonify
from sqlalchemy import func
from sqlalchemy.orm.attributes import flag_modified

from chaos_genius.controllers.alert_controller import (
    clear_triggered_alerts_from_offset,
    get_alert_list,
    set_last_anomaly_timestamp_to_offset,
)
from chaos_genius.controllers.kpi_controller import (
    delete_anomaly_output_for_kpi,
    get_kpi_data_from_id,
)
from chaos_genius.core.anomaly.constants import MODEL_NAME_MAPPING
from chaos_genius.core.utils.round import round_column_in_df
from chaos_genius.core.utils.utils import get_user_string_from_subgroup_dict
from chaos_genius.databases.models.alert_model import Alert
from chaos_genius.databases.models.anomaly_data_model import AnomalyDataOutput
from chaos_genius.databases.models.kpi_model import Kpi
from chaos_genius.databases.models.rca_data_model import RcaData
from chaos_genius.extensions import db
from chaos_genius.settings import TOP_DIMENSIONS_FOR_ANOMALY_DRILLDOWN
from chaos_genius.utils.datetime_helper import (
    get_datetime_string_with_tz,
    get_lastscan_string_with_tz,
)
from chaos_genius.utils.utils import make_path_safe

blueprint = Blueprint("anomaly_data", __name__)

logger = logging.getLogger(__name__)


@blueprint.route("/", methods=["GET"])  # TODO: Remove this
@blueprint.route("", methods=["GET"])
def list_anomaly_data():
    """Root route. Does nothing."""
    # FIXME: Update home route
    return jsonify({"data": "Hello World!"})


@blueprint.route("/<int:kpi_id>/anomaly-detection", methods=["GET"])
def kpi_anomaly_detection(kpi_id: int):
    """Get anomaly detection data for a KPI."""
    logger.info(f"Retrieving Anomaly Detection data for KPI ID: {kpi_id}")
    data = []
    end_date = None
    is_overall = True
    dimensions_values = []
    anomaly_last_scan = ""
    # used for CSV download
    kpi_name_path_safe = ""
    try:
        kpi_info = get_kpi_data_from_id(kpi_id)

        if not kpi_info["anomaly_params"]:
            logger.info(f"Anomaly settings not configured for KPI ID: {kpi_id}")
            return jsonify(
                {
                    "data": None,
                    "msg": "",
                    "anomaly_end_date": None,
                    "last_run_time_anomaly": None,
                }
            )

        period = kpi_info["anomaly_params"]["anomaly_period"]
        hourly = kpi_info["anomaly_params"]["frequency"] == "H"
        kpi_name_path_safe = make_path_safe(kpi_info["name"])

        end_date = get_anomaly_output_end_date(kpi_info)

        dimensions_values = _get_dimensions_values(kpi_id, end_date, period)

        dimension = request.args.get("dimension", default=None)
        value = request.args.get("value", default=None)

        if dimension is not None and value is not None:
            is_overall = False
            series_type = {dimension: value}
            anom_data = get_dq_and_subdim_data(
                kpi_id, end_date, "subdim", series_type, period
            )
        else:
            is_overall = True
            anom_data = get_overall_data(kpi_id, end_date, period)

        anom_data["x_axis_limits"] = _get_anomaly_graph_x_lims(end_date, period, hourly)

        data = {
            "chart_data": anom_data,
            # TODO: base_anomaly_id not needed anymore
            # remove from here once updated in frontend
            "base_anomaly_id": kpi_id,
        }

        logger.info(f"Anomaly DD Retrieval Completed for KPI ID: {kpi_id}")

        end_date = get_datetime_string_with_tz(end_date, hourly)
        anomaly_last_scan = get_lastscan_string_with_tz(
            kpi_info["scheduler_params"]["last_scheduled_time_anomaly"]
        )

    except Exception:  # noqa B902
        logger.error("Error in Anomaly Overall Retrieval", exc_info=True)

    return jsonify(
        {
            "data": data,
            "dimensions_values": dimensions_values,
            "msg": "",
            "anomaly_end_date": end_date,
            "last_run_time_anomaly": anomaly_last_scan,
            "is_overall": is_overall,
            "kpi_name_path_safe": kpi_name_path_safe,
        }
    )


@blueprint.route("/<int:kpi_id>/anomaly-drilldown", methods=["GET"])
def kpi_anomaly_drilldown(kpi_id: int):
    """Get anomaly drilldown data for a KPI at a particular timestamp."""
    logger.info(f"Anomaly Drilldown Started for KPI ID: {kpi_id}")
    subdim_graphs = []
    end_date = None
    try:

        drilldown_date = request.args.get("date")
        if drilldown_date is None:
            raise ValueError("date param is required.")

        drilldown_date = pd.to_datetime(drilldown_date, unit="ms")

        kpi_info = get_kpi_data_from_id(kpi_id)
        frequency: str = kpi_info["anomaly_params"]["frequency"]

        subdims = get_drilldowns_series_type(kpi_id, drilldown_date, frequency)

        period = kpi_info["anomaly_params"]["anomaly_period"]
        hourly = kpi_info["anomaly_params"]["frequency"] == "H"

        end_date = get_anomaly_output_end_date(kpi_info)

        graph_xlims = _get_anomaly_graph_x_lims(end_date, period, hourly)

        for subdim in subdims:
            anom_data = get_dq_and_subdim_data(
                kpi_id, end_date, "subdim", subdim, period
            )
            anom_data["x_axis_limits"] = graph_xlims
            subdim_graphs.append(anom_data)
        logger.info(f"Anomaly DD Retrieval Completed for KPI ID: {kpi_id}")

    except Exception:  # noqa B902
        logger.error("Error in Anomaly DD Retrieval", exc_info=True)

    return jsonify({"data": subdim_graphs, "msg": ""})


@blueprint.route("/<int:kpi_id>/anomaly-data-quality", methods=["GET"])
def kpi_anomaly_data_quality(kpi_id: int):
    """Get anomaly data quality data for a KPI."""
    logger.info(f"Anomaly Drilldown Started for KPI ID: {kpi_id}")

    data = []
    end_date = None
    try:
        kpi_info = get_kpi_data_from_id(kpi_id)
        period = kpi_info["anomaly_params"]["anomaly_period"]
        hourly = kpi_info["anomaly_params"]["frequency"] == "H"

        end_date = get_anomaly_output_end_date(kpi_info)

        graph_xlims = _get_anomaly_graph_x_lims(end_date, period, hourly)

        agg = kpi_info["aggregation"]
        dq_list = ["max", "count", "mean"] if agg != "mean" else ["max", "count"]
        for dq in dq_list:
            anom_data = get_dq_and_subdim_data(
                kpi_id, end_date, "dq", {"dq": dq}, period
            )
            anom_data["x_axis_limits"] = graph_xlims
            if anom_data["values"] != []:
                data.append(anom_data)

        logger.info(f"Anomaly DQ Retrieval Completed for KPI ID: {kpi_id}")

    except Exception as err:  # noqa B902
        logger.error(f"Error in Anomaly DQ Retrieval: {err}", exc_info=True)

    return jsonify({"data": data, "msg": ""})


@blueprint.route("/anomaly-params/meta-info", methods=["GET"])
def kpi_anomaly_params_meta():
    """Meta info for anomaly params."""
    # TODO: Move this dict into the corresponding data model
    return jsonify(ANOMALY_PARAMS_META)


@blueprint.route("/<int:kpi_id>/anomaly-params", methods=["POST", "GET"])
def kpi_anomaly_params(kpi_id: int):
    """Get or update anomaly params for a KPI.

    (This is where anomaly is setup/configured or updated).
    """
    kpi = cast(Optional[Kpi], Kpi.get_by_id(kpi_id))

    if kpi is None:
        return (
            jsonify(
                {
                    "error": f"Could not find KPI for ID: {kpi_id}",
                    "status": "failure",
                }
            ),
            400,
        )

    # when method is GET we just return the anomaly params
    if request.method == "GET":
        return jsonify(
            {
                "anomaly_params": _get_anomaly_params_dict(kpi),
            }
        )

    # when it's POST, update anomaly params

    # check if this is first time anomaly setup or edit config
    is_first_time = kpi.anomaly_params is None

    if is_first_time:
        logger.info(f"Adding anomaly parameters for KPI ID: {kpi_id}")
    else:
        logger.info(f"Updating existing anomaly parameters for KPI ID: {kpi_id}")

    if not request.is_json:
        return (
            jsonify(
                {
                    "error": "Request body must be a JSON "
                    + "(and Content-Type header must be set correctly)",
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
    run_anomaly = False
    # if anomaly params are updated, run anomaly again.
    # if only scheduled time is updated, do not run anomaly again.
    if not is_first_time:
        if (
            "scheduler_params_time" not in new_anomaly_params
            and len(new_anomaly_params) > 0
        ):
            run_anomaly = True
        elif (
            "scheduler_params_time" in new_anomaly_params
            and len(new_anomaly_params) > 1
        ):
            run_anomaly = True
        else:
            run_anomaly = False

    if run_anomaly and err == "":
        logger.info(
            "Deleting anomaly data and re-running anomaly since anomaly params was "
            + f"edited for KPI ID: {new_kpi.id}"
        )
        delete_anomaly_output_for_kpi(new_kpi.id)
        from chaos_genius.jobs.anomaly_tasks import ready_anomaly_task

        anomaly_task = ready_anomaly_task(new_kpi.id)
        if anomaly_task is not None:
            anomaly_task.apply_async()
            logger.info(f"Anomaly started for KPI ID: {new_kpi.id}")
        else:
            logger.info(
                f"Anomaly failed since KPI was not found for KPI ID: {new_kpi.id}"
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
            logger.info(
                "Could not run anomaly task since newly configured KPI was not found: "
                f"{new_kpi.id}"
            )
        else:
            anomaly_task.apply_async()
            rca_task.apply_async()

    return jsonify({"msg": "Successfully updated Anomaly params", "status": "success"})


@blueprint.route("/<int:kpi_id>/settings", methods=["GET"])
def anomaly_settings_status(kpi_id: int):
    """Get anomaly status for a KPI."""
    logger.info(f"Retrieving anomaly settings for kpi: {kpi_id}")
    kpi = cast(Optional[Kpi], Kpi.get_by_id(kpi_id))

    if kpi is None:
        return (
            jsonify(
                {
                    "error": f"Could not find KPI for ID: {kpi_id}",
                    "status": "failure",
                }
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
        (AnomalyDataOutput.kpi_id == kpi_id)
        & (AnomalyDataOutput.anomaly_type == "overall")
    ).count()
    response["is_anomaly_precomputed"] = anomaly_data != 0

    logger.info(f"Anomaly settings retrieved for kpi: {kpi_id}")
    return jsonify(response)


@blueprint.route("/<int:kpi_id>/retrain", methods=["POST", "GET"])
def kpi_anomaly_retraining(kpi_id: int):
    """Delete all anomaly data and retrain anomaly for a KPI."""
    # delete all data in anomaly output table
    kpi = cast(Optional[Kpi], Kpi.get_by_id(kpi_id))
    if kpi is not None:
        if kpi.run_anomaly and kpi.anomaly_params is not None:
            delete_anomaly_output_for_kpi(kpi_id)

            # clear triggered alerts data from T-offset day
            # and set last_anomaly_timestamp such that the alert run
            # after anomaly completes uses data from T-offset.
            alerts = get_alert_list(extra_filters=[Alert.kpi == kpi_id], as_obj=True)
            clear_triggered_alerts_from_offset([alert.id for alert in alerts])
            for alert in alerts:
                set_last_anomaly_timestamp_to_offset(
                    alert, kpi.anomaly_params.get("frequency")
                )

            # add anomaly to queue
            from chaos_genius.jobs.anomaly_tasks import ready_anomaly_task

            anomaly_task = ready_anomaly_task(kpi_id)
            if anomaly_task is None:
                message = f"retraining failed for KPI: {kpi_id}, KPI id is None"
                status = "failure"
            else:
                anomaly_task.apply_async()
                logger.info(f"Retraining started for KPI ID: {kpi_id}")
                message = f"retraining started for KPI: {kpi_id}"
                status = "success"
        else:
            message = f"Please enable anomaly for KPI ID: {kpi_id} before retraining"
            status = "failure"
    else:
        message = f"KPI {kpi_id} could not be retreived."
        status = "failure"
    return jsonify({"msg": message, "status": status})


@blueprint.route("/<int:kpi_id>/disable-anomaly", methods=["GET", "POST"])
def disable_anomaly(kpi_id):
    """API end point which disables analytics by modifying the run_anomaly flag."""
    kpi = cast(Optional[Kpi], Kpi.get_by_id(kpi_id))
    if kpi is not None:
        # check if anomaly is setup
        if kpi.anomaly_params:
            kpi.run_anomaly = False
            kpi.update(commit=True)
            message = f"Disabled Analytics for KPI ID: {kpi_id}"
            status = "success"
        else:
            message = (
                "Failed to Disable Anomaly because it is not enabled for"
                f" KPI ID: {kpi_id}"
            )
            status = "failure"
    else:
        message = f"KPI {kpi_id} could not be retreived."
        status = "failure"

    if status == "success":
        logger.info(message)
    else:
        logger.error(message)
    return jsonify({"msg": message, "status": status})


@blueprint.route("/<int:kpi_id>/enable-anomaly", methods=["GET", "POST"])
def enable_anomaly(kpi_id):
    """API end point which enables analytics by modifying the run_anomaly flag."""
    kpi = cast(Optional[Kpi], Kpi.get_by_id(kpi_id))
    if kpi is not None:
        if not kpi.run_anomaly:
            kpi.run_anomaly = True
            kpi.update(commit=True)
            if kpi.anomaly_params is not None:
                message = f"Enabled Analytics for KPI ID: {kpi_id}"
                status = "success"
            else:
                message = (
                    f"KPI ID: {kpi_id}. Analytics enabled but is not configured."
                    " Please Configure it to run anomaly."
                )
                status = "success"
                logger.warn(message)
        else:
            message = (
                "Failed to Enable Anomaly because it is either already enabled"
                f" or not set up for KPI ID: {kpi_id}"
            )
            status = "failure"
    else:
        message = f"KPI {kpi_id} could not be retreived"
        status = "failure"

    if status == "success":
        logger.info(message)
    else:
        logger.error(message)
    return jsonify({"msg": message, "status": status})


def _get_dimensions_values(
    kpi_id: int, end_date: datetime, period=90
) -> List[Dict[str, Any]]:
    """Creates a dictionary of KPI dimension and their values.

    :param kpi_id: ID of the KPI
    :type kpi_id: int
    :param end_date: last data entry of the KPI
    :type end_date: datetime
    :param period: time window of KPI
    :type period: int
    :return dimension_values_dict: dictionary of {dimension:list(vals)}
    :rtype: dict
    """
    start_date = pd.to_datetime(end_date) - timedelta(days=period)
    start_date_str = start_date.strftime("%Y-%m-%d %H:%M:%S")
    end_date_str = end_date.strftime("%Y-%m-%d %H:%M:%S")

    # Get unique list of subdims and values from DB
    results = (
        db.session.query(func.distinct(AnomalyDataOutput.series_type))
        .filter(
            (AnomalyDataOutput.kpi_id == kpi_id)
            & (AnomalyDataOutput.data_datetime >= start_date_str)
            & (AnomalyDataOutput.data_datetime <= end_date_str)
            & (AnomalyDataOutput.anomaly_type == "subdim")
        )
        .all()
    )

    if len(results) == 0:
        logger.info("No Subdimension Anomaly Found")
        return []

    # series_type strings are in format {dimension1 == value1, dimension2 == value2,}
    # create a default dict mapping each dimension to a list of their values
    dimension_values_dict: DefaultDict[str, Set[str]] = defaultdict(set)
    for dim_val_row in results:
        for dimension in dim_val_row[0].keys():
            dimension_values_dict[dimension].add(dim_val_row[0][dimension])

    dimension_values_list = [
        {
            "label": dimension,
            "value": dimension,
            "label_path_safe": make_path_safe(dimension),
            "subdim_value_options": [
                {
                    "label": value,
                    "value": value,
                    "label_path_safe": make_path_safe(value),
                }
                for value in sorted(dimension_values_dict[dimension])
            ],
        }
        for dimension in sorted(dimension_values_dict)
    ]

    return dimension_values_list


def convert_to_graph_json(
    results: pd.DataFrame,
    kpi_id: int,
    anomaly_type="overall",
    series_type: Optional[Dict[str, str]] = None,
) -> Dict[str, Any]:
    """Convert dataframe to a dict in frontend's graph format."""
    kpi_info = get_kpi_data_from_id(kpi_id)

    if anomaly_type == "overall":
        title = kpi_info["name"]
    else:
        if series_type is None:
            raise ValueError(
                f"series_type was missing for a subdim anomaly. KPI: {kpi_id}"
            )

        title = get_user_string_from_subgroup_dict(series_type)

    kpi_name = kpi_info["metric"]

    # convert pd.Timestamp to a UNIX timestamp float
    # converting to int64 gives the result in nanoseconds
    # dividing by 1e6 converts it to milliseconds
    results["timestamp"] = results["data_datetime"].astype("int64") / 1e6

    round_column_in_df(results, "yhat_lower")
    round_column_in_df(results, "yhat_upper")
    round_column_in_df(results, "y")
    round_column_in_df(results, "yhat")
    round_column_in_df(results, "severity")

    intervals = results[["timestamp", "yhat_lower", "yhat_upper"]].values.tolist()
    values = results[["timestamp", "y"]].values.tolist()
    expected_values = results[["timestamp", "yhat"]].values.tolist()
    severities = results[["timestamp", "severity"]].values.tolist()

    graph_data = {
        "title": title,
        "y_axis_label": kpi_name,
        "x_axis_label": "Datetime",
        "sub_dimension": anomaly_type,
        "intervals": intervals,
        "values": values,
        "expected_values": expected_values,
        "severity": severities,
    }

    return graph_data


def get_overall_data(kpi_id: int, end_date: datetime, n=90):
    """Retrieve overall data for a KPI for the last n days from end_date.

    The data is in frontend's graph dict format.
    """
    start_date = end_date - timedelta(days=n)
    start_date = start_date.strftime("%Y-%m-%d %H:%M:%S")
    end_date_str = end_date.strftime("%Y-%m-%d %H:%M:%S")

    # TODO: Add the series type filter
    query = AnomalyDataOutput.query.filter(
        (AnomalyDataOutput.kpi_id == kpi_id)
        & (AnomalyDataOutput.data_datetime <= end_date_str)
        & (AnomalyDataOutput.data_datetime >= start_date)
        & (AnomalyDataOutput.anomaly_type == "overall")
    ).order_by(AnomalyDataOutput.data_datetime)

    results = pd.read_sql(query.statement, query.session.bind)

    return convert_to_graph_json(results, kpi_id, "overall", None)


def get_dq_and_subdim_data(
    kpi_id: int,
    end_date: datetime,
    anomaly_type: str = "dq",
    series_type: Dict[str, str] = {"dq": "max"},
    n: int = 90,
):
    """Retrieve data quality or subdim data for a KPI for the last n days from end_date.

    Data is retrieved for the selected series_type only.

    The data is in frontend's graph dict format.
    """
    start_date = pd.to_datetime(end_date) - timedelta(days=n)
    start_date = start_date.strftime("%Y-%m-%d %H:%M:%S")
    end_date_str = end_date.strftime("%Y-%m-%d %H:%M:%S")

    query = AnomalyDataOutput.query.filter(
        (AnomalyDataOutput.kpi_id == kpi_id)
        & (AnomalyDataOutput.data_datetime <= end_date_str)
        & (AnomalyDataOutput.data_datetime >= start_date)
        & (AnomalyDataOutput.anomaly_type == anomaly_type)
        & (AnomalyDataOutput.series_type == series_type)
    ).order_by(AnomalyDataOutput.data_datetime)

    results = pd.read_sql(query.statement, query.session.bind)

    return convert_to_graph_json(results, kpi_id, anomaly_type, series_type)


def get_drilldowns_series_type(
    kpi_id: int,
    drilldown_date: pd.Timestamp,
    frequency: str,
) -> Sequence[Dict[str, str]]:
    """Get all relevant subdims' series_type at drilldown timestamp."""
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
            & (AnomalyDataOutput.impact > 0)
        )
        .order_by(AnomalyDataOutput.impact.desc())
        .limit(TOP_DIMENSIONS_FOR_ANOMALY_DRILLDOWN)
    )

    results = pd.read_sql(query.statement, query.session.bind)
    if len(results) == 0:
        if frequency == "H":
            time_window = timedelta(hours=3)
        else:
            time_window = timedelta(days=1)

        logger.info(
            (
                "Could not find any subdimensions for anomaly at"
                " %s. Looking for time window %s beside the timestamp"
            ),
            drilldown_date,
            time_window,
        )

        start_date = drilldown_date - time_window
        end_date = drilldown_date + time_window

        query = AnomalyDataOutput.query.filter(
            (AnomalyDataOutput.kpi_id == kpi_id)
            & (AnomalyDataOutput.data_datetime <= end_date)
            & (AnomalyDataOutput.data_datetime >= start_date)
            & (AnomalyDataOutput.anomaly_type == "subdim")
            & ((AnomalyDataOutput.impact > 0) | (AnomalyDataOutput.severity > 0))
        )

        results = pd.read_sql(query.statement, query.session.bind)

        # Sorting by distance from drilldown data (ascending) and severity of
        # anomaly (descending), created distance for this purpose only
        results["distance"] = abs(
            results["data_datetime"] - pd.to_datetime(drilldown_date)
        )
        results.sort_values(
            ["distance", "impact", "severity"],
            ascending=[True, False, False],
            inplace=True,
        )
        results.drop("distance", axis=1, inplace=True)

        results = results.loc[
            results["series_type"].astype(str).drop_duplicates(keep="first").index
        ]

        results = results.iloc[:TOP_DIMENSIONS_FOR_ANOMALY_DRILLDOWN]

    return results.series_type


def get_anomaly_output_end_date(kpi_info: dict) -> datetime:
    """Returns the end date of the last analysis of the KPI.

    Checks if the KPI has a static end date and returns it.Otherwise it tries to get
    end date of overall anomaly detection, and will finally return today's date if that
    is also not found.
    :return: end date for use with anomaly data output
    :rtype: datetime
    """
    end_date: datetime

    hourly = kpi_info["anomaly_params"]["frequency"] == "H"

    if kpi_info["is_static"]:
        end_date_str: Optional[str] = kpi_info.get("static_params", {}).get(
            "end_date", None
        )
        if end_date_str is not None:
            try:
                end_date = datetime.strptime(end_date_str, "%Y-%m-%d %H:%M:%S")
            except Exception:
                end_date_str = end_date_str + " 00:00:00"
                end_date = datetime.strptime(end_date_str, "%Y-%m-%d %H:%M:%S")
        else:
            raise Exception(
                f"KPI {kpi_info['id']} is static but no static end_date was provided."
            )
    else:
        # TODO: caused the non viewing of data post 00:00
        maybe_end_date = get_anomaly_end_date(kpi_info["id"], hourly=hourly)
        if maybe_end_date is not None:
            end_date = maybe_end_date
        else:
            end_date = datetime.now()

    end_date_ts: pd.Timestamp = (
        pd.to_datetime(end_date) if hourly else pd.to_datetime(end_date.date())
    )

    return end_date_ts.to_pydatetime()


# --- anomaly params meta information --- #
ANOMALY_PARAMS_META = {
    "name": "anomaly_params",
    "fields": [
        {
            "name": "anomaly_period",
            "is_editable": True,
            "is_sensitive": False,
            "type": "integer",
        },
        {
            "name": "model_name",
            "is_editable": True,
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
            "is_editable": True,
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
            "is_editable": True,
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


def _anomaly_params_field_is_editable(field_name: str):
    return next(
        (
            field["is_editable"]
            for field in ANOMALY_PARAMS_META["fields"]
            if field["name"] == field_name
        ),
        True,
    )


def validate_partial_anomaly_params(
    anomaly_params: Dict[str, Any]
) -> Tuple[str, Dict[str, Any]]:
    """Check if given *partial* anomaly parameters have valid keys and values.

    Returns an error string. Empty string "" means the params are valid.
    Also returns the validated anomaly_params, with some conversions applied.
    This is undefined when the anomaly_params is not valid.
    The passed anomaly_params is modified in-place.
    """
    fields = ANOMALY_PARAM_FIELDS

    if fields.isdisjoint(set(anomaly_params.keys())):
        # we don't have any of the possible fields
        return (
            "anomaly_params needs to have one of the following fields: "
            + f"{', '.join(fields)}",
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

    def validate_frequency(frequency, field_name, frequency_types=None):
        if frequency_types is None:
            frequency_types = {"D", "H"}
        if not isinstance(frequency, str):
            return (
                f"{field_name} must be a string, one of: {', '.join(frequency_types)}. "
                + f"Got: {frequency}",
                anomaly_params,
            )

        anomaly_params[field_name] = frequency

        if frequency not in frequency_types:
            return (
                f"{field_name} must be one of: {', '.join(frequency_types)}. "
                + f"Got: {frequency}",
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
                "sensitivity must be a string, one of: "
                + f"{', '.join(sensitivity_types)}. Got: {sensitivity}",
                anomaly_params,
            )

        # we compare (and store) only lower case for this field
        sensitivity = sensitivity.lower()
        anomaly_params["sensitivity"] = sensitivity

        if sensitivity not in sensitivity_types:
            return (
                f"sensitivity must be one of: {', '.join(sensitivity_types)}. "
                + f"Got: {sensitivity}",
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
                    "All of the seasonalities must be a string, one of: "
                    + f"{', '.join(seasonality_types)}. One of them was: {s}",
                    anomaly_params,
                )

            # no lower case for this since the expecetd values are upper case

            if s not in seasonality_types:
                return (
                    "All of the seasonalities must be one of: "
                    f"{', '.join(seasonality_types)}. One of them was: {s}",
                    anomaly_params,
                )

    if "scheduler_params_time" in anomaly_params:
        err, time = _validate_scheduled_time(anomaly_params["scheduler_params_time"])

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


def _check_dimensions(kpi: Kpi) -> bool:
    return kpi.dimensions is not None and kpi.dimensions


def update_anomaly_params(
    kpi: Kpi,
    new_anomaly_params: Dict[str, Any],
    run_anomaly=True,
    check_editable=False,
) -> Tuple[str, Kpi]:
    """Update anomaly_params with the given *partial* *validated* anomaly parameters.

    The new_anomaly_params must be validated using validate_partial_anomaly_params.
    run_anomaly is also set to True in the Kpi table, by default.
    If check_editable is set to True, only the editable fields are to be updated.
    """
    fields = ANOMALY_PARAM_FIELDS

    anomaly_params: dict = kpi.anomaly_params or {}

    def is_editable(field_name: str, old_val, new_val):
        if not check_editable:
            return ""

        if not _anomaly_params_field_is_editable(field_name) and old_val != new_val:
            return (
                f"{field_name} is not editable. "
                + f"Old value: {old_val}, New value: {new_val}"
            )

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

        # make summary/DD run at default time (KPI setup time) if it was changed from
        # daily to hourly.
        if (
            scheduler_params["scheduler_frequency"] != "D"
            and "rca_time" in scheduler_params
            and scheduler_params.get("rca_time") == scheduler_params.get("time")
        ):
            scheduler_params.pop("rca_time")

        kpi.scheduler_params = scheduler_params
        flag_modified(kpi, "scheduler_params")

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

        # run DD/summary at anomaly time for daily model frequency KPIs
        # note: relies on the assumption that scheduler frequency is updated before this
        if scheduler_params.get("scheduler_frequency") == "D":
            scheduler_params["rca_time"] = scheduler_params["time"]

        kpi.scheduler_params = scheduler_params
        flag_modified(kpi, "scheduler_params")

    if not _check_dimensions(kpi):
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


def _get_anomaly_params_dict(kpi: Kpi):
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


def _validate_scheduled_time(time):
    if not isinstance(time, str):
        return f"time must be a string. Got: {type(time).__name__}", time

    times = time.split(":")

    if len(times) != 3:
        err_msg = "time must be in the format HH:MM:SS"
        return f"{err_msg}. Got: {time}", time

    hour, minute, second = times

    if not hour.isdigit() or not minute.isdigit() or not second.isdigit():
        return (
            f"hour, minute, second must be numbers. Got: {hour}, {minute}, {second}",
            time,
        )

    hour = int(hour)

    if hour < 0 or hour > 23:
        return (
            f"hour must be between 0 and 23 (inclusive). Got: {hour}",
            time,
        )

    minute, second = int(minute), int(second)

    if minute < 0 or minute > 60:
        return (
            f"minute must be between 0 and 60 (inclusive). Got: {minute}",
            time,
        )

    if second < 0 or second > 60:
        return (
            f"second must be between 0 and 60 (inclusive). Got: {second}",
            time,
        )

    return "", time


def get_anomaly_end_date(kpi_id: int, hourly: bool) -> Optional[datetime]:
    """Timestamp of last anomaly entry for the KPI."""
    anomaly_end_date_data = (
        AnomalyDataOutput.query.filter(
            (AnomalyDataOutput.kpi_id == kpi_id)
            & (AnomalyDataOutput.anomaly_type == "overall")
        )
        .order_by(AnomalyDataOutput.data_datetime.desc())
        .first()
    )

    try:
        anomaly_end_date: datetime = anomaly_end_date_data.as_dict["data_datetime"]
        if hourly:
            anomaly_end_date_ts: pd.Timestamp = pd.to_datetime(anomaly_end_date)
        else:
            anomaly_end_date_ts: pd.Timestamp = pd.to_datetime(anomaly_end_date.date())

        return anomaly_end_date_ts.to_pydatetime()
    except Exception as err:  # noqa: B902
        logger.error(f"Error Found: {err}", exc_info=err)

    return None


def _get_anomaly_graph_x_lims(end_date: date, period: int, hourly: bool) -> List[float]:
    start_date = end_date - timedelta(days=period)
    start_date = start_date.timetuple()
    if hourly:
        end_date_t = (end_date + timedelta(hours=12)).timetuple()
    else:
        end_date_t = (end_date + timedelta(days=1)).timetuple()
    return [time.mktime(start_date), time.mktime(end_date_t)]
