# -*- coding: utf-8 -*-
"""Endpoints for data retrieval of computed RCAs."""
import csv
import io
import logging

from flask import Blueprint, jsonify, request, send_file  # noqa: F401

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


@blueprint.route("/<int:kpi>/download_chart_data", methods=["GET"])
def kpi_download_line_data(kpi: int):
    """API endpoint to download chart data for last 60 days."""
    try:
        line_data = kpi_line_data(kpi, download=True)
        if line_data[0] == "error":
            raise Exception(f"{line_data[1]}")
        data_points = line_data[2]

        if not data_points:
            raise Exception(f"No chart data found for KPI id {kpi}")
        output_csv_obj = io.StringIO()
        csv_headers = ["date", "value"]
        csvwriter = csv.writer(output_csv_obj, delimiter=",")
        csvwriter.writerow(csv_headers)
        for row in data_points:
            attr_list = [row["date"].strftime("%a %-d %B %Y"), str(row["value"])]
            csvwriter.writerow(attr_list)

        output_csv_obj.seek(0)
        output_csv_str = output_csv_obj.read().encode("utf-8")
        output_csv_bytes = io.BytesIO(output_csv_str)
        output_csv_obj.close()

        return send_file(
            output_csv_bytes,
            mimetype="text/csv",
            attachment_filename=f"KPI-{kpi}-panel-chart-data.csv",
            as_attachment=True,
        )
    except Exception as e:
        return jsonify(
            {"status": "failure", "message": f"chart data download failed: {e}"}
        )


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
