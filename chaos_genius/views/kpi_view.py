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

from chaos_genius.core.utils.kpi_validation import validate_kpi
from chaos_genius.core.utils.round import round_number
from chaos_genius.databases.models.kpi_model import Kpi
from chaos_genius.databases.models.anomaly_data_model import AnomalyDataOutput
from chaos_genius.databases.models.data_source_model import DataSource
from chaos_genius.databases.models.rca_data_model import RcaData
from chaos_genius.databases.models.dashboard_kpi_mapper_model import DashboardKpiMapper
from chaos_genius.databases.models.dashboard_model import Dashboard
from chaos_genius.extensions import cache, db
from chaos_genius.databases.db_utils import chech_editable_field
from chaos_genius.controllers.kpi_controller import get_kpi_data_from_id
from chaos_genius.controllers.dashboard_controller import (
    create_dashboard_kpi_mapper,
    get_mapper_obj_by_dashboard_ids,
    get_mapper_obj_by_kpi_ids,
    get_dashboard_list_by_ids,
    disable_mapper_for_kpi_ids,
)
from chaos_genius.utils.datetime_helper import get_rca_timestamp, get_epoch_timestamp

TIME_DICT = {
    "mom": {"expansion": "month", "time_delta": timedelta(days=30, hours=0, minutes=0)},
    "wow": {"expansion": "week", "time_delta": timedelta(days=7, hours=0, minutes=0)},
    "dod": {"expansion": "day", "time_delta": timedelta(days=1, hours=0, minutes=0)},
}

blueprint = Blueprint("api_kpi", __name__)
logger = logging.getLogger(__name__)


@blueprint.route("/", methods=["GET", "POST"])
def kpi():
    """kpi list view."""
    # Handle logging in
    if request.method == "POST":
        if not request.is_json:
            return jsonify({"error": "The request payload is not in JSON format"})

        data = request.get_json()
        data["dimensions"] = [] if data["dimensions"] is None else data["dimensions"]

        if data.get("kpi_query", "").strip():
            data["kpi_query"] = data["kpi_query"].strip()
            # remove trailing semicolon
            if data["kpi_query"][-1] == ";":
                data["kpi_query"] = data["kpi_query"][:-1]

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
        )
        # Perform KPI Validation
        status, message = validate_kpi(new_kpi.as_dict)
        if status is not True:
            return jsonify(
                {"error": message, "status": "failure", "is_critical": "true"}
            )

        new_kpi.save(commit=True)

        dashboard_list = data.get("dashboard", [])
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
            for dashboard_id in kpi_dashboard_dict[kpi_info["id"]]:
                dashboards.append(dashboard_dict[dashboard_id])
            kpi_info["dashboards"] = dashboards
            kpis.append(kpi_info)
        return jsonify({"count": len(kpis), "data": kpis})


@blueprint.route("/get-dashboard-list", methods=["GET"])
def get_all_kpis():
    """returning all kpis"""

    status, message = "success", ""
    timeline = request.args.get("timeline", "wow")
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
            aggregation_type = kpi.aggregation
            aggregate_data = kpi_aggregation(kpi.id, timeline)
            info["prev"] = round_number(
                aggregate_data.get("panel_metrics", {}).get("grp1_metrics", {}).get(aggregation_type, 0)
            )
            info["current"] = round_number(
                aggregate_data.get("panel_metrics", {}).get("grp2_metrics", {}).get(aggregation_type, 0)
            )
            info["change"] = round_number(info["current"] - info["prev"])

            info["timeline"] = TIME_DICT[timeline]["expansion"]
            info["anomaly_count"] = get_anomaly_count(kpi.id, timeline)
            info["graph_data"] = kpi_line_data(kpi.id)
            info["percentage_change"] = find_percentage_change(
                info["current"], info["prev"]
            )
            ret.append(info)
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


@blueprint.route("/<int:kpi_id>/kpi-aggregations", methods=["GET"])
def kpi_get_aggregation(kpi_id):
    data = []
    try:
        timeline = request.args.get("timeline")
        data = kpi_aggregation(kpi_id, timeline)
    except Exception as err:
        logger.info(f"Error Found: {err}")
    return jsonify({"data": data, "msg": ""})


@blueprint.route("/<int:kpi_id>/kpi-line-data", methods=["GET"])
def kpi_get_line_data(kpi_id):
    data = []
    try:
        data = kpi_line_data(kpi_id)
        for _row in data:
            date_timstamp = get_rca_timestamp(_row["date"])
            _row["date"] = get_epoch_timestamp(date_timstamp)
        formatted_date = data
    except Exception as err:
        logger.info(f"Error Found: {err}")
    return jsonify({"data": formatted_date, "msg": ""})


@blueprint.route("/<int:kpi_id>/rca-analysis", methods=["GET"])
def kpi_rca_analysis(kpi_id):
    logger.info(f"RCA Analysis Started for KPI ID: {kpi_id}")
    data = []
    try:
        timeline = request.args.get("timeline")
        dimension = request.args.get("dimension", None)
        data = rca_analysis(kpi_id, timeline, dimension)
    except Exception as err:
        logger.info(f"Error Found: {err}")
    logger.info("RCA Analysis Done")
    return jsonify({"data": data, "msg": ""})


@blueprint.route("/<int:kpi_id>/rca-hierarchical-data", methods=["GET"])
def kpi_rca_hierarchical_data(kpi_id):
    logger.info(f"RCA Analysis Started for KPI ID: {kpi_id}")
    data = []
    try:
        timeline = request.args.get("timeline")
        dimension = request.args.get("dimension", None)
        data = rca_hierarchical_data(kpi_id, timeline, dimension)
    except Exception as err:
        logger.info(f"Error Found: {err}")
    logger.info("RCA Analysis Done")
    return jsonify({"data": data, "msg": ""})


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
            for key, value in data.items():
                if chech_editable_field(meta_info, key):
                    setattr(kpi_obj, key, value)

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
        data["dashboard_list"] = dashboard_list
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


@cache.memoize()
def kpi_aggregation(kpi_id, timeline="mom"):
    try:
        kpi_info = get_kpi_data_from_id(kpi_id)
        end_date = get_rca_output_end_date(kpi_info)

        data_point = (
            RcaData.query.filter(
                (RcaData.kpi_id == kpi_id)
                & (RcaData.data_type == "agg")
                & (RcaData.timeline == timeline)
                & (RcaData.end_date <= end_date)
            )
            .order_by(RcaData.created_at.desc())
            .first()
        )

        if data_point:
            final_data = data_point.data
            final_data["analysis_date"] = get_analysis_date(kpi_id, end_date)
        else:
            final_data = {
                "panel_metrics": {},
                "line_chart_data": [],
                "insights": [],
                "analysis_date": "",
            }
    except Exception as err:
        logger.error(f"Error in KPI aggregation retrieval: {err}", exc_info=1)
    return final_data


@cache.memoize()
def kpi_line_data(kpi_id):
    try:
        kpi_info = get_kpi_data_from_id(kpi_id)
        end_date = get_rca_output_end_date(kpi_info)

        data_point = (
            RcaData.query.filter(
                (RcaData.kpi_id == kpi_id)
                & (RcaData.data_type == "line")
                & (RcaData.end_date <= end_date)
            )
            .order_by(RcaData.created_at.desc())
            .first()
        )

        final_data = data_point.data if data_point else []
    except Exception as err:
        logger.error(f"Error in KPI Line data retrieval: {err}", exc_info=1)
    return final_data


@cache.memoize()
def rca_analysis(kpi_id, timeline="mom", dimension=None):
    try:
        kpi_info = get_kpi_data_from_id(kpi_id)
        end_date = get_rca_output_end_date(kpi_info)

        data_point = (
            RcaData.query.filter(
                (RcaData.kpi_id == kpi_id)
                & (RcaData.data_type == "rca")
                & (RcaData.timeline == timeline)
                & (RcaData.end_date <= end_date)
                & (RcaData.dimension == dimension)
            )
            .order_by(RcaData.created_at.desc())
            .first()
        )

        if data_point:
            final_data = data_point.data
            final_data["analysis_date"] = get_analysis_date(kpi_id, end_date)
        else:
            final_data = {
                "chart": {"chart_data": [], "y_axis_lim": [], "chart_table": []},
                "data_table": [],
                "analysis_date": "",
            }
    except Exception as err:
        logger.error(f"Error in RCA Analysis retrieval: {err}", exc_info=1)
    return final_data


@cache.memoize()
def rca_hierarchical_data(kpi_id, timeline="mom", dimension=None):
    try:
        kpi_info = get_kpi_data_from_id(kpi_id)
        end_date = get_rca_output_end_date(kpi_info)

        data_point = (
            RcaData.query.filter(
                (RcaData.kpi_id == kpi_id)
                & (RcaData.data_type == "htable")
                & (RcaData.timeline == timeline)
                & (RcaData.end_date <= end_date)
                & (RcaData.dimension == dimension)
            )
            .order_by(RcaData.created_at.desc())
            .first()
        )

        if data_point:
            final_data = data_point.data
            final_data["analysis_date"] = get_analysis_date(kpi_id, end_date)
        else:
            final_data = {"data_table": [], "analysis_date": ""}
    except Exception as err:
        logger.error(f"Error in RCA hierarchical table retrieval: {err}", exc_info=1)
    return final_data


def get_rca_output_end_date(kpi_info: dict) -> date:
    end_date = None

    if kpi_info["is_static"]:
        end_date = kpi_info["static_params"].get("end_date")

    if end_date is None:
        return datetime.today().date()
    else:
        return datetime.strptime(end_date, "%Y-%m-%d").date()


def get_analysis_date(kpi_id: int, end_date: date) -> int:
    data_point = (
        RcaData.query.filter(
            (RcaData.kpi_id == kpi_id)
            & (RcaData.data_type == "line")
            & (RcaData.end_date <= end_date)
        )
        .order_by(RcaData.created_at.desc())
        .first()
    )
    final_data = data_point.data if data_point else []
    analysis_date = final_data[-1]["date"]
    analysis_timestamp = get_rca_timestamp(analysis_date)
    return get_epoch_timestamp(analysis_timestamp)


def find_percentage_change(curr_val, prev_val):

    if prev_val == 0:
        return "--"

    change = curr_val - prev_val
    percentage_change = (change / prev_val) * 100
    return str(round_number(percentage_change))


def get_anomaly_count(kpi_id, timeline):

    curr_date = datetime.now()
    lower_time_dt = curr_date - TIME_DICT[timeline]["time_delta"]

    # TODO: Add the series type filter
    anomaly_data = AnomalyDataOutput.query.filter(
        AnomalyDataOutput.kpi_id == kpi_id,
        AnomalyDataOutput.anomaly_type == "overall",
        AnomalyDataOutput.is_anomaly == 1,
        AnomalyDataOutput.data_datetime >= lower_time_dt,
    ).all()

    return len(anomaly_data)
