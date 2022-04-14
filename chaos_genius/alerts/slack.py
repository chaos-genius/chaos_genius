"""Utilities for sending slack alert messages."""
import logging
from typing import Optional, Sequence

from slack_sdk.webhook.client import WebhookClient

import chaos_genius.alerts.anomaly_alerts as anomaly_alerts
from chaos_genius.alerts.alert_channel_creds import get_slack_creds
from chaos_genius.alerts.utils import webapp_url_prefix

logger = logging.getLogger(__name__)


def get_webhook_client() -> WebhookClient:
    """Initializes a Slack Webhook client."""
    url = get_slack_creds()
    return WebhookClient(url)


def anomaly_alert_slack(
    kpi_name: str,
    alert_name: str,
    kpi_id: int,
    alert_message: str,
    points: "Sequence[anomaly_alerts.AnomalyPointFormatted]",
    overall_count: int,
    subdim_count: int,
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
                    "text": f"{alert_name}",
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
                    "text": "Summary",
                    "emoji": True,
                },
            },
            {
                "type": "section",
                "text": {"type": "mrkdwn", "text": f"KPI name: *{kpi_name}*\n"},
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": (
                        f"- Total alerts generated (Overall KPI): *{overall_count}*\n"
                        + "- Total alerts generated (including subdimenions): "
                        + f"*{subdim_count + overall_count}*\n"
                    ),
                },
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
                "text": {"type": "mrkdwn", "text": f"{alert_message}\n"},
            },
            {
                "type": "actions",
                "elements": [
                    {
                        "type": "button",
                        "text": {"type": "plain_text", "text": "View KPI"},
                        "url": f"{webapp_url_prefix()}#/dashboard/0/anomaly/{kpi_id}",
                        "action_id": "kpi_link",
                        "style": "primary",
                    },
                    {
                        "type": "button",
                        "text": {"type": "plain_text", "text": "Alerts Dashboard"},
                        "url": f"{webapp_url_prefix()}api/digest",
                        "action_id": "alert_dashboard",
                        "style": "primary",
                    },
                ],
            },
            {
                "type": "divider",
            },
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": "Top anomalies",
                    "emoji": True,
                },
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": _format_slack_anomalies(
                        points, kpi_name=kpi_name, include_kpi_link=False
                    ),
                },
            },
        ],
    )

    if response.body != "ok":
        return response.body

    return ""


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


def _format_slack_anomalies(
    top10: "Sequence[anomaly_alerts.AnomalyPointFormatted]",
    kpi_name: Optional[str] = None,
    include_kpi_link: bool = True,
) -> str:
    out = ""

    for point in top10:

        if include_kpi_link:
            kpi_name_link = (
                f"<{webapp_url_prefix()}#/dashboard/0/anomaly/{point.kpi_id}"
                + f"|{point.kpi_name} (*{point.series_type}*)>"
            )
        else:
            kpi_name_link = f"{kpi_name} ({point.series_type})"

        date = point.formatted_date

        threshold_message = (
            f"expected: *{point.yhat_lower_readable} to {point.yhat_upper_readable}*"
        )

        out += (
            f"- *{kpi_name_link}* changed to "
            + f"*{point.y_readable}* (*{point.formatted_change_percent}*) "
            + f"on {date} ({threshold_message}, severity: *{point.severity}*)\n"
        )

    return out


def alert_digest_slack_formatted(
    frequency: str,
    top10: "Sequence[anomaly_alerts.AnomalyPointFormatted]",
    overall_count: int,
    subdim_count: int,
) -> str:
    """Sends an anomaly digest on slack.

    Returns an empty string if successful or the error as a string if not.
    """
    client = get_webhook_client()
    if not client:
        raise Exception("Slack not configured properly.")

    response = client.send(
        blocks=[
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": f"{frequency.title()} Alerts Report",
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
                    "text": "Summary",
                    "emoji": True,
                },
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": (
                        f"- Total alerts generated (Overall KPI): *{overall_count}*\n"
                        + "- Total alerts generated (including subdimenions): "
                        + f"*{subdim_count + overall_count}*\n"
                    ),
                },
            },
            {
                "type": "actions",
                "elements": [
                    {
                        "type": "button",
                        "text": {"type": "plain_text", "text": "Alerts Dashboard"},
                        "url": f"{webapp_url_prefix()}api/digest",
                        "action_id": "alert_dashboard",
                        "style": "primary",
                    }
                ],
            },
            {
                "type": "divider",
            },
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": "Top 10 anomalies",
                    "emoji": True,
                },
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": _format_slack_anomalies(top10),
                },
            },
        ]
    )

    if response.body != "ok":
        return response.body

    return ""


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
