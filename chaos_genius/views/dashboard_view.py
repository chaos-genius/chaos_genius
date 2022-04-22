# -*- coding: utf-8 -*-
"""Base views for config settings and onboarding."""
import datetime as dt

from flask.blueprints import Blueprint
from flask.globals import request
from flask.json import jsonify

from chaos_genius.controllers.dashboard_controller import (
    DEFAULT_SORT_BY,
    SORTER_MAPPING,
    all_dashboard_names,
    create_dashboard,
    edit_dashboard_kpis,
    get_dashboard_by_id,
    get_dashboard_dict_by_id,
)
from chaos_genius.controllers.dashboard_controller import (
    get_dashboard_list as get_active_dashboard_list,
)
from chaos_genius.utils.modules_utils import is_enterprise_edition

blueprint = Blueprint("dashboard", __name__)


@blueprint.route("/create", methods=["POST"])
def create_new_dashboard():
    """Create a new dashboard."""
    status, message = "", ""

    new_dashboard_id = -1
    mapper_list_dict = []

    if not is_enterprise_edition():
        return (
            jsonify(
                {
                    "status": "error",
                    "message": (
                        "This feature is only available in the enterprise edition."
                    ),
                }
            ),
            403,
        )
    try:
        payload = request.get_json()
        if payload is None:
            return (
                jsonify(
                    {"status": "failure", "message": "Payload was not in JSON format."}
                ),
                400,
            )

        dashboard_name = payload.get("dashboard_name")
        if not dashboard_name:
            return (
                jsonify({"status": "failure", "message": "Dashboard name is required"}),
                400,
            )

        kpi_list = payload.get("kpi_list", [])
        new_dashboard = create_dashboard(dashboard_name)
        new_dashboard = new_dashboard.save(commit=True)
        new_dashboard_id = new_dashboard.id
        if kpi_list:
            mapper_list_dict = edit_dashboard_kpis(new_dashboard.id, kpi_list)
        status = "success"
        message = "Dashboard has been created successfully"
    except Exception as e:  # noqa: B902
        status = "failure"
        message = f"Failed to create dashboard: {e}"

    return jsonify(
        {
            "status": status,
            "message": message,
            "data": {"id": new_dashboard_id, "kpi_changes": mapper_list_dict},
        }
    )


@blueprint.route("/edit", methods=["POST"])
def edit_dashboard():
    """Update an existing dashboard."""
    status, message = "", ""
    mapper_list_dict = []
    payload = request.get_json()
    if payload is None:
        return (
            jsonify(
                {"status": "failure", "message": "Payload was not in JSON format."}
            ),
            400,
        )

    dashboard_id = payload.get("dashboard_id")
    if not dashboard_id:
        return (
            jsonify({"status": "failure", "message": "Dashboard id is required"}),
            400,
        )
    if int(dashboard_id) == 0:
        return (
            jsonify(
                {"status": "failure", "message": "Dashboard 'All' cannot be edited"}
            ),
            400,
        )

    dashboard_name = payload.get("dashboard_name")
    kpi_list = payload.get("kpi_list", [])

    try:
        dashboard_obj = get_dashboard_by_id(dashboard_id)
        if dashboard_obj is not None:
            if dashboard_name != dashboard_obj.name:
                dashboard_obj.name = dashboard_name

            mapper_list_dict = edit_dashboard_kpis(dashboard_obj.id, kpi_list)
            dashboard_obj.last_modified = dt.datetime.utcnow()
            dashboard_obj.save(commit=True)
            status = "success"
            message = "All changes saved successfully"
        else:
            status = "failure"
            message = "Dashboard with the provided ID does not exist"
    except Exception as e:  # noqa: B902
        status = "failure"
        message = "Error in editing dashboard: {}".format(e)

    return jsonify(
        {
            "status": status,
            "message": message,
            "data": {"id": dashboard_id, "kpi_changes": mapper_list_dict},
        }
    )


@blueprint.route("/get", methods=["GET"])
def get_dashboard():
    """Get a dashboard by ID."""
    status, message = "", ""
    dashboard_dict = {}
    try:
        dashboard_id = request.args.get("dashboard_id")
        dashboard_dict = get_dashboard_dict_by_id(dashboard_id)
        if dashboard_dict is not None:
            status = "success"
        else:
            status = "failure"
            message = "Dashboard with the provided ID does not exist"
            dashboard_dict = {}
    except Exception as e:  # noqa: B902
        status = "failure"
        message = "Failed to fetch dashboard details :{}".format(e)

    return jsonify({"status": status, "message": message, "dashboard": dashboard_dict})


@blueprint.route("/delete", methods=["POST"])
def delete_dashboard():
    """Delete a dashboard by ID."""
    status, message = "", ""
    dashboard_id = request.args.get("dashboard_id")
    if dashboard_id is None:
        return jsonify(
            {"status": "failure", "message": "Dashboard ID "}
        ), 400
    if int(dashboard_id) == 0:
        return jsonify(
            {"status": "failure", "message": "Dashboard 'All' cannot be deleted"}
        ), 400

    if not is_enterprise_edition():
        return (
            jsonify(
                {
                    "status": "failure",
                    "message": (
                        "This feature is only available in the enterprise edition."
                    ),
                }
            ),
            403,
        )
    try:
        dashboard = get_dashboard_by_id(dashboard_id)
        if dashboard is not None:
            dashboard.active = False
            dashboard.save(commit=True)
            edit_dashboard_kpis(dashboard_id, [])
            status = "success"
            message = " Dashboard deleted successfully"
        else:
            status = "failure"
            message = "Dashboard with the provided ID does not exist"
    except Exception as e:  # noqa: B902
        status = "failure"
        message = "Failed to delete dashboard :{}".format(e)

    return jsonify({"status": status, "message": message})


@blueprint.route("/list", methods=["GET"])
def get_dashboard_list():
    """List all dashboards."""
    status, message = "", ""
    sort_by = request.args.get("sort_by", DEFAULT_SORT_BY)
    if sort_by not in SORTER_MAPPING:
        return (
            jsonify(
                {
                    "status": "failure",
                    "message": (
                        f"{sort_by} was not a valid sort key. Must be one of "
                        + f"{', '.join(SORTER_MAPPING.keys())}"
                    ),
                }
            ),
            400,
        )

    dashboard_list = []
    try:
        dashboard_list = get_active_dashboard_list(sort_by=sort_by)
        status = "success"

    except Exception as e:  # noqa: B902
        status = "failure"
        message = "Failed to fetch dashboard list :{}".format(e)

    return jsonify({"status": status, "message": message, "data": dashboard_list})


@blueprint.route("/names", methods=["GET"])
def get_all_dashboard_names():
    """Return names of all active dashboards."""
    names_mapping = [
        {"value": name, "label": name, "id": id}
        for id, name in all_dashboard_names().items()
    ]
    return jsonify({"status": "success", "message": "", "data": names_mapping})
