import csv
import io

from flask import Blueprint, Response, jsonify, request

from chaos_genius.controllers.kpi_controller import get_kpi_data_from_id
from chaos_genius.core.rca.rca_utils.api_utils import (
    kpi_line_data,
    rca_analysis,
    rca_hierarchical_data,
)
from chaos_genius.views.anomaly_data_view import get_overall_data_points

blueprint = Blueprint("downloads", __name__)


def iter_csv(data):
    line = io.StringIO()
    writer = csv.writer(line, delimiter=",")
    for csv_line in data:
        writer.writerow(csv_line)
        line.seek(0)
        yield line.read()
        line.truncate(0)
        line.seek(0)


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
                    row.data_datetime.strftime("%a %-d %B %H:%M:%S %Y"),
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
    """API endpoint to download chart data for last 60 days."""
    try:
        line_data = kpi_line_data(kpi, download=True)
        if line_data[0] == "error":
            raise Exception(f"{line_data[1]}")
        data_points = line_data[2]

        if not data_points:
            raise Exception(f"No chart data found for KPI id {kpi}")

        def row_gen(data_points):
            csv_headers = ["date", "value"]
            yield csv_headers
            for row in data_points:
                attr_list = [row["date"].strftime("%a %-d %B %Y"), str(row["value"])]
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


@blueprint.route("/<int:kpi_id>/hierarchial_data", methods=["GET"])
def download_hierarchial_data(kpi_id):
    """API endpoint to download RCA hierarchical data."""
    try:
        timeline = request.args.get("timeline")
        if not timeline:
            raise Exception("Please provide timeline as an argument")

        kpi_info = get_kpi_data_from_id(kpi_id)
        dimensions = kpi_info.get("dimensions")
        if not dimensions:
            raise Exception(f"Failed to fetch dimensions for kpi {kpi_id}")

        data_list = {}
        for dimension in dimensions:
            result = rca_hierarchical_data(kpi_id, timeline, dimension)
            if result[0] == "error":
                raise Exception(
                    f"failed to fetch heirarchial data for kpi {kpi_id} with dimension={dimension} - {result[1]}"
                )
            data_list[dimension] = result[2]['data_table']

        def row_gen(data_list):
            csv_headers = [
                "Dimension Name",
                "Hierarchy Level",
                "Sub-Group Name",
                "Previous Period Value",
                "Previous Period Count(#)",
                "Previous Period Size(%)",
                "Current Period Value",
                "Current Period Count(#)",
                "Current Period Size(%)",
                "Impact",
            ]
            yield csv_headers

            for dimension in data_list.keys():
                data = data_list[dimension]
                for row in data:
                    hlevel = len(row["subgroup"].split("&"))
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
            raise Exception("Please provide timeline as an argument")

        result = rca_analysis(kpi_id, timeline)
        if result[0] == "error":
            raise Exception("failed to fetch rca analysis data")
        data = result[2]["data_table"]

        def row_gen(data):
            csv_headers = [
                "Sub-Group Name",
                "Previous Period Value",
                "Previous Period Count(#)",
                "Previous Period Size(%)",
                "Current Period Value",
                "Current Period Count(#)",
                "Current Period Size(%)",
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
