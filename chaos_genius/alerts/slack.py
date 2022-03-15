from datetime import datetime
from typing import List, Optional

from slack_sdk.webhook import WebhookClient

from chaos_genius.alerts.alert_channel_creds import get_creds
from chaos_genius.alerts.constants import (
    ALERT_DATE_FORMAT,
    ALERT_DATETIME_FORMAT,
    ALERT_READABLE_DATETIME_FORMAT,
)
from chaos_genius.alerts.utils import webapp_url_prefix


def get_webhook_client():
    url = get_creds("slack")
    try:
        return WebhookClient(url)
    except Exception as err_msg:
        print(err_msg)
        return None


def anomaly_alert_slack(
    kpi_name, alert_name, kpi_id, alert_message, points, overall_count, subdim_count
):
    client = get_webhook_client()
    if not client:
        raise Exception("Slack not configured properly.")
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
                    "text": f"- Total alerts generated (Overall KPI): *{overall_count}*\n"
                    f"- Total alerts generated (including subdimenions): *{subdim_count + overall_count}*\n",
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
        print(response.body)

    return response.body


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
    top10: List[dict], kpi_name=None, include_kpi_link=True
) -> str:
    out = ""

    for point in top10:

        if include_kpi_link:
            kpi_name_link = (
                f'<{webapp_url_prefix()}#/dashboard/0/anomaly/{point["kpi_id"]}'
                f'|{point["kpi_name"]} (*{point["Dimension"]}*)>'
            )
        else:
            kpi_name_link = f'{kpi_name} ({point["Dimension"]})'

        date = point.get("formatted_date")

        threshold_message = (
            f'expected: *{point["yhat_lower"]} to {point["yhat_upper"]}*'
        )
        change_message = point["change_message"]

        out += (
            f"- *{kpi_name_link}* changed to "
            f'*{point["y"]}* (*{change_message}*) '
            f'on {date} ({threshold_message}, severity: *{point["severity"]}*)\n'
        )

    return out


def alert_digest_slack_formatted(
    frequency: str, top10: List[dict], overall_count: int, subdim_count: int
):
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
                    "text": f"- Total alerts generated (Overall KPI): *{overall_count}*\n"
                    f"- Total alerts generated (including subdimenions): *{subdim_count + overall_count}*\n",
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
        print(response.body)

    return response.body


def anomaly_alert_slack_formatted(alert_name, kpi_name, data_source_name, table_data):
    client = get_webhook_client()
    if not client:
        raise Exception("Slack not configured properly.")
    response = client.send(
        text=f"Anomaly Alert: {kpi_name}",
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
        ],
    )

    subsequent_response = "failed"
    if response.body == "ok":
        subsequent_response = alert_table_sender(client, table_data)

    if response.body == "ok" and subsequent_response == "ok":
        return "ok"
    return subsequent_response


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
