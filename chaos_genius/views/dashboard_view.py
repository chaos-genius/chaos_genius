# -*- coding: utf-8 -*-
"""Base views for config settings and onboarding."""
from flask import Blueprint, current_app, request, jsonify

from chaos_genius.controllers.dashboard_controller import (
    create_dashboard,
    get_dashboard_dict_by_id,
    get_dashboard_by_id,
    get_dashboard_list as get_active_dashboard_list,
)


blueprint = Blueprint("dashboard", __name__)


@blueprint.route("/create_dashboard", methods=["POST"])
def create_new_dashboard():
    status, message = "", ""
    try:
        body = request.get_json()
        name = body["name"]
        kpi_list = body["kpi_list"]
        new_dashboard_dict = create_dashboard(name, kpi_list)
        new_dashboard = new_dashboard_dict["dashboard"]
        mapper_list = new_dashboard_dict["mapper_list"]
        new_dashboard.save(commit=True)
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
    return jsonify({})


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
