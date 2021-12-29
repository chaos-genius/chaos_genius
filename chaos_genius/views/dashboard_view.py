# -*- coding: utf-8 -*-
"""Base views for config settings and onboarding."""
from flask import Blueprint, request, jsonify
import datetime as dt
from chaos_genius.controllers.dashboard_controller import (
    create_dashboard,
    get_dashboard_dict_by_id,
    get_dashboard_by_id,
    edit_dashboard_kpis,
    get_dashboard_list as get_active_dashboard_list,
)
from chaos_genius.utils.modules_utils import is_enterprise_edition


blueprint = Blueprint("dashboard", __name__)


@blueprint.route("/create", methods=["POST"])
def create_new_dashboard():
    status, message = "", ""
    mapper_list_dict = []
    if not is_enterprise_edition():
        return jsonify({
            "status": "error",
            "message": "This feature is only available in the enterprise edition."
        }), 403
    try:
        payload = request.get_json()
        dashboard_name = payload.get("dashboard_name")
        if not dashboard_name:
            return jsonify({
                "status": "failure",
                "message": "Dashboard name is required"
            })
        kpi_list = payload.get("kpi_list", [])
        new_dashboard = create_dashboard(dashboard_name)
        new_dashboard.save(commit=True)
        if kpi_list:
            mapper_list_dict = edit_dashboard_kpis(new_dashboard.id, kpi_list)
        status = "success"
        message = "Dashboard has been created successfully"
    except Exception as e:
        status = "failure"
        message = "Failed to create dashboard :{}".format(e)

    return jsonify({
        "status": status,
        "message": message,
        "data": {
            "id": new_dashboard.id,
            "kpi_changes": mapper_list_dict
        }
    })


@blueprint.route("/edit", methods=["POST"])
def edit_dashboard():
    status, message = "", ""
    mapper_list_dict = []
    payload = request.get_json()
    dashboard_id = payload.get("dashboard_id")
    if not dashboard_id:
        return jsonify({
            "status": "failure",
            "message": "Dashboard id is required"
        })
    if int(dashboard_id) == 0:
        return jsonify({
            "status": "failure",
            "message": "Dashboard 'All' cannot be edited"
        })
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
    except Exception as e:
        status = "failure"
        message = "Error in editing dashboard: {}".format(e)
    return jsonify({
        "status": status,
        "message": message,
        "data": {
            "id": dashboard_id,
            "kpi_changes": mapper_list_dict
        }
    })


@blueprint.route("/get", methods=["GET"])
def get_dashboard():
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
    except Exception as e:
        status = "failure"
        message = "Failed to fetch dashboard details :{}".format(e)

    return jsonify({"status": status, "message": message, "dashboard": dashboard_dict})


@blueprint.route("/delete", methods=["POST"])
def delete_dashboard():
    status, message = "", ""
    dashboard_id = request.args.get("dashboard_id")
    if int(dashboard_id) == 0:
        return jsonify({
            "status": "failure",
            "message": "Dashboard 'All' cannot be deleted"
        })
    if not is_enterprise_edition():
        return jsonify({
            "status": "failure",
            "message": "This feature is only available in the enterprise edition."
        }), 403
    try:
        dashboard = get_dashboard_by_id(dashboard_id)
        if dashboard is not None:
            dashboard.active = False
            dashboard.save(commit=True)
            mapper_list_dict = edit_dashboard_kpis(dashboard_id, [])
            status = "success"
            message = " Dashboard deleted successfully"
        else:
            status = "failure"
            message = "Dashboard with the provided ID does not exist"
    except Exception as e:
        status = "failure"
        message = "Failed to delete dashboard :{}".format(e)

    return jsonify({"status": status, "message": message})


@blueprint.route("/list", methods=["GET"])
def get_dashboard_list():
    status, message = "", ""
    dashboard_list = []
    try:
        dashboards = get_active_dashboard_list()
        dashboard_list = sorted(dashboards, key=lambda x: len(x.get('kpis', [])), reverse=True)
        status = "success"

    except Exception as e:
        status = "failure"
        message = "Failed to fetch dashboard list :{}".format(e)
        dashboard_list = []
    return jsonify(
        {"status": status, "message": message, "data": dashboard_list}
    )
