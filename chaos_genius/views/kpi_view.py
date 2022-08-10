# -*- coding: utf-8 -*-
"""KPI views for creating and viewing the kpis."""
import logging
from typing import Any, Dict, List, Optional, Tuple

from flask.blueprints import Blueprint
from flask.globals import request
from flask.json import jsonify
from flask_sqlalchemy import Pagination
from sqlalchemy.orm.attributes import flag_modified

from chaos_genius.controllers.dashboard_controller import (
    create_dashboard_kpi_mapper,
    disable_mapper_for_kpi_ids,
    edit_kpi_dashboards,
    enable_mapper_for_kpi_ids,
    get_dashboard_list,
    get_dashboard_list_by_ids,
    get_mapper_obj_by_kpi_ids,
    kpi_dashboard_mapper_dict,
)
from chaos_genius.controllers.kpi_controller import (
    delete_anomaly_output_for_kpi,
    delete_rca_output_for_kpi,
    get_anomaly_count,
    get_kpi_data_from_id,
)
from chaos_genius.core.rca.constants import TIME_RANGES_BY_KEY
from chaos_genius.core.rca.rca_utils.api_utils import (
    kpi_aggregation,
    kpi_line_data,
)
from chaos_genius.core.utils.kpi_validation import validate_kpi
from chaos_genius.databases.db_utils import chech_editable_field
from chaos_genius.databases.models.dashboard_kpi_mapper_model import (
    DashboardKpiMapper,
)
from chaos_genius.databases.models.data_source_model import DataSource
from chaos_genius.databases.models.kpi_model import Kpi
from chaos_genius.extensions import db
from chaos_genius.settings import SUMMARY_DEEPDRILLS_ENABLED_TIME_RANGES
from chaos_genius.utils.pagination import pagination_args, pagination_info
from chaos_genius.utils.search import SEARCH_PARAM_NAME, make_search_filter

blueprint = Blueprint("api_kpi", __name__)
logger = logging.getLogger(__name__)


@blueprint.route("/", methods=["GET", "POST"])  # TODO: Remove this
@blueprint.route("", methods=["GET", "POST"])
def kpi():
    """List KPIs."""
    # Handle logging in
    if request.method == "POST":
        data = request.get_json()
        if data is None:
            return (
                jsonify(
                    {
                        "error": "The request payload is not in JSON format",
                        "status": "failure",
                    }
                ),
                400,
            )

        data["dimensions"] = (
            [] if data["dimensions"] is None else data["dimensions"]
        )

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
            count_column=data.get("count_column"),
            filters=data.get("filters"),
            dimensions=data.get("dimensions"),
            run_anomaly=True
        )
        # Perform KPI Validation
        status, message, tz_aware = validate_kpi(
            new_kpi.as_dict, check_tz_aware=True
        )
        if status is not True:
            return jsonify(
                {"error": message, "status": "failure", "is_critical": "true"}
            )

        new_kpi.timezone_aware = tz_aware

        new_kpi.save(commit=True)

        # Add the dashboard id 0 to the kpi
        dashboard_list = data.get("dashboards", []) + [0]
        dashboard_list = list(set(dashboard_list))
        create_dashboard_kpi_mapper(dashboard_list, [new_kpi.id])

        # TODO: Fix circular import error
        from chaos_genius.jobs.anomaly_tasks import ready_rca_task

        # run rca as soon as new KPI is added
        rca_task = ready_rca_task(new_kpi.id)
        if rca_task is None:
            logger.warn(
                "Could not run RCA task since newly added KPI was not found: "
                + f"{new_kpi.id}"
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
        # TODO: abstract this filter params extraction logic
        dashboard_ids_list = request.args.getlist("dashboard_id")
        datasource_types_list = request.args.getlist("datasource_type")

        paginate = request.args.get("paginate") != "false"

        page, per_page = pagination_args(request)
        search_query, search_filter = make_search_filter(request, Kpi.name)

        filters = [Kpi.active == True]  # noqa: E712
        if search_filter is not None:
            filters.append(search_filter)
        if datasource_types_list and datasource_types_list != [""]:
            filters.append(
                DataSource.connection_type.in_(
                    [
                        datasource_type
                        for datasource_types in datasource_types_list
                        for datasource_type in datasource_types.split(",")
                    ]
                )
            )

        kpis: List[Tuple[Kpi, DataSource]]
        kpis_paginated: Optional[Pagination] = None
        dashboard_ids: Optional[List[int]] = None

        if dashboard_ids_list and dashboard_ids_list != [""]:
            dashboard_ids = [
                int(dashboard_id)
                for dashboard_ids in dashboard_ids_list
                for dashboard_id in dashboard_ids.split(",")
            ]
            kpis_query = (
                db.session.query(Kpi, DataSource)
                .join(DataSource, Kpi.data_source == DataSource.id)
                .join(DashboardKpiMapper, Kpi.id == DashboardKpiMapper.kpi)
                .filter(
                    *filters,
                    DashboardKpiMapper.active == True,  # noqa: E712
                    DashboardKpiMapper.dashboard.in_(dashboard_ids),
                )
            )
            # TODO: refactor this to reduce code duplication
            if paginate:
                kpis_paginated_ = kpis_query.order_by(
                    Kpi.created_at.desc()
                ).paginate(page=page, per_page=per_page)
                kpis = kpis_paginated_.items
                kpis_paginated = kpis_paginated_
            else:
                kpis = kpis_query.all()
        else:
            kpis_query = (
                db.session.query(Kpi, DataSource)
                .join(DataSource, Kpi.data_source == DataSource.id)
                .filter(*filters)  # noqa: E712
            )
            if paginate:
                kpis_paginated_ = kpis_query.order_by(
                    Kpi.created_at.desc()
                ).paginate(page=page, per_page=per_page)
                kpis = kpis_paginated_.items
                kpis_paginated = kpis_paginated_
            else:
                kpis = kpis_query.all()

        kpi_dashboard_mapper = kpi_dashboard_mapper_dict(
            [kpi.id for kpi, _ in kpis], as_dict=True
        )

        kpi_infos: List[Dict[str, Any]] = []
        for row in kpis:
            kpi_info = row[0].safe_dict
            data_source_info = row[1].safe_dict
            kpi_info["data_source"] = data_source_info
            dashboards = kpi_dashboard_mapper[kpi_info["id"]]
            kpi_info["dashboards"] = dashboards
            kpi_infos.append(kpi_info)

        dashboards_data = get_dashboard_list(dashboard_ids=dashboard_ids)

        return jsonify(
            {
                "count": len(kpi_infos),
                "data": kpi_infos,
                "pagination": (
                    pagination_info(kpis_paginated)
                    if kpis_paginated is not None
                    else None
                ),
                "dashboards": dashboards_data,
                SEARCH_PARAM_NAME: search_query,
            }
        )


@blueprint.route("/get-dashboard-list", methods=["GET"])
def get_all_kpis():
    """List KPIs for a particular dashboard."""
    status, message = "success", ""

    timeline = request.args.get("timeline", "last_7_days")
    dashboard_ids_list = request.args.getlist("dashboard_id")

    page, per_page = pagination_args(request)
    search_query, search_filter = make_search_filter(request, Kpi.name)

    filters = [Kpi.active == True]  # noqa: E712
    if search_filter is not None:
        filters.append(search_filter)

    kpis_paginated: Optional[Pagination] = None
    ret = []

    try:
        if dashboard_ids_list and dashboard_ids_list != [""]:
            dashboard_ids = [
                int(dashboard_id)
                for dashboard_ids in dashboard_ids_list
                for dashboard_id in dashboard_ids.split(",")
            ]
            kpis_paginated_: Pagination = (
                Kpi.query.join(
                    DashboardKpiMapper, DashboardKpiMapper.kpi == Kpi.id
                )
                .filter(
                    *filters,
                    DashboardKpiMapper.active == True,  # noqa: E712
                    DashboardKpiMapper.dashboard.in_(dashboard_ids),
                )
                .order_by(Kpi.created_at.desc())
                .paginate(page=page, per_page=per_page)
            )
        else:
            kpis_paginated_: Pagination = (
                Kpi.query.filter(*filters)
                .order_by(Kpi.created_at.desc())
                .paginate(page=page, per_page=per_page)
            )
        # this is only required to let the type checker know that this is not None here
        kpis_paginated = kpis_paginated_

        metrics = ["name", "metric", "id"]
        for kpi in kpis_paginated.items:
            info = {key: getattr(kpi, key) for key in metrics}
            _, _, aggregate_data = kpi_aggregation(kpi.id, timeline)
            info["prev"] = aggregate_data["aggregation"][0]["value"]
            info["current"] = aggregate_data["aggregation"][1]["value"]
            info["change"] = aggregate_data["aggregation"][2]["value"]
            info["percentage_change"] = aggregate_data["aggregation"][3][
                "value"
            ]

            info["display_value_prev"] = TIME_RANGES_BY_KEY[timeline][
                "last_period_name"
            ]
            info["display_value_current"] = TIME_RANGES_BY_KEY[timeline][
                "current_period_name"
            ]
            info["anomaly_count"] = get_anomaly_count(kpi.id, timeline)
            _, _, info["graph_data"] = kpi_line_data(kpi.id)
            ret.append(info)

    except Exception as e:  # noqa: E722
        status = "failure"
        message = str(e)
        logger.error(message, exc_info=True)

    return jsonify(
        {
            "data": ret,
            "message": message,
            "status": status,
            "pagination": pagination_info(kpis_paginated)
            if kpis_paginated is not None
            else None,
            SEARCH_PARAM_NAME: search_query,
        }
    )


@blueprint.route("/get-timecuts-list", methods=["GET"])
def get_timecuts_list():
    """Returns all active timecuts."""
    status, message = "success", ""
    ret = {}
    try:
        enabled_cuts = [
            {**{k: v for k, v in value.items() if k != "function"}, "id": key}
            for key, value in TIME_RANGES_BY_KEY.items()
            if key in SUMMARY_DEEPDRILLS_ENABLED_TIME_RANGES
        ]
        ret = enabled_cuts
        message = "All timecuts fetched succesfully."
    except Exception as e:  # noqa: B902
        status = "failure"
        message = str(e)
        logger.error(message)
    return jsonify({"data": ret, "message": message, "status": status})


@blueprint.route("/<int:kpi_id>/disable", methods=["GET"])
def disable_kpi(kpi_id):
    """Disable a KPI."""
    status, message = "", ""
    try:
        kpi_obj = Kpi.get_by_id(kpi_id)
        if kpi_obj:
            kpi_obj.active = False
            kpi_obj.save(commit=True)
            disable_mapper_for_kpi_ids([kpi_id])
            status = "success"
        else:
            message = "KPI not found"
            status = "failure"
    except Exception as err:  # noqa: B902
        status = "failure"
        logger.info(f"Error in disabling the KPI: {err}")
    return jsonify({"message": message, "status": status})


@blueprint.route("/<int:kpi_id>/enable", methods=["GET"])
def enable_kpi(kpi_id):
    """Enable a KPI."""
    status, message = "", ""
    try:
        kpi_obj = Kpi.get_by_id(kpi_id)
        if kpi_obj:
            kpi_obj.active = True
            kpi_obj.save(commit=True)
            enable_mapper_for_kpi_ids([kpi_id])
            status = "success"
        else:
            message = "KPI not found"
            status = "failure"
    except Exception as err:  # noqa: B902
        status = "failure"
        logger.info(f"Error in enabling the KPI: {err}")
    return jsonify({"message": message, "status": status})


@blueprint.route("/<int:kpi_id>/get-dimensions", methods=["GET"])
def kpi_get_dimensions(kpi_id):
    """Retrieve list of dimensions of a KPI."""
    dimensions = []
    try:
        kpi_info = get_kpi_data_from_id(kpi_id)
        dimensions = kpi_info["dimensions"]
    except Exception as err:  # noqa: B902
        logger.info(f"Error Found: {err}")
    return jsonify({"dimensions": dimensions, "msg": ""})


@blueprint.route("/meta-info", methods=["GET"])
def kpi_meta_info():
    """Meta info of fields of KPI."""
    logger.info("kpi meta info")
    return jsonify({"data": Kpi.meta_info()})


@blueprint.route("/<int:kpi_id>/update", methods=["PUT"])
def edit_kpi(kpi_id):
    """Edit a KPI."""
    status, message = "", ""
    do_not_run_analytics_list = ["name", "dashboards"]
    run_analytics = False
    run_validation = False

    try:
        kpi_obj = Kpi.get_by_id(kpi_id)

        data = request.get_json()
        if data is None:
            raise Exception("Request body is not a JSON.")

        meta_info = Kpi.meta_info()
        if kpi_obj and kpi_obj.active is True:
            for key, value in data.items():
                if key not in do_not_run_analytics_list:
                    run_analytics = True
                    run_validation = True
                if chech_editable_field(meta_info, key):
                    setattr(kpi_obj, key, value)

            # check if dimensions are editted
            if "dimensions" in data.keys():
                # if empty, do not run anomaly on subdim
                if len(data["dimensions"]) < 1:
                    run_optional = {
                        "data_quality": True,
                        "overall": True,
                        "subdim": False,
                    }
                else:
                    run_optional = {
                        "data_quality": True,
                        "overall": True,
                        "subdim": True,
                    }
                if (kpi_obj.anomaly_params is not None) and (
                    "run_optional" not in kpi_obj.anomaly_params or (
                        kpi_obj.anomaly_params["run_optional"]["subdim"]
                        != run_optional["subdim"]
                    )
                ):
                    kpi_obj.anomaly_params["run_optional"] = run_optional
                    flag_modified(kpi_obj, "anomaly_params")
            if run_validation:
                status, message, tz_aware = validate_kpi(
                    kpi_obj.as_dict, check_tz_aware=True
                )
                if status is not True:
                    return jsonify(
                        {"error": message, "status": "failure", "is_critical": "true"}
                    )

            if run_analytics:
                logger.info(
                    "Deleting analytics output and re-running tasks since KPI was "
                    + f"edited for KPI ID: {kpi_id}"
                )

                from chaos_genius.jobs.anomaly_tasks import ready_rca_task

                rca_task = ready_rca_task(kpi_id)
                if rca_task is not None:
                    delete_rca_output_for_kpi(kpi_id)
                    rca_task.apply_async()
                    logger.info(
                        f"RCA started for KPI ID after editing: {kpi_id}"
                    )
                else:
                    logger.info(
                        "RCA failed for KPI ID since KPI does not exist after editing:"
                        + f" {kpi_id}"
                    )

                from chaos_genius.jobs.anomaly_tasks import ready_anomaly_task

                anomaly_task = ready_anomaly_task(kpi_id)
                if anomaly_task is not None:
                    delete_anomaly_output_for_kpi(kpi_id)
                    anomaly_task.apply_async()
                    logger.info(
                        f"Anomaly started for KPI ID after editing: {kpi_id}"
                    )
                else:
                    logger.info(
                        "Anomaly failed for KPI ID since KPI does not exist after "
                        + f"editing: {kpi_id}"
                    )

            if "dashboards" in data:
                dashboard_id_list = data.pop("dashboards", []) + [0]
                dashboard_id_list = list(set(dashboard_id_list))
                edit_kpi_dashboards(kpi_id, dashboard_id_list)

            kpi_obj.save(commit=True)
            status = "success"
        else:
            message = "KPI not found or disabled"
            status = "failure"
    except Exception as err:  # noqa: B902
        status = "failure"
        logger.error("Error in updating KPI: %d", kpi_id, exc_info=err)
        message = str(err)
    return jsonify({"message": message, "status": status})


@blueprint.route("/<int:kpi_id>", methods=["GET"])
def get_kpi_info(kpi_id):
    """Retrieve details of a KPI."""
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
    except Exception as err:  # noqa: B902
        status = "failure"
        message = str(err)
        logger.info(f"Error in fetching the KPI: {err}")
    return jsonify({"message": message, "status": status, "data": data})


@blueprint.route("/<int:kpi_id>/trigger-analytics", methods=["GET"])
def trigger_analytics(kpi_id):
    """Trigger analytics tasks for a KPI."""
    # TODO: Fix circular import error
    from chaos_genius.jobs.anomaly_tasks import (
        ready_anomaly_task,
        ready_rca_task,
    )

    rca_task = ready_rca_task(kpi_id)
    anomaly_task = ready_anomaly_task(kpi_id)
    if rca_task is not None and anomaly_task is not None:
        rca_task.apply_async()
        anomaly_task.apply_async()
    else:
        logger.warn(f"Could not analytics since KPI was not found: {kpi_id}")
    return jsonify({"message": "RCA and Anomaly triggered successfully"})
