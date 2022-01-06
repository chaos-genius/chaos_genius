# -*- coding: utf-8 -*-
"""KPI views for creating and viewing the kpis."""
import logging

from flask import Blueprint, jsonify, request  # noqa: F401

from chaos_genius.core.rca.rca_utils.api_utils import (
    kpi_aggregation,
    kpi_line_data,
    rca_analysis,
    rca_hierarchical_data,
)
from chaos_genius.utils.datetime_helper import get_epoch_timestamp, get_rca_timestamp

blueprint = Blueprint("api_rca", __name__)
logger = logging.getLogger(__name__)


@blueprint.route("/<int:kpi_id>/kpi-aggregations", methods=["GET"])
def kpi_get_aggregation(kpi_id):
    """API endpoint for KPI aggregation data."""
    data = []
    try:
        timeline = request.args.get("timeline")
        data = kpi_aggregation(kpi_id, timeline)
    except Exception as err:  # noqa: B902
        logger.info(f"Error Found: {err}")
    return jsonify({"data": data, "msg": ""})


@blueprint.route("/<int:kpi_id>/kpi-line-data", methods=["GET"])
def kpi_get_line_data(kpi_id):
    """API endpoint for KPI line data."""
    data = []
    try:
        data = kpi_line_data(kpi_id)
        for _row in data:
            date_timstamp = get_rca_timestamp(_row["date"])
            _row["date"] = get_epoch_timestamp(date_timstamp)
        formatted_date = data
    except Exception as err:  # noqa: B902
        logger.info(f"Error Found: {err}")
    return jsonify({"data": formatted_date, "msg": ""})


@blueprint.route("/<int:kpi_id>/rca-analysis", methods=["GET"])
def kpi_rca_analysis(kpi_id):
    """API endpoint for RCA analysis data."""
    logger.info(f"RCA Analysis Started for KPI ID: {kpi_id}")
    data = []
    try:
        timeline = request.args.get("timeline")
        dimension = request.args.get("dimension", None)
        data = rca_analysis(kpi_id, timeline, dimension)
    except Exception as err:  # noqa: B902
        logger.info(f"Error Found: {err}")
    logger.info("RCA Analysis Done")
    return jsonify({"data": data, "msg": ""})


@blueprint.route("/<int:kpi_id>/rca-hierarchical-data", methods=["GET"])
def kpi_rca_hierarchical_data(kpi_id):
    """API endpoint for RCA hierarchical data."""
    logger.info(f"RCA Analysis Started for KPI ID: {kpi_id}")
    data = []
    try:
        timeline = request.args.get("timeline")
        dimension = request.args.get("dimension", None)
        data = rca_hierarchical_data(kpi_id, timeline, dimension)
    except Exception as err:  # noqa: B902
        logger.info(f"Error Found: {err}")
    logger.info("RCA Analysis Done")
    return jsonify({"data": data, "msg": ""})
