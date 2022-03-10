"""Utility functions for RCA API endpoints."""
import logging
from datetime import date, datetime
from typing import List

from chaos_genius.controllers.kpi_controller import get_kpi_data_from_id
from chaos_genius.core.rca.constants import TIME_RANGES_BY_KEY
from chaos_genius.databases.models.rca_data_model import RcaData
from chaos_genius.utils.datetime_helper import (
    convert_datetime_to_timestamp,
    get_datetime_string_with_tz,
    get_lastscan_string_with_tz,
    get_rca_date_from_string,
)

logger = logging.getLogger(__name__)


def kpi_aggregation(kpi_id, timeline="last_30_days"):
    """Get KPI aggregation data."""
    final_data = {}
    status = "success"
    message = ""
    try:
        kpi_info = get_kpi_data_from_id(kpi_id)
        end_date = get_rca_output_end_date(kpi_info)

        data_point = (
            RcaData.query.filter(
                (RcaData.kpi_id == kpi_id)
                & (RcaData.data_type == "agg")
                & (RcaData.timeline == timeline)
                & (RcaData.end_date <= end_date)
            )
            .order_by(RcaData.created_at.desc())
            .first()
        )

        if data_point:
            analysis_date = get_analysis_date(kpi_id, end_date)
            final_data = {
                "aggregation": [
                    {
                        "label": "group1_value",
                        "value": data_point.data["group1_value"],
                    },
                    {
                        "label": "group2_value",
                        "value": data_point.data["group2_value"],
                    },
                    {
                        "label": "difference",
                        "value": data_point.data["difference"],
                    },
                    {
                        "label": "perc_change",
                        "value": data_point.data["perc_change"],
                    },
                ],
                "analysis_date": get_datetime_string_with_tz(analysis_date),
                "timecuts_date": get_timecuts_dates(analysis_date, timeline),
                "last_run_time_rca": get_lastscan_string_with_tz(
                    kpi_info["scheduler_params"]["last_scheduled_time_rca"]
                ),
            }
        else:
            raise ValueError("No data found")
    except Exception as err:  # noqa: B902
        logger.error(f"Error in KPI aggregation retrieval: {err}", exc_info=1)
        status = "error"
        message = str(err)
        final_data = {
            "aggregation": [
                {
                    "label": "group1_value",
                    "value": "-",
                },
                {
                    "label": "group2_value",
                    "value": "-",
                },
                {
                    "label": "difference",
                    "value": "-",
                },
                {
                    "label": "perc_change",
                    "value": "-",
                },
            ],
            "analysis_date": "",
        }
    return status, message, final_data


def kpi_line_data(kpi_id):
    """Get KPI line data."""
    final_data = []
    status = "success"
    message = ""
    try:
        kpi_info = get_kpi_data_from_id(kpi_id)
        end_date = get_rca_output_end_date(kpi_info)

        data_point = (
            RcaData.query.filter(
                (RcaData.kpi_id == kpi_id)
                & (RcaData.data_type == "line")
                & (RcaData.end_date <= end_date)
            )
            .order_by(RcaData.created_at.desc())
            .first()
        )

        if not data_point:
            raise ValueError("No data found.")

        final_data = data_point.data
        for row in final_data:
            row["date"] = convert_datetime_to_timestamp(
                get_rca_date_from_string(row["date"])
            )
    except Exception as err:  # noqa: B902
        logger.error(f"Error in KPI Line data retrieval: {err}", exc_info=1)
        status = "error"
        message = str(err)
    return status, message, final_data


def rca_analysis(kpi_id, timeline="last_30_days", dimension=None):
    """Get RCA analysis data."""
    final_data = {}
    status = "success"
    message = ""
    try:
        kpi_info = get_kpi_data_from_id(kpi_id)
        end_date = get_rca_output_end_date(kpi_info)

        data_point = (
            RcaData.query.filter(
                (RcaData.kpi_id == kpi_id)
                & (RcaData.data_type == "rca")
                & (RcaData.timeline == timeline)
                & (RcaData.end_date <= end_date)
                & (RcaData.dimension == dimension)
            )
            .order_by(RcaData.created_at.desc())
            .first()
        )

        if data_point:
            final_data = data_point.data
            final_data["analysis_date"] = get_datetime_string_with_tz(
                get_analysis_date(kpi_id, end_date)
            )
        else:
            raise ValueError("No data found.")
    except Exception as err:  # noqa: B902
        logger.error(f"Error in RCA Analysis retrieval: {err}", exc_info=1)
        status = "error"
        message = str(err)
        final_data = {
            "chart": {
                "chart_data": [],
                "y_axis_lim": [],
                "chart_table": [],
            },
            "data_table": [],
            "analysis_date": "",
        }
    return status, message, final_data


def rca_hierarchical_data(kpi_id, timeline="last_30_days", dimension=None):
    """Get RCA hierarchical data."""
    final_data = {}
    status = "success"
    message = ""
    try:
        kpi_info = get_kpi_data_from_id(kpi_id)
        end_date = get_rca_output_end_date(kpi_info)

        data_point = (
            RcaData.query.filter(
                (RcaData.kpi_id == kpi_id)
                & (RcaData.data_type == "htable")
                & (RcaData.timeline == timeline)
                & (RcaData.end_date <= end_date)
                & (RcaData.dimension == dimension)
            )
            .order_by(RcaData.created_at.desc())
            .first()
        )

        if data_point:
            final_data = data_point.data
            final_data["analysis_date"] = get_datetime_string_with_tz(
                get_analysis_date(kpi_id, end_date)
            )
        else:
            raise ValueError("No data found.")
    except Exception as err:  # noqa: B902
        logger.error(
            f"Error in RCA hierarchical table retrieval: {err}", exc_info=1
        )
        status = "error"
        message = str(err)
        final_data = {"data_table": [], "analysis_date": ""}
    return status, message, final_data


def get_rca_output_end_date(kpi_info: dict) -> date:
    """Get RCA end date."""
    end_date = None

    if kpi_info["is_static"]:
        end_date = kpi_info["static_params"].get("end_date")

    if end_date is None:
        return datetime.today().date()
    else:
        return datetime.strptime(end_date, "%Y-%m-%d").date()


def get_analysis_date(kpi_id: int, end_date: date) -> date:
    """Get analysis date for RCA."""
    data_point = (
        RcaData.query.filter(
            (RcaData.kpi_id == kpi_id)
            & (RcaData.data_type == "line")
            & (RcaData.end_date <= end_date)
        )
        .order_by(RcaData.created_at.desc())
        .first()
    )
    final_data = data_point.data if data_point else []
    analysis_date = final_data[-1]["date"]
    return get_rca_date_from_string(analysis_date)


def get_timecuts_dates(analysis_date: date, timeline: str) -> List:
    """Get timecuts dates for RCA."""
    (g1_sd, g1_ed), (g2_sd, g2_ed) = TIME_RANGES_BY_KEY[timeline]["function"](
        analysis_date
    )

    output = [
        {
            "label": "group1_value",
            "start_date": g1_sd,
            "end_date": g1_ed,
        },
        {
            "label": "group2_value",
            "start_date": g2_sd,
            "end_date": g2_ed,
        },
    ]

    if timeline == "previous_day":
        del output[0]["start_date"]
        del output[1]["start_date"]

    return output
