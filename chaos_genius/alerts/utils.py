"""Common utilities for alerts and alert digests."""

import datetime
import heapq
from typing import Dict, List, Tuple

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
    return heapq.nlargest(
        n,
        points,
        key=lambda point: point["severity"]
    )


def count_anomalies(points: List[Dict]) -> Tuple[int, int]:
    """Returns a count of overall anomalies and subdim anomalies."""
    total = len(points)
    overall = sum(1 for point in points if point["Dimension"] == "Overall KPI")
    subdims = total - overall
    return overall, subdims
