"""Utilities for sending slack alert messages."""
import logging
from typing import TYPE_CHECKING, Any, Dict, List, Optional

from slack_sdk.webhook.client import WebhookClient

import chaos_genius.alerts.anomaly_alerts as anomaly_alerts

if TYPE_CHECKING:
    from chaos_genius.controllers.digest_controller import AlertsReportData

from chaos_genius.alerts.alert_channel_creds import get_slack_creds
from chaos_genius.alerts.utils import webapp_url_prefix

logger = logging.getLogger(__name__)


def get_webhook_client() -> WebhookClient:
    """Initializes a Slack Webhook client."""
    url = get_slack_creds()
    return WebhookClient(url)


def anomaly_alert_slack(
    data: "anomaly_alerts.AlertsIndividualData",
) -> str:
    """Sends an anomaly alert on slack.

    Returns an empty string if successful or the error as a string if not.
    """
    client = get_webhook_client()
    response = client.send(
        blocks=[
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": (
                        f"{data.alert_name} - {data.kpi_name} "
                        f"({data.date_formatted()}) "
                    ),
                    "emoji": True,
                },
            },
            {
                "type": "divider",
            },
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": "Alert Message",
                    "emoji": True,
                },
            },
            {
                "type": "section",
                "text": {"type": "mrkdwn", "text": f"{data.alert_message}\n"},
            },
            {
                "type": "divider",
            },
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": "Anomalies",
                    "emoji": True,
                },
            },
            *_display_anomalies_individual(data),
            *_display_anomalies_individual(data, subdim=True),
            {
                "type": "actions",
                "elements": [
                    {
                        "type": "button",
                        "text": {"type": "plain_text", "text": "View KPI"},
                        "url": data.kpi_link(),
                        "action_id": "kpi_link",
                        "style": "primary",
                    },
                    {
                        "type": "button",
                        "text": {"type": "plain_text", "text": "Alerts Dashboard"},
                        "url": data.alert_dashboard_link(),
                        "action_id": "alert_dashboard",
                        "style": "primary",
                    },
                ],
            },
        ],
    )

    if response.body != "ok":
        return response.body

    return ""


def alert_digest_slack_formatted(data: "AlertsReportData") -> str:
    """Sends an anomaly digest on slack.

    Returns an empty string if successful or the error as a string if not.
    """
    client = get_webhook_client()
    if not client:
        raise Exception("Slack not configured properly.")

    blocks = [
        {
            "type": "header",
            "text": {
                "type": "plain_text",
                "text": f"Daily Alerts Report ({data.report_date_formatted()})",
                "emoji": True,
            },
        },
        {
            "type": "divider",
        },
        {
            "type": "header",
            "text": {
                "type": "plain_text",
                "text": "Top Anomalies",
                "emoji": True,
            },
        },
        *_display_anomalies_digest(data),
        *_display_anomalies_digest(data, subdim=True),
        {
            "type": "actions",
            "elements": [
                {
                    "type": "button",
                    "text": {"type": "plain_text", "text": "Alerts Dashboard"},
                    "url": data.alert_dashboard_link(),
                    "action_id": "alert_dashboard",
                    "style": "primary",
                }
            ],
        },
    ]

    response = client.send(blocks=blocks)

    if response.body != "ok":
        return response.body

    return ""


def _display_anomalies_individual(anomaly_data, subdim: bool = False):
    """Creates Individual Alert message."""
    sections: List[Dict[str, Any]] = []
    section = {
        "type": "section",
        "text": {"type": "mrkdwn", "text": ""},
    }

    if not subdim:
        if not anomaly_data.top_overall_points:
            section["text"]["text"] += "No anomalies observed."
        else:
            for point in anomaly_data.top_overall_points:
                point_formatted = anomaly_point_formatting(point)
                section["text"]["text"] += point_formatted
        sections.append(section)
    else:
        if anomaly_data.include_subdims and anomaly_data.top_subdim_points:
            header_section = {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": "Sub-Dimensional Anomalies",
                    "emoji": True,
                },
            }
            sections.append(header_section)
            for point in anomaly_data.top_subdim_points:
                point_formatted = anomaly_point_formatting(point)
                section["text"]["text"] += point_formatted
            sections.append(section)
        else:
            return []

    return sections


def _display_anomalies_digest(anomaly_data, subdim: bool = False):
    """Creates Digest Alert message."""
    sections: List[Dict[str, Any]] = []

    def _new_text_section() -> Dict[str, Any]:
        section = {
            "type": "section",
            "text": {"type": "mrkdwn", "text": ""},
        }
        sections.append(section)
        return section

    max_len = 2500

    if not subdim:
        section = _new_text_section()
        if not anomaly_data.top_overall_anomalies:
            section["text"]["text"] += "No anomalies observed."
        else:
            for point in anomaly_data.top_overall_anomalies:
                point_formatted = anomaly_point_formatting(
                    point, anomaly_data.kpi_link_prefix()
                )
                if len(section["text"]["text"]) + len(point_formatted) > max_len:
                    section = _new_text_section()
                section["text"]["text"] += point_formatted
    else:
        if anomaly_data.top_subdim_anomalies:
            header_section = {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": "Top Sub-Dimensional Anomalies",
                    "emoji": True,
                },
            }
            sections.append(header_section)
            section = _new_text_section()
            for point in anomaly_data.top_subdim_anomalies:
                point_formatted = anomaly_point_formatting(
                    point, anomaly_data.kpi_link_prefix()
                )
                if len(section["text"]["text"]) + len(point_formatted) > max_len:
                    section = _new_text_section()
                section["text"]["text"] += point_formatted
        else:
            return []

    return sections


def kpi_name_link(kpi_link_prefix, point):
    """Creates KPI name with link to respective anomaly page."""
    kpi_name_link = (
        f"<{webapp_url_prefix()}#/dashboard/0/anomaly/{point.kpi_id}"
        + f"|{point.kpi_name}>"
    )
    return kpi_name_link


def subdim_name_link(point, value_only: bool = False):
    """Creates subdim name with link to respective subdim anomaly page."""
    if value_only:
        subdim_link = (
            f"<{point.subdim_link()}" + f"|{point.subdim_formatted_value_only()}>"
        )
    else:
        subdim_link = f"<{point.subdim_link()}" + f"|{point.subdim_formatted()}>"
    return subdim_link


def anomaly_point_formatting(
    point: "anomaly_alerts.AnomalyPointFormatted",
    kpi_link_prefix: Optional[str] = None,
) -> str:
    """Creates format string for each point in alert."""
    out = ""

    include_kpi_name = kpi_link_prefix is not None

    if isinstance(point.percent_change, str):
        out += "- :black_circle_for_record: Anomalous behavior"
    elif point.percent_change >= 0:
        out += f"- :arrow_up: {point.percent_change_formatted} higher than expected"
    else:
        out += (
            f"- :arrow_down_small: {point.percent_change_formatted} lower than expected"
        )

    out += " - "

    if include_kpi_name:
        out += f"*{kpi_name_link(kpi_link_prefix, point)}* "

    if point.is_subdim:
        out += f"{subdim_name_link(point)} "

    out += f"changed to *{point.y_readable}*"
    if point.is_hourly:
        out += f" at {point.anomaly_time_only}"
    out += f". (Expected range: {point.yhat_lower_readable} - {point.yhat_upper_readable})."

    if point.relevant_subdims:
        out += "\n      - Reasons for change: "
        for point in point.top_relevant_subdims() or []:
            out += f"{subdim_name_link(point, value_only=True)}, "
        out = out[:-2]

    out += "\n"

    return out


def event_alert_slack(alert_name, alert_frequency, alert_message, alert_overview):
    client = get_webhook_client()
    if not client:
        raise Exception("Slack not configured properly.")
    blocks = [
        {
            "type": "header",
            "text": {
                "type": "plain_text",
                "text": f"Alert: {alert_name}",
                "emoji": True,
            },
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": f"Alert Frequency : {alert_frequency}",
            },
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": f"Alert Message : {alert_message}",
            },
        },
    ]
    if alert_overview:
        blocks.append(
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"Alert Overview : {alert_overview}",
                },
            }
        )
    response = client.send(text=f"Event Alert: {alert_name}", blocks=blocks)
    return response.body


def alert_table_sender(client, table_data):
    response = client.send(text=table_data)
    return response.body


def trigger_overall_kpi_stats(
    alert_name, kpi_name, data_source_name, alert_body, stats
):
    client = get_webhook_client()
    if not client:
        raise Exception("Slack not configured properly.")
    response = client.send(
        text="fallback",
        blocks=[
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": f"Alert: {alert_name}",
                    "emoji": True,
                },
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"This is the alert generated from KPI *{kpi_name}* and Data Source *{data_source_name}*.",
                },
            },
            {
                "type": "section",
                "text": {"type": "plain_text", "text": f"{alert_body}", "emoji": True},
            },
            {"type": "divider"},
            {
                "type": "section",
                "fields": [
                    {
                        "type": "mrkdwn",
                        "text": f"*Sum:*\n{stats['current']['sum']} ({stats['past']['sum']})",
                    },
                    {
                        "type": "mrkdwn",
                        "text": f"*Mean:*\n{stats['current']['mean']} ({stats['past']['mean']})",
                    },
                ],
            },
            {
                "type": "section",
                "fields": [
                    {
                        "type": "mrkdwn",
                        "text": f"*Change from last week:*\n{stats['impact']['sum']}",
                    },
                    {
                        "type": "mrkdwn",
                        "text": f"*Change from last week:*\n{stats['impact']['mean']}",
                    },
                ],
            },
        ],
    )
    return True


def test():
    client = get_webhook_client()
    if not client:
        raise Exception("Slack not configured properly.")
    response = client.send(
        text="fallback",
        blocks=[
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": "Anomaly Alert from Chaos Genius ",
                    "emoji": True,
                },
            },
            {
                "type": "section",
                "text": {
                    "type": "plain_text",
                    "text": "There are some new anomaly found in some of the KPI.",
                    "emoji": True,
                },
            },
            {"type": "divider"},
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": '*KPI:*\nConversion Rate\n*Value:*\n10\n*When:*\nJuly 20\n*Comments:* "View Drill Down for more info!"',
                },
                "accessory": {
                    "type": "image",
                    "image_url": "https://user-images.githubusercontent.com/20757311/126447967-c9f09b9a-d917-4f3f-bc69-94c3318705fe.png",
                    "alt_text": "cute cat",
                },
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "Click here to open the drilldowns in dashboard.",
                },
                "accessory": {
                    "type": "button",
                    "text": {"type": "plain_text", "text": "Dashboard", "emoji": True},
                    "value": "click_me_123",
                    "url": "https://chaosgenius.mayhemdata.com/#/dashboard",
                    "action_id": "button-action",
                },
            },
            {
                "type": "image",
                "title": {"type": "plain_text", "text": "Anomaly Found", "emoji": True},
                "image_url": "https://user-images.githubusercontent.com/20757311/126447329-a30e0b23-bf21-49c1-a029-d8de7691ef0f.png",
                "alt_text": "marg",
            },
        ],
    )
    print(response.body)
