# -*- coding: utf-8 -*-
"""alert data view."""

import logging

from flask.blueprints import Blueprint
from flask.globals import request
from flask.json import jsonify

from chaos_genius.controllers.alert_controller import (
    ALERT_CHANNELS,
    get_alert_info,
    get_alert_list,
)
from chaos_genius.databases.db_utils import chech_editable_field
from chaos_genius.databases.models.alert_model import Alert
from chaos_genius.utils.pagination import pagination_args, pagination_info
from chaos_genius.utils.search import SEARCH_PARAM_NAME, make_search_filter

blueprint = Blueprint("alert", __name__)
logger = logging.getLogger(__name__)


TRUE_VALUES = {"true", "True", "1", True}


@blueprint.route("/", methods=["GET"])  # TODO: Remove this
@blueprint.route("", methods=["GET"])
def list_alert():
    """List the alert data."""
    channels_list = request.args.getlist("channel")
    actives_list = request.args.getlist("active")
    page, per_page = pagination_args(request)
    search_query, search_filter = make_search_filter(request, Alert.alert_name)

    filters = []
    if search_filter is not None:
        filters.append(search_filter)
    if channels_list and channels_list != [""]:
        filters.append(
            Alert.alert_channel.in_(
                [
                    channel
                    for channels in channels_list
                    for channel in channels.split(",")
                ]
            )
        )
    if actives_list and actives_list != [""]:
        filters.append(
            Alert.active.in_(
                [
                    active in TRUE_VALUES
                    for actives in actives_list
                    for active in actives.split(",")
                ]
            )
        )

    alerts_paginated = get_alert_list(
        page_num_size=(page, per_page), extra_filters=filters
    )

    return jsonify(
        {
            "data": alerts_paginated.items,
            "pagination": pagination_info(alerts_paginated),
            SEARCH_PARAM_NAME: search_query,
        }
    )


@blueprint.route("/<int:alert_id>/get-info", methods=["GET"])
def get_alert_info_by_id(alert_id):
    """Info of a single alert by ID."""
    status, message = "", ""
    data = None
    try:
        alert_obj = get_alert_info(alert_id)
        data = alert_obj
        status = "success"
        message = "Alert found Successfully"
    except Exception as err:  # noqa: B902
        status = "failure"
        message = str(err)
        logger.info(f"Error in fetching the Alert: {err}")
    return jsonify({"message": message, "status": status, "data": data})


@blueprint.route("/add", methods=["POST"])
def add_alert():
    """Add a new alert."""
    logger.info("add alert")
    # Handle logging in
    try:
        # TODO: Add the backend validation
        data = request.get_json()
        if data is None:
            return (
                jsonify(
                    {
                        "message": "The request payload is not in JSON format",
                        "status": "failure",
                    }
                ),
                400,
            )

        if data.get("alert_name") and data.get("alert_type"):
            new_alert = Alert(
                alert_name=data.get("alert_name"),
                alert_type=data.get("alert_type"),
                data_source=data.get("data_source"),
                alert_query=data.get("alert_query"),
                alert_settings=data.get("alert_settings"),
                kpi=data.get("kpi"),
                kpi_alert_type=data.get("kpi_alert_type"),
                severity_cutoff_score=data.get("severity_cutoff_score"),
                include_subdims=data.get("include_subdims", False),
                alert_message=data.get("alert_message"),
                alert_frequency=data.get("alert_frequency"),
                alert_channel=data.get("alert_channel"),
                alert_channel_conf=data.get("alert_channel_conf"),
                daily_digest=data.get("daily_digest", False),
                weekly_digest=data.get("weekly_digest", False),
                active=True,
            )
            new_alert.save(commit=True)
            return jsonify(
                {
                    "message": (
                        f"Alert {new_alert.alert_name} has been created "
                        + "successfully."
                    ),
                    "status": "success",
                    "data": {"alert_id": new_alert.id},
                }
            )
        else:
            return jsonify(
                {
                    "message": "Alert Name and Alert Type cannot be empty",
                    "status": "failure",
                }
            )
    except Exception as e:  # noqa: B902
        logger.info(f"Error in adding the Alert: {e}")
        return jsonify({"message": str(e), "status": "failure"})


@blueprint.route("/<int:alert_id>/update", methods=["PUT"])
def edit_alert(alert_id):
    """Edit an alert by ID."""
    status, message = "", ""
    try:
        alert_obj = Alert.get_by_id(alert_id)
        data = request.get_json()
        if data is None:
            return (
                jsonify(
                    {
                        "message": "The request payload was not a JSON",
                        "status": "failure",
                    }
                ),
                400,
            )

        meta_info = Alert.meta_info()
        if data.get("alert_name") and data.get("alert_type"):
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

    except Exception as err:  # noqa: B902
        status = "failure"
        logger.info(f"Error in updating the Alert: {err}")
        message = str(err)
    return jsonify({"message": message, "status": status})


@blueprint.route("/<int:alert_id>/disable", methods=["GET"])
def disable_alert(alert_id):
    """Disable an alert by ID."""
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
    except Exception as err:  # noqa: B902
        status = "failure"
        logger.info(f"Error in disabling the Alert: {err}")
    return jsonify({"message": message, "status": status})


@blueprint.route("/<int:alert_id>/enable", methods=["GET"])
def enable_alert(alert_id):
    """Enable an alert by ID."""
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
    except Exception as err:  # noqa: B902
        status = "failure"
        logger.info(f"Error in enabling the Alert: {err}")
    return jsonify({"message": message, "status": status})


@blueprint.route("/<int:alert_id>/delete", methods=["GET"])
def delete_alert(alert_id):
    """Delete an alert by ID."""
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
    except Exception as err:  # noqa: B902
        status = "failure"
        logger.info(f"Error in deleting the Alert: {err}")
    return jsonify({"message": message, "status": status})


@blueprint.route("/meta-info", methods=["GET"])
def alert_meta_info():
    """Info about fields in an alert."""
    logger.info("alert meta info")

    return jsonify({"data": Alert.meta_info(), "status": "success"})


@blueprint.route("/used-channel-types", methods=["GET"])
def get_used_channels():
    """Returns all channel types in use."""
    channels = [{"value": k, "label": v} for k, v in ALERT_CHANNELS.items()]
    return jsonify({"message": "", "status": "success", "data": channels})


@blueprint.route("/used-status-types", methods=["GET"])
def get_used_statuses():
    """Returns all status types in use."""
    statuses = [
        {"value": True, "label": "Active"},
        {"value": False, "label": "Inactive"},
    ]
    return jsonify({"message": "", "status": "success", "data": statuses})
