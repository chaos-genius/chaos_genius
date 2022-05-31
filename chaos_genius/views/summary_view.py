# -*- coding: utf-8 -*-
"""Endpoints for data retrieval of computed summaries of KPIs."""
import logging

from flask import Blueprint, jsonify, request

from chaos_genius.core.rca.rca_utils.api_utils import kpi_aggregation, kpi_line_data

blueprint = Blueprint("api_summary", __name__)
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
