"""Common utilities for alerts and alert digests."""

import datetime
import heapq
import os
from typing import Dict, List, Tuple, Union

from jinja2 import Environment, FileSystemLoader, select_autoescape

from chaos_genius.alerts.constants import (
    ALERT_DATETIME_FORMAT,
    ALERT_READABLE_DATE_FORMAT,
    ALERT_READABLE_DATETIME_FORMAT,
    ANOMALY_TABLE_COLUMNS_HOLDING_FLOATS,
    OVERALL_KPI_SERIES_TYPE_REPR,
)
from chaos_genius.alerts.email import send_static_alert_email
from chaos_genius.core.rca.rca_utils.string_helpers import (
    convert_query_string_to_user_string,
)
from chaos_genius.core.utils.round import round_number
from chaos_genius.settings import CHAOSGENIUS_WEBAPP_URL


class AlertException(Exception):
    """A general exception in a specific alert.

    Stores and prints alert ID and KPI ID.
    """
    def __init__(self, message: str, alert_id: int, kpi_id: int = None):
        """Initialize a new alert exception.

        Args:
            message: exception message.
            alert_id: ID of alert where this originated from.
            kpi_id: ID of KPI associated with the alert.
        """
        if kpi_id:
            message = f"(KPI: {kpi_id}, Alert: {alert_id}) {message}"
        else:
            message = f"(Alert: {alert_id}) {message}"

        super().__init__(message)


def webapp_url_prefix():
    """Constructs webapp URL prefix with a trailing slash.

    If not setup, this will be an invalid URL with an appropriate message.

    TODO: redirect to docs link showing how to setup instead of invalid URL.
    """
    if not CHAOSGENIUS_WEBAPP_URL:
        return "Webapp URL not setup. Please setup CHAOSGENIUS_WEBAPP_URL in the environment file./"

    forward_slash = "/" if not CHAOSGENIUS_WEBAPP_URL[-1] == "/" else ""
    return f"{CHAOSGENIUS_WEBAPP_URL}{forward_slash}"


def save_anomaly_point_formatting(points: List[Dict], frequency: str = None):
    """Adds formatted fields to each point, to be used in alert templates."""
    for point in points:
        dt = datetime.datetime.strptime(point["data_datetime"], ALERT_DATETIME_FORMAT)

        dt_format = ALERT_READABLE_DATETIME_FORMAT
        if frequency is not None and frequency == "D":
            dt_format = ALERT_READABLE_DATE_FORMAT

        date = dt.strftime(dt_format)
        point["formatted_date"] = date

        change_percent = point["percentage_change"]
        change_message = change_percent
        if isinstance(change_percent, (int, float)):
            if change_percent > 0:
                change_message = f"+{change_percent}%"
            else:
                change_message = f"{change_percent}%"
        point["change_message"] = change_message


def top_anomalies(points: List[Dict], n=10) -> List[Dict]:
    """Returns top n anomalies according to severity."""
    return heapq.nlargest(n, points, key=lambda point: point["severity"])


def count_anomalies(points: List[Dict]) -> Tuple[int, int]:
    """Returns a count of overall anomalies and subdim anomalies."""
    total = len(points)
    overall = sum(
        1 for point in points if point["Dimension"] == OVERALL_KPI_SERIES_TYPE_REPR
    )
    subdims = total - overall
    return overall, subdims


def change_message_from_percent(percent_change: Union[str, int, float]) -> str:
    """Creates a change message from given percentage change.

    percent_change will be:
        - "–" in case the last data point was missing or both the points had values 0
        - 0 (int) in case there was no change
        - positive value (int/float) in case there was an increase
        - negative value (int/float) in case there was a decrease
    """
    if isinstance(percent_change, str):
        return percent_change
    elif percent_change == 0:
        return "No change (–)"
    elif percent_change > 0:
        return f"Increased by ({percent_change}%)"
    else:
        return f"Decreased by ({percent_change}%)"


def format_anomaly_points(points: List[dict]):
    for anomaly_point in points:
        anomaly_point["series_type"] = (
            OVERALL_KPI_SERIES_TYPE_REPR
            if anomaly_point.get("anomaly_type") == "overall"
            else anomaly_point["series_type"]
        )
        for key, value in anomaly_point.items():
            if key in ANOMALY_TABLE_COLUMNS_HOLDING_FLOATS:
                anomaly_point[key] = round(value, 2)
        if anomaly_point["series_type"] != OVERALL_KPI_SERIES_TYPE_REPR:
            anomaly_point["series_type"] = convert_query_string_to_user_string(
                anomaly_point["series_type"]
            )


def find_percentage_change(
    curr_val: Union[int, float], prev_val: Union[int, float]
) -> Union[int, float, str]:
    """Calculates percentage change between previous and current value."""
    if prev_val is None:
        # previous point wasn't found
        return "–"
    elif curr_val == 0 and prev_val == curr_val:
        # previous data is same as current and both of them are 0
        return "–"
    elif prev_val == 0:
        # previous point was 0
        sign_ = "+" if curr_val > 0 else "-"
        return sign_ + "inf"
    else:
        change = curr_val - prev_val
        percentage_change = (change / prev_val) * 100
        return round_number(percentage_change)


def send_email_using_template(
    template: str,
    recipient_emails: List[str],
    subject: str,
    files: List[dict],
    alert_info: dict,
    **kwargs,
):
    """Sends an email using a template."""
    path = os.path.join(os.path.dirname(__file__), "email_templates")
    env = Environment(
        loader=FileSystemLoader(path), autoescape=select_autoescape(["html", "xml"])
    )

    template = env.get_template(template)
    test = send_static_alert_email(
        recipient_emails, subject, template.render(**kwargs), alert_info, files
    )

    return test
