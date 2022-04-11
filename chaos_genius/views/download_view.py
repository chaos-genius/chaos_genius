from flask import Blueprint, Response, jsonify, request

from chaos_genius.controllers.kpi_controller import get_kpi_data_from_id
from chaos_genius.core.rca.rca_utils.api_utils import (
    kpi_line_data,
    rca_analysis,
    rca_hierarchical_data_all_dims,
)
from chaos_genius.utils.utils import iter_csv
from chaos_genius.views.anomaly_data_view import get_overall_data_points

blueprint = Blueprint("downloads", __name__)


ANOMALY_DATA_DATETIME_FORMAT = "%a %-d %B %H:%M:%S %Y"
CHART_DATA_DATETIME_FORMAT = "%a %-d %B %Y"


@blueprint.route("/<int:kpi_id>/anomaly_data", methods=["GET"])
def download_anomaly_data(kpi_id: int):
    """API Endpoint to download overall KPI anomaly data in CSV form.

    Data is downloaded for the last 60 days by default
    """
    try:
        data_points = get_overall_data_points(kpi_id)
        if not data_points:
            raise Exception(f"No anomaly data found for KPI id {kpi_id}")

        def row_gen(data_points):
            csv_headers = [
                "datetime",
                "value",
                "severity",
                "upper_bound",
                "lower_bound",
                "series_type",
                "series_name",
            ]
            yield csv_headers
            for row in data_points:
                attr_list = [
                    row.data_datetime.strftime(ANOMALY_DATA_DATETIME_FORMAT),
                    str(row.y),
                    str(row.severity),
                    str(row.yhat_upper),
                    str(row.yhat_lower),
                    str(row.anomaly_type),
                    str(row.series_type),
                ]
                yield attr_list

        response = Response(iter_csv(row_gen(data_points)), mimetype="text/csv")
        response.headers[
            "Content-Disposition"
        ] = f"attachment; filename=KPI-{kpi_id}-anomaly-data.csv"
        return response
    except Exception as e:
        return jsonify(
            {"status": "failure", "message": f"Downloading data failed: {e}"}
        )


@blueprint.route("/<int:kpi>/chart_data", methods=["GET"])
def kpi_download_line_data(kpi: int):
    """API endpoint to download chart data."""
    try:
        status, message, data_points = kpi_line_data(kpi, download=True)
        if status == "error":
            raise Exception(message)

        if not data_points:
            raise Exception(f"No chart data found for KPI id {kpi}")

        def row_gen(data_points):
            csv_headers = ["date", "value"]
            yield csv_headers
            for row in data_points:
                attr_list = [
                    row["date"].strftime(CHART_DATA_DATETIME_FORMAT),
                    str(row["value"]),
                ]
                yield attr_list

        response = Response(iter_csv(row_gen(data_points)), mimetype="text/csv")
        response.headers[
            "Content-Disposition"
        ] = f"attachment; filename=KPI-{kpi}-panel-chart-data.csv"
        return response
    except Exception as e:
        return jsonify(
            {"status": "failure", "message": f"chart data download failed: {e}"}
        )


@blueprint.route("/<int:kpi_id>/hierarchical_data", methods=["GET"])
def download_hierarchical_data(kpi_id):
    """API endpoint to download RCA hierarchical data."""
    try:
        timeline = request.args.get("timeline")
        if not timeline:
            status = "failure"
            message = "Please provide timeline as an argument"
            return jsonify({"status": status, "message": message}), 400

        status, message, data_list = rca_hierarchical_data_all_dims(kpi_id, timeline)
        if status == "error":
            raise Exception(f"fetching hierarchical data failed - {message}")

        def row_gen(data_list):
            csv_headers = [
                "Dimension Name",
                "Hierarchy Level",
                "Sub-Group Name",
                "Previous Period Value",
                "Previous Period Count (#)",
                "Previous Period Size (%)",
                "Current Period Value",
                "Current Period Count (#)",
                "Current Period Size (%)",
                "Impact",
            ]
            yield csv_headers

            for data in data_list:
                dimension = data["dimension"]
                data_table = data["data_table"]
                for row in data_table:
                    hlevel = len(row["subgroup"].split(" & "))
                    attr_list = [
                        str(dimension),
                        str(hlevel),
                        str(row["subgroup"]),
                        str(row["g1_agg"]),
                        str(row["g1_count"]),
                        str(row["g1_size"]),
                        str(row["g2_agg"]),
                        str(row["g2_count"]),
                        str(row["g2_size"]),
                        str(row["impact"]),
                    ]
                    yield attr_list

        response = Response(iter_csv(row_gen(data_list)), mimetype="text/csv")
        response.headers[
            "Content-Disposition"
        ] = f"attachment; filename=KPI-{kpi_id}-DeepDrills.csv"
        return response
    except Exception as e:
        status = "failure"
        message = f"Error downloading hierarchical data: {e}"
        return jsonify({"status": status, "message": message})


@blueprint.route("/<int:kpi_id>/multidim_analysis_data", methods=["GET"])
def download_multidim_analysis_data(kpi_id):
    """API Endpoint to download multidim analysis table data."""
    try:
        timeline = request.args.get("timeline")
        if not timeline:
            status = "failure"
            message = "Please provide timeline as an argument"
            return jsonify({"status": status, "message": message}), 400

        status, message, result = rca_analysis(kpi_id, timeline)
        if status == "error":
            raise Exception(f"failed to fetch rca analysis data - {message}")
        data = result["data_table"]

        def row_gen(data):
            csv_headers = [
                "Sub-Group Name",
                "Previous Period Value",
                "Previous Period Count (#)",
                "Previous Period Size (%)",
                "Current Period Value",
                "Current Period Count (#)",
                "Current Period Size (%)",
                "Impact",
            ]
            yield csv_headers
            for row in data:
                attr_list = [
                    str(row["subgroup"]),
                    str(row["g1_agg"]),
                    str(row["g1_count"]),
                    str(row["g1_size"]),
                    str(row["g2_agg"]),
                    str(row["g2_count"]),
                    str(row["g2_size"]),
                    str(row["impact"]),
                ]
                yield attr_list

        response = Response(iter_csv(row_gen(data)), mimetype="text/csv")
        response.headers[
            "Content-Disposition"
        ] = f"attachment; filename=KPI-{kpi_id}-DeepDrills-multidim.csv"
        return response
    except Exception as e:
        status = "failure"
        message = f"Error downloading multidim analysis data: {e}"
        return jsonify({"status": status, "message": message})
