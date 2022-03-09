# -*- coding: utf-8 -*-
"""Endpoints for data retrieval of computed RCAs."""
import logging

from flask import Blueprint, jsonify, request  # noqa: F401

from chaos_genius.core.rca.rca_utils.api_utils import (
    kpi_aggregation,
    kpi_line_data,
    rca_analysis,
    rca_hierarchical_data,
)
from dateutil import parser
from chaos_genius.controllers.kpi_controller import get_kpi_data_from_id
from chaos_genius.utils.datetime_helper import get_server_timezone
from chaos_genius.core.utils.constants import SUPPORTED_TIMEZONES
from chaos_genius.settings import TIMEZONE

blueprint = Blueprint("api_rca", __name__)
logger = logging.getLogger(__name__)


@blueprint.route("/<int:kpi_id>/kpi-aggregations", methods=["GET"])
def kpi_get_aggregation(kpi_id):
    """API endpoint for KPI aggregation data."""
    data = {}
    status = "success"
    message = ""
    try:
        timeline = request.args.get("timeline")

        status, message, data = kpi_aggregation(kpi_id, timeline)
    except Exception as err:  # noqa: B902
        logger.info(f"Error Found: {err}")
        status = "error"
        message = str(err)
    return jsonify({"status": status, "message": message, "data": data})


@blueprint.route("/<int:kpi_id>/kpi-line-data", methods=["GET"])
def kpi_get_line_data(kpi_id):
    """API endpoint for KPI line data."""
    data = []
    status = "success"
    message = ""
    try:
        status, message, data = kpi_line_data(kpi_id)
    except Exception as err:  # noqa: B902
        logger.info(f"Error Found: {err}")
        status = "error"
        message = str(err)
    return jsonify({"status": status, "message": message, "data": data})


@blueprint.route("/<int:kpi_id>/rca-analysis", methods=["GET"])
def kpi_rca_analysis(kpi_id):
    """API endpoint for RCA analysis data."""
    data = []
    status = "success"
    message = ""
    try:
        timeline = request.args.get("timeline")
        dimension = request.args.get("dimension", None)

        status, message, data = rca_analysis(kpi_id, timeline, dimension)
    except Exception as err:  # noqa: B902
        logger.info(f"Error Found: {err}")
        status = "error"
        message = str(err)
    return jsonify({"status": status, "message": message, "data": data})


@blueprint.route("/<int:kpi_id>/rca-hierarchical-data", methods=["GET"])
def kpi_rca_hierarchical_data(kpi_id):
    """API endpoint for RCA hierarchical data."""
    data = []
    status = "success"
    message = ""
    try:
        timeline = request.args.get("timeline")
        dimension = request.args.get("dimension", None)

        status, message, data = rca_hierarchical_data(
            kpi_id, timeline, dimension
        )
    except Exception as err:  # noqa: B902
        logger.info(f"Error Found: {err}")
        status = "error"
        message = str(err)
    return jsonify({"status": status, "message": message, "data": data})

@blueprint.route("/<int:kpi_id>/last_run_anomaly", methods=["GET","POST"])
def get_last_run_time_anomaly(kpi_id):
    kpi_info = get_kpi_data_from_id(kpi_id)
    tz_naive = parser.parse(kpi_info["scheduler_params"]["last_scheduled_time_anomaly"])
    server_tz = get_server_timezone()
    tz_aware = tz_naive.replace(tzinfo=server_tz)
    date_string = tz_aware.strftime("%d %b %Y")
    
    
    tz_offset = server_tz
    main_str = date_value.strftime("%d %b %Y") + f" {TIMEZONE}"
    return f"{main_str} ({tz_offset})" if tz_offset != "" else main_str

    
    return jsonify({"last_scheduled_time_anomaly" : tz_aware})