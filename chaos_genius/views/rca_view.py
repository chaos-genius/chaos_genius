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
