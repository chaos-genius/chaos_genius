# -*- coding: utf-8 -*-
"""Base views for config settings and onboarding."""
from flask import Blueprint, current_app, request, jsonify
import datetime as dt
from chaos_genius.controllers.dashboard_controller import (
    create_dashboard,
    get_dashboard_dict_by_id,
    get_dashboard_by_id,
    edit_dashboard_kpis,
    get_dashboard_list as get_active_dashboard_list,
)


blueprint = Blueprint("dashboard", __name__)


@blueprint.route("/create_dashboard", methods=["POST"])
def create_new_dashboard():
    status, message = "", ""
    try:
        body = request.get_json()
        dashboard_name = body["dashboard_name"]
        kpi_list = body["kpi_list"]
        new_dashboard = create_dashboard(dashboard_name)
        new_dashboard.save(commit=True)
        mapper_list_dict = edit_dashboard_kpis(new_dashboard.id,[],kpi_list)
        mapper_list = mapper_list_dict["mapper_add_list"]
        for mapper in mapper_list:
            mapper.save(commit=True)
        status = "success"
        message = "Dashboard has been created successfully"
    except Exception as e:
        status = "failure"
        message = "Failed to create dashboard :{}".format(e)

    return jsonify({"status": status, "message": message})


@blueprint.route("/edit_dashboard", methods=["POST"])
def edit_dashboard():
    status, message = "",""
    try:
        body = request.get_json()
        dashboard_id = body["dashboard_id"]
        dashboard_name = body["dashboard_name"]
        kpi_delete_list = body["kpi_delete_list"]
        kpi_add_list = body["kpi_add_list"]

        dashboard_obj = get_dashboard_by_id(dashboard_id)
        if dashboard_name != dashboard_obj.name:
            dashboard_obj.name = dashboard_name

        mapper_list_dict = edit_dashboard_kpis(dashboard_obj.id,kpi_delete_list,kpi_add_list)
        for mapper_obj in mapper_list_dict["mapper_delete_list"]:
            mapper_obj.active = False
            mapper_obj.save(commit=True)

        for mapper_obj in mapper_list_dict["mapper_add_list"]:
            mapper_obj.save(commit=True)

        dashboard_obj.last_modified = dt.datetime.utcnow
        dashboard_obj.save(commit=True)
        status = "success"
        message = "All changes successfully saved"
    except Exception as e:
        status = "failure"
        message = "Error in editing dashboard: {}".format(e)
    return jsonify({"status":status, "message":message})


@blueprint.route("/get_dashboard", methods=["GET"])
def get_dashboard():
    status, message = "", ""
    dashboard_dict = {}
    try:
        body = request.get_json()
        dashboard_id = body["dashboard_id"]
        dashboard_dict = get_dashboard_dict_by_id(dashboard_id)
        status = "success"
    except Exception as e:
        status = "failure"
        message = "Failed to fetch dashboard details :{}".format(e)

    return jsonify(
        {"status": status, "message": message, "dashboard_dict": dashboard_dict}
    )


@blueprint.route("/delete_dashboard", methods=["POST"])
def delete_dashboard():
    status, message = "", ""
    try:
        body = request.get_json
        dashboard_id = body["dashboard_id"]
        dashboard = get_dashboard_by_id(dashboard_id)
        dashboard.active = False
        dashboard.save(commit=True)
        status = "success"
        message = " Dashboard deleted successfully"
    except Exception as e:
        status = "failure"
        message = "Failed to delete dashboard :{}".format(e)

    return jsonify({"status": status, "message": message})


@blueprint.route("/get_dashboard_list", methods=["GET"])
def get_dashboard_list():
    status, message = "", ""
    dashboard_list = []
    try:
        dashboard_list = get_active_dashboard_list()
        status = "success"

    except Exception as e:
        status = "failure"
        message = "Failed to fetch dashboard list :{}".format(e)

    return jsonify(
        {"status": status, "message": message, "dashboard_list": dashboard_list}
    )
