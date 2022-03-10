# -*- coding: utf-8 -*-
"""KPI views for creating and viewing the kpis."""
from collections import defaultdict
import logging
import traceback  # noqa: F401
from datetime import date, datetime, timedelta

from flask import (  # noqa: F401
    Blueprint,
    current_app,
    flash,
    redirect,
    render_template,
    request,
    url_for,
    jsonify,
)
import pandas as pd
from chaos_genius.connectors import get_sqla_db_conn

from chaos_genius.core.utils.kpi_validation import validate_kpi
from chaos_genius.core.utils.round import round_number
from chaos_genius.core.utils.utils import randomword
from chaos_genius.databases.models.kpi_model import Kpi
from chaos_genius.databases.models.anomaly_data_model import AnomalyDataOutput
from chaos_genius.databases.models.data_source_model import DataSource
from chaos_genius.databases.models.rca_data_model import RcaData
from chaos_genius.extensions import cache, db
from chaos_genius.databases.db_utils import chech_editable_field
from chaos_genius.controllers.kpi_controller import get_kpi_data_from_id
from chaos_genius.controllers.dashboard_controller import (
    create_dashboard_kpi_mapper,
    get_mapper_obj_by_dashboard_ids,
    get_mapper_obj_by_kpi_ids,
    get_dashboard_list_by_ids,
    disable_mapper_for_kpi_ids,
    edit_kpi_dashboards,
    enable_mapper_for_kpi_ids
)
from chaos_genius.settings import DEEPDRILLS_ENABLED_TIME_RANGES
from chaos_genius.core.rca.rca_utils.api_utils import (
    kpi_line_data,
    kpi_aggregation,
)
from chaos_genius.core.rca.constants import TIME_RANGES_BY_KEY

blueprint = Blueprint("api_kpi", __name__)
logger = logging.getLogger(__name__)


@blueprint.route("/", methods=["GET", "POST"]) # TODO: Remove this
@blueprint.route("", methods=["GET", "POST"])
def kpi():
    """kpi list view."""
    # Handle logging in
    if request.method == "POST":
        if not request.is_json:
            return jsonify({"error": "The request payload is not in JSON format"})

        data = request.get_json()
        data["dimensions"] = [] if data["dimensions"] is None else data["dimensions"]

        data_source = DataSource.get_by_id(data["data_source"]).as_dict
        data_con = get_sqla_db_conn(data_source_info=data_source)

        if data.get("kpi_query", "").strip():
            data["kpi_query"] = data["kpi_query"].strip()
            # remove trailing semicolon
            if data["kpi_query"][-1] == ";":
                data["kpi_query"] = data["kpi_query"][:-1]

        # TODO: make this more general.
        #       query data to figure out if it's tz-aware.
        timezone_aware = data_source["connection_type"] == "Druid"

        new_kpi = Kpi(
            name=data.get("name"),
            is_certified=data.get("is_certified"),
            data_source=data.get("data_source"),
            kpi_type=data.get("dataset_type"),
            kpi_query=data.get("kpi_query"),
            schema_name=data.get("schema_name"),
            table_name=data.get("table_name"),
            metric=data.get("metric"),
            aggregation=data.get("aggregation"),
            datetime_column=data.get("datetime_column"),
            filters=data.get("filters"),
            dimensions=data.get("dimensions"),
            timezone_aware=timezone_aware,
        )
        # Perform KPI Validation
        status, message = validate_kpi(new_kpi.as_dict, data_source)
        if status is not True:
            return jsonify(
                {"error": message, "status": "failure", "is_critical": "true"}
            )

        new_kpi.save(commit=True)

        # Add the dashboard id 0 to the kpi
        dashboard_list = data.get("dashboards", []) + [0]
        dashboard_list = list(set(dashboard_list))
        mapper_obj_list = create_dashboard_kpi_mapper(dashboard_list, [new_kpi.id])

        # TODO: Fix circular import error
        from chaos_genius.jobs.anomaly_tasks import ready_rca_task

        # run rca as soon as new KPI is added
        rca_task = ready_rca_task(new_kpi.id)
        if rca_task is None:
            print(
                f"Could not run RCA task since newly added KPI was not found: {new_kpi.id}"
            )
        else:
            rca_task.apply_async()

        return jsonify(
            {
                "data": {"kpi_id": new_kpi.id},
                "message": f"KPI {new_kpi.name} has been created successfully.",
                "status": "success",
            }
        )

    elif request.method == "GET":
        dashboard_id = request.args.get("dashboard_id")
        kpi_result_list, kpi_dashboard_mapper = [], []
        if dashboard_id:
            dashboard_id = int(dashboard_id)
            kpi_dashboard_mapper = get_mapper_obj_by_dashboard_ids([dashboard_id])
            kpi_list = [mapper.kpi for mapper in kpi_dashboard_mapper]
            kpi_result_list = (
                db.session.query(Kpi, DataSource)
                .join(DataSource, Kpi.data_source == DataSource.id)
                .filter(Kpi.active == True, Kpi.id.in_(kpi_list))  # noqa: E712
                .order_by(Kpi.created_at.desc())
                .all()
            )
        else:
            kpi_result_list = (
                db.session.query(Kpi, DataSource)
                .join(DataSource, Kpi.data_source == DataSource.id)
                .filter(Kpi.active == True)  # noqa: E712
                .order_by(Kpi.created_at.desc())
                .all()
            )

        kpi_dashboard_mapper = get_mapper_obj_by_kpi_ids([kpi.id for kpi, _ in kpi_result_list])
        kpi_dashboard_dict = defaultdict(list)
        for mapper in kpi_dashboard_mapper:
            kpi_dashboard_dict[mapper.kpi].append(mapper.dashboard)
        dashboard_list = [mapper.dashboard for mapper in kpi_dashboard_mapper]
        dashboard_result_list = get_dashboard_list_by_ids(dashboard_list)
        dashboard_dict = {dashboard.id: dashboard.as_dict for dashboard in dashboard_result_list}

        kpis = []
        for row in kpi_result_list:
            kpi_info = row[0].safe_dict
            data_source_info = row[1].safe_dict
            kpi_info["data_source"] = data_source_info
            dashboards = []
            for dashboard in kpi_dashboard_dict[kpi_info["id"]]:
                dashboards.append(dashboard_dict[dashboard])
            kpi_info["dashboards"] = dashboards
            kpis.append(kpi_info)
        dashboard_details = []
        if dashboard_id:
            if dashboard_dict:
                dashboard_details = [dashboard_dict[dashboard_id]]
            else:
                dashboards = get_dashboard_list_by_ids([dashboard_id])
                dashboard_details = [dashboard.as_dict for dashboard in dashboards]
        else:
            dashboard_details = list(dashboard_dict.values())
        return jsonify({"count": len(kpis), "data": kpis, "dashboards": dashboard_details})


@blueprint.route("/get-dashboard-list", methods=["GET"])
def get_all_kpis():
    """returning all kpis"""

    status, message = "success", ""
    timeline = request.args.get("timeline", "last_7_days")
    dashboard_id = request.args.get("dashboard_id")

    try:
        filters = [Kpi.active == True]
        if dashboard_id:
            kpi_dashboard_mapper = get_mapper_obj_by_dashboard_ids([dashboard_id])
            kpi_list = [mapper.kpi for mapper in kpi_dashboard_mapper]
            filters.append(Kpi.id.in_(kpi_list))

        results = (
            Kpi.query.filter(*filters)  # noqa: E712
            .order_by(Kpi.created_at.desc())
            .all()
        )

        ret = []
        metrics = ["name", "metric", "id"]
        for kpi in results:
            info = {key: getattr(kpi, key) for key in metrics}
            _, _, aggregate_data = kpi_aggregation(kpi.id, timeline)
            info["prev"] = aggregate_data["aggregation"][0]["value"]
            info["current"] = aggregate_data["aggregation"][1]["value"]
            info["change"] = aggregate_data["aggregation"][2]["value"]
            info["percentage_change"] = aggregate_data["aggregation"][3]["value"]

            info["display_value_prev"] = TIME_RANGES_BY_KEY[timeline]["last_period_name"]
            info["display_value_current"] = TIME_RANGES_BY_KEY[timeline]["current_period_name"]
            info["anomaly_count"] = get_anomaly_count(kpi.id, timeline)
            _, _, info["graph_data"] = kpi_line_data(kpi.id)
            ret.append(info)

    except Exception as e:  # noqa: E722
        status = "failure"
        message = str(e)
        logger.error(message, exc_info=True)

    return jsonify({"data": ret, "message": message, "status": status})


@blueprint.route("/get-timecuts-list", methods=["GET"])
def get_timecuts_list():
    """Returns all active timecuts."""
    status, message = "success", ""
    ret = {}
    try:
        enabled_cuts = [
            {**{k: v for k, v in value.items() if k != "function"}, "id": key}
            for key, value in TIME_RANGES_BY_KEY.items()
            if key in DEEPDRILLS_ENABLED_TIME_RANGES
        ]
        ret = enabled_cuts
        message = "All timecuts fetched succesfully."
    except Exception as e:
        status = "failure"
        message = str(e)
        logger.error(message)
    return jsonify({"data": ret, "message": message, "status": status})


@blueprint.route("/<int:kpi_id>/disable", methods=["GET"])
def disable_kpi(kpi_id):
    status, message = "", ""
    try:
        kpi_obj = Kpi.get_by_id(kpi_id)
        if kpi_obj:
            kpi_obj.active = False
            kpi_obj.save(commit=True)
            disable = disable_mapper_for_kpi_ids([kpi_id])
            status = "success"
        else:
            message = "KPI not found"
            status = "failure"
    except Exception as err:
        status = "failure"
        logger.info(f"Error in disabling the KPI: {err}")
    return jsonify({"message": message, "status": status})

@blueprint.route("/<int:kpi_id>/enable", methods=["GET"])
def enable_kpi(kpi_id):
    status, message = "", ""
    try:
        kpi_obj = Kpi.get_by_id(kpi_id)
        if kpi_obj:
            kpi_obj.active = True
            kpi_obj.save(commit=True)
            enable = enable_mapper_for_kpi_ids([kpi_id])
            status = "success"
        else:
            message = "KPI not found"
            status = "failure"
    except Exception as err:
        status = "failure"
        logger.info(f"Error in enabling the KPI: {err}")
    return jsonify({"message": message, "status": status})


@blueprint.route("/<int:kpi_id>/get-dimensions", methods=["GET"])
def kpi_get_dimensions(kpi_id):
    dimensions = []
    try:
        kpi_info = get_kpi_data_from_id(kpi_id)
        dimensions = kpi_info["dimensions"]
    except Exception as err:
        logger.info(f"Error Found: {err}")
    return jsonify({"dimensions": dimensions, "msg": ""})


@blueprint.route("/meta-info", methods=["GET"])
def kpi_meta_info():
    """kpi meta info view."""
    logger.info("kpi meta info")
    return jsonify({"data": Kpi.meta_info()})


@blueprint.route("/<int:kpi_id>/update", methods=["PUT"])
def edit_kpi(kpi_id):
    """edit kpi details."""
    status, message = "", ""
    try:
        kpi_obj = Kpi.get_by_id(kpi_id)
        data = request.get_json()
        meta_info = Kpi.meta_info()
        if kpi_obj and kpi_obj.active is True:
            dashboard_id_list = data.pop("dashboards", []) + [0]
            dashboard_id_list = list(set(dashboard_id_list))

            for key, value in data.items():
                if chech_editable_field(meta_info, key):
                    setattr(kpi_obj, key, value)

            mapper_dict = edit_kpi_dashboards(kpi_id, dashboard_id_list)
            kpi_obj.save(commit=True)
            status = "success"
        else:
            message = "KPI not found or disabled"
            status = "failure"
    except Exception as err:
        status = "failure"
        logger.info(f"Error in updating the KPI: {err}")
        message = str(err)
    return jsonify({"message": message, "status": status})


@blueprint.route("/<int:kpi_id>", methods=["GET"])
def get_kpi_info(kpi_id):
    """get Kpi details."""
    status, message = "", ""
    data = None
    try:
        kpi_obj = get_kpi_data_from_id(kpi_id)
        data = kpi_obj
        mapper_obj_list = get_mapper_obj_by_kpi_ids([kpi_id])
        dashboard_id_list = [mapper.dashboard for mapper in mapper_obj_list]
        dashboard_list = get_dashboard_list_by_ids(dashboard_id_list)
        dashboard_list = [dashboard.as_dict for dashboard in dashboard_list]
        data["dashboards"] = dashboard_list
        status = "success"
    except Exception as err:
        status = "failure"
        message = str(err)
        logger.info(f"Error in fetching the KPI: {err}")
    return jsonify({"message": message, "status": status, "data": data})


@blueprint.route("/<int:kpi_id>/trigger-analytics", methods=["GET"])
def trigger_analytics(kpi_id):

    # TODO: Fix circular import error
    from chaos_genius.jobs.anomaly_tasks import ready_rca_task, ready_anomaly_task

    rca_task = ready_rca_task(kpi_id)
    anomaly_task = ready_anomaly_task(kpi_id)
    if rca_task is not None and anomaly_task is not None:
        rca_task.apply_async()
        anomaly_task.apply_async()
    else:
        print(f"Could not analytics since newly added KPI was not found: {kpi_id}")
    return jsonify({"message": "RCA and Anomaly triggered successfully"})


def find_percentage_change(curr_val, prev_val):

    if prev_val == 0:
        return "--"

    change = curr_val - prev_val
    percentage_change = (change / prev_val) * 100
    return str(round_number(percentage_change))


def get_anomaly_count(kpi_id, timeline):

    curr_date = datetime.now().date()
    (_, _), (sd, _) = TIME_RANGES_BY_KEY[timeline]["function"](curr_date)

    # TODO: Add the series type filter
    anomaly_data = AnomalyDataOutput.query.filter(
        AnomalyDataOutput.kpi_id == kpi_id,
        AnomalyDataOutput.anomaly_type == "overall",
        AnomalyDataOutput.is_anomaly == 1,
        AnomalyDataOutput.data_datetime >= sd,
    ).all()

    return len(anomaly_data)
