# -*- coding: utf-8 -*-
"""alert data view."""
from chaos_genius.databases.models.alert_model import Alert
from datetime import datetime, timedelta

from flask import (
    Blueprint,
    current_app,
    flash,
    redirect,
    render_template,
    request,
    url_for,
    jsonify
)
from chaos_genius.controllers.alert_controller import get_alert_list, get_alert_info
from chaos_genius.databases.db_utils import chech_editable_field

blueprint = Blueprint("alert", __name__)


@blueprint.route("/", methods=["GET"])
def list_alert():
    """List the alert data."""
    results = get_alert_list()
    return jsonify({"data": results})

@blueprint.route("/<int:alert_id>/get-info", methods=["GET"])
def get_alert_info_by_id(alert_id):
    """get alert details."""
    status, message = "", ""
    data = None
    try:
        alert_obj = get_alert_info(alert_id)
        data = alert_obj
        status = "success" 
        message = "Alert found Successfully"
    except Exception as err:
        status = "failure"
        message = str(err)
        current_app.logger.info(f"Error in fetching the Alert: {err}")
    return jsonify({"message": message, "status": status, "data":data})


@blueprint.route("/add", methods=["POST"])
def add_alert():
    """alert add view."""
    current_app.logger.info("add alert")
    # Handle logging in
    try:
        if request.is_json:
            # TODO: Add the backend validation
            data = request.get_json()
            if(data.get('alert_name') and data.get('alert_type')):
                new_alert = Alert(
                    alert_name=data.get('alert_name'),
                    alert_type=data.get('alert_type'),
                    data_source=data.get('data_source'),
                    alert_query=data.get('alert_query'),
                    alert_settings=data.get('alert_settings'),
                    kpi=data.get('kpi'),
                    kpi_alert_type=data.get('kpi_alert_type'),
                    severity_cutoff_score=data.get('severity_cutoff_score'),
                    alert_message=data.get('alert_message'),
                    alert_frequency=data.get('alert_frequency'),
                    alert_channel=data.get('alert_channel'),
                    alert_channel_conf=data.get('alert_channel_conf'),
                    active=True
                )
                new_alert.save(commit=True)
                return jsonify({"message": f"Alert {new_alert.alert_name} has been created successfully.", "status": "success", "data":{"alert_id": new_alert.id}})
            else:
                return jsonify({"message": "Alert Name and Alert Type cannot be empty", "status": "failure"})

        else:
            return jsonify({"message": "The request payload is not in JSON format", "status": "failure"})
    except Exception as e:
        current_app.logger.info(f"Error in adding the Alert: {e}")
        return jsonify({"message": str(e), "status": "failure"})


@blueprint.route("/<int:alert_id>/update", methods=["PUT"])
def edit_alert(alert_id):
    """edit alert details."""
    status, message = "", ""
    try:
        alert_obj = Alert.get_by_id(alert_id)
        data = request.get_json()
        meta_info = Alert.meta_info()
        if(data.get('alert_name') and data.get('alert_type')):
            if alert_obj:
                for key, values in data.items():
                    if chech_editable_field(meta_info, key):
                        setattr(alert_obj, key, values)
                alert_obj.save(commit=True)
                status = "success"
                message = "Alert updated successfully"
            else:
                message = "Alert not found"
                status = "failure"
        else:
            message = "Alert Name or Type cannot be empty"
            status = "failure"

    except Exception as err:
        status = "failure"
        current_app.logger.info(f"Error in updating the Alert: {err}")
        message = str(err)
    return jsonify({"message": message, "status": status})


@blueprint.route("/<int:alert_id>/disable", methods=["GET"])
def disable_alert(alert_id):
    """disable alert details."""
    status, message = "", ""
    try:
        alert_obj = Alert.get_by_id(alert_id)
        if alert_obj:
            alert_obj.active = False
            alert_obj.save(commit=True)
            message = "Alert disabled Successfully"
            status = "success"
        else:
            message = "Alert not found"
            status = "failure"
    except Exception as err:
        status = "failure"
        current_app.logger.info(f"Error in disabling the Alert: {err}")
    return jsonify({"message": message, "status": status})


@blueprint.route("/<int:alert_id>/enable", methods=["GET"])
def enable_alert(alert_id):
    """enable alert details."""
    status, message = "", ""
    try:
        alert_obj = Alert.get_by_id(alert_id)
        if alert_obj:
            alert_obj.active = True
            alert_obj.save(commit=True)
            message = "Alert enabled Successfully"
            status = "success"
        else:
            message = "Alert not found"
            status = "failure"
    except Exception as err:
        status = "failure"
        current_app.logger.info(f"Error in enabling the Alert: {err}")
    return jsonify({"message": message, "status": status})


@blueprint.route("/<int:alert_id>/delete", methods=["GET"])
def delete_alert(alert_id):
    """delete alert."""
    status, message = "", ""
    try:
        alert_obj = Alert.get_by_id(alert_id)
        if alert_obj:
            alert_obj.active = False
            alert_obj.alert_status = False
            alert_obj.save(commit=True)
            message = "Alert deleted Successfully"
            status = "success"
        else:
            message = "Alert not found"
            status = "failure"
    except Exception as err:
        status = "failure"
        current_app.logger.info(f"Error in deleting the Alert: {err}")
    return jsonify({"message": message, "status": status})


@blueprint.route("/meta-info", methods=["GET"])
def alert_meta_info():
    """alert meta info view."""
    current_app.logger.info("alert meta info")
    return jsonify({"data": Alert.meta_info(), "status":"success"})
