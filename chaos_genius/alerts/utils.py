"""Common utilities for alerts and alert digests."""

import datetime
import heapq
from typing import Dict, List, Tuple, Union

from chaos_genius.alerts.constants import (
    ALERT_DATETIME_FORMAT,
    ALERT_READABLE_DATETIME_FORMAT,
)
from chaos_genius.settings import CHAOSGENIUS_WEBAPP_URL


def webapp_url_prefix():
    """Constructs webapp URL prefix with a trailing slash.

    If not setup, this will be an invalid URL with an appropriate message.

    TODO: redirect to docs link showing how to setup instead of invalid URL.
    """
    if not CHAOSGENIUS_WEBAPP_URL:
        return "Webapp URL not setup. Please setup CHAOSGENIUS_WEBAPP_URL in the environment file./"

    forward_slash = "/" if not CHAOSGENIUS_WEBAPP_URL[-1] == "/" else ""
    return f"{CHAOSGENIUS_WEBAPP_URL}{forward_slash}"


def save_anomaly_point_formatting(points: List[Dict]):
    """Adds formatted fields to each point, to be used in alert templates."""
    for point in points:
        dt = datetime.datetime.strptime(point["data_datetime"], ALERT_DATETIME_FORMAT)
        date = dt.strftime(ALERT_READABLE_DATETIME_FORMAT)
        point["formatted_date"] = date

        change_percent = point["percentage_change"]
        change_message = "-"
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
    overall = sum(1 for point in points if point["Dimension"] == "Overall KPI")
    subdims = total - overall
    return overall, subdims


def change_message_from_percent(percent_change: Union[str, int, float]) -> str:
    """Creates a change message from given percentage change.

    percent_change will be:
        - "-" in case the last data point was missing
        - 0 (int) in case there was no change
        - positive value (int/float) in case there was an increase
        - negative value (int/float) in case there was a decrease
    """
    if isinstance(percent_change, str):
        return "-"
    elif percent_change == 0:
        return "No change (-)"
    elif percent_change > 0:
        return f"Increased by ({percent_change}%)"
    else:
        return f"Decreased by ({percent_change}%)"


def _format_anomaly_points(points: List[dict]):
    for anomaly_point in points:
        anomaly_point["series_type"] = (
            "Overall KPI"
            if anomaly_point.get("anomaly_type") == "overall"
            else anomaly_point["series_type"]
        )
        for key, value in anomaly_point.items():
            if key in ANOMALY_TABLE_COLUMNS_HOLDING_FLOATS:
                anomaly_point[key] = round(value, 2)
        if anomaly_point["series_type"] != "Overall KPI":
            anomaly_point["series_type"] = convert_query_string_to_user_string(
                anomaly_point["series_type"]
            )


def find_percentage_change(
    curr_val: Union[int, float], prev_val: Union[int, float]
) -> Union[int, float, str]:
    """Calculates percentage change between previous and current value."""
    if prev_val == 0:
        return "-"
    change = curr_val - prev_val
    percentage_change = (change / prev_val) * 100
    return round_number(percentage_change)
