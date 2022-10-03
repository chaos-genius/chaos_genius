"""Common utilities for alerts and alert digests."""

import os
from math import floor, log10
from typing import List, Optional, Union

from jinja2 import Environment, FileSystemLoader, select_autoescape

from chaos_genius.alerts.email import send_static_alert_email
from chaos_genius.core.utils.round import round_number
from chaos_genius.settings import CHAOSGENIUS_WEBAPP_URL


class AlertException(Exception):
    """A general exception in a specific alert.

    Stores and prints alert ID and KPI ID.
    """

    def __init__(self, message: str, alert_id: int, kpi_id: Optional[int] = None):
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


def find_percentage_change(
    actual_val: Union[int, float], expected_val: Optional[Union[int, float]]
) -> Union[int, float, str]:
    """Calculates percentage change between expected and actual value."""
    if expected_val is None:
        # expected value has not been calculated for this point
        return "N/A"
    elif actual_val == 0 and expected_val == actual_val:
        # both current and expected value are 0
        return 0
    elif expected_val == 0:
        # previous value is 0, but current value isn't
        sign_ = "+" if actual_val > 0 else "-"
        return sign_ + "inf"
    else:
        change = actual_val - expected_val
        percentage_change = (change / abs(expected_val)) * 100
        return round_number(percentage_change)


def send_email_using_template(
    template_name: str,
    recipient_emails: List[str],
    subject: str,
    files: List[dict],
    **kwargs,
) -> None:
    """Sends an email using a template."""
    path = os.path.join(os.path.dirname(__file__), "email_templates")
    env = Environment(
        loader=FileSystemLoader(path), autoescape=select_autoescape(["html", "xml"])
    )

    template = env.get_template(template_name)
    send_static_alert_email(recipient_emails, subject, template.render(**kwargs), files)


HRN_PREFIXES = {
    -9: "n",
    -6: "µ",
    -3: "m",
    0: "",
    3: "K",
    6: "M",
    9: "B",
    12: "T",
}


def _get_exponent(num: float) -> int:
    """Returns the power of 10 to which the number is raised to."""
    if num == 0:
        return 0

    return floor(log10(abs(num)))


def human_readable(num: float) -> str:
    """Returns the human readable format of a number."""
    exponent = _get_exponent(num)

    new_exponent = min((3 * floor(exponent / 3)), 12)
    precision = 10 ** (new_exponent)

    new_val = round(num / precision, 3)
    human_readable_format = str(new_val) + HRN_PREFIXES[new_exponent]
    return human_readable_format
