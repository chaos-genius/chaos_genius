import datetime
import heapq
import logging
import os
from collections import defaultdict
from typing import Dict, List, Tuple

from jinja2 import Environment, FileSystemLoader, select_autoescape

from chaos_genius.alerts.constants import (
    ALERT_DATE_FORMAT,
    ALERT_DATETIME_FORMAT,
    ALERT_READABLE_DATETIME_FORMAT,
    FREQUENCY_DICT,
)
from chaos_genius.alerts.email import send_static_alert_email
from chaos_genius.alerts.slack import alert_digest_slack_formatted
from chaos_genius.alerts.utils import (
    count_anomalies,
    save_anomaly_point_formatting,
    top_anomalies,
    webapp_url_prefix,
)
from chaos_genius.controllers.config_controller import get_config_object
from chaos_genius.controllers.digest_controller import get_alert_kpi_configurations
from chaos_genius.databases.models.triggered_alerts_model import TriggeredAlerts

logger = logging.getLogger(__name__)

ALERT_ATTRIBUTES_MAPPER = {"daily": "daily_digest", "weekly": "weekly_digest"}


class AlertDigestController:
    def __init__(self, frequency: str):

        self.time_diff = FREQUENCY_DICT[frequency]
        self.curr_time = datetime.datetime.now()
        self.alert_config_cache = dict()
        self.kpi_cache = dict()
        self.frequency = frequency

    def prepare_digests(self):

        data = (
            TriggeredAlerts.query.filter(
                TriggeredAlerts.created_at >= (self.curr_time - self.time_diff)
            )
            .order_by(TriggeredAlerts.created_at.desc())
            .all()
        )

        slack_digests = []
        email_digests = []

        self.alert_config_cache, self.kpi_cache = get_alert_kpi_configurations(data)

        for alert in data:
            alert_conf_id = alert.alert_conf_id
            alert_conf = self.alert_config_cache.get(alert_conf_id)

            kpi_id = alert_conf.get("kpi")
            kpi = self.kpi_cache.get(kpi_id) if kpi_id is not None else None

            alert.kpi_id = kpi_id
            alert.kpi_name = kpi.get("name") if kpi is not None else "Doesn't Exist"
            alert.alert_name = alert_conf.get("alert_name")
            alert.alert_channel = alert_conf.get("alert_channel")

            if not isinstance(alert_conf.get("alert_channel_conf"), dict):
                alert.alert_channel_conf = None
            else:
                alert.alert_channel_conf = alert_conf.get("alert_channel_conf", {}).get(
                    alert.alert_channel, None
                )

            if alert_conf.get(ALERT_ATTRIBUTES_MAPPER[self.frequency]):
                if alert.alert_channel == "slack":
                    slack_digests.append(alert)
                if alert.alert_channel == "email":
                    email_digests.append(alert)

        if len(email_digests) > 0:
            email_status = self.segregate_email_digests(email_digests)

        if len(slack_digests) > 0:
            slack_status = self.send_slack_digests(slack_digests)

    def segregate_email_digests(self, email_digests):
        user_triggered_alerts = defaultdict(set)
        for alert in email_digests:
            for user in alert.alert_channel_conf:
                user_triggered_alerts[user].add(alert.id)

        triggered_alert_dict = {alert.id: alert for alert in email_digests}
        for recipient in user_triggered_alerts.keys():
            self.send_alert_digest(
                recipient, user_triggered_alerts[recipient], triggered_alert_dict
            )

    def send_alert_digest(self, recipient, triggered_alert_ids, triggered_alert_dict):
        triggered_alerts = [
            triggered_alert_dict[id_].__dict__ for id_ in triggered_alert_ids
        ]
        points = _all_anomaly_points(triggered_alerts)
        top_anomalies_ = top_anomalies(points)
        overall_count, subdim_count = count_anomalies(points)
        save_anomaly_point_formatting(points)

        test = self.send_template_email(
            "digest_template.html",
            [recipient],
            f"Daily Alerts Report ({self.curr_time.strftime(ALERT_DATE_FORMAT)}) - Chaos Genius Alert❗",
            [],
            column_names=["alert_name", "kpi_name", "created_at", "link"],
            preview_text="",
            getattr=getattr,
            isinstance=isinstance,
            str=str,
            overall_count=overall_count,
            subdim_count=subdim_count,
            alert_dashboard_link=f"{webapp_url_prefix()}api/digest",
            kpi_link_prefix=f"{webapp_url_prefix()}#/dashboard/0/anomaly",
            top_anomalies=top_anomalies_,
        )

    def send_template_email(self, template, recipient_emails, subject, files, **kwargs):
        """Sends an email using a template."""

        path = os.path.join(os.path.dirname(__file__), "email_templates")
        env = Environment(
            loader=FileSystemLoader(path), autoescape=select_autoescape(["html", "xml"])
        )

        template = env.get_template(template)
        test = send_static_alert_email(
            recipient_emails, subject, template.render(**kwargs), None, files
        )

        return test

    def send_slack_digests(self, triggered_alerts):
        """Sends a slack alert containing a summary of triggered alerts."""
        triggered_alerts = [alert.__dict__ for alert in triggered_alerts]

        points = _all_anomaly_points(triggered_alerts)
        top10 = top_anomalies(points)
        overall_count, subdim_count = count_anomalies(points)
        save_anomaly_point_formatting(points)

        test = alert_digest_slack_formatted(
            self.frequency, top10, overall_count, subdim_count
        )

        if test == "ok":
            logger.info("The slack alert digest was successfully sent")
        else:
            logger.info("The slack alert digest has not been sent")

        message = f"Status for slack alert digest: {test}"
        return message


def _all_anomaly_points(triggered_alerts: List[Dict]) -> List[Dict]:
    return [
        dict(
            point,
            kpi_name=alert["kpi_name"],
            alert_name=alert["alert_name"],
            kpi_id=alert["kpi_id"],
        )
        for alert in triggered_alerts
        for point in alert["alert_metadata"]["alert_data"]
    ]


def check_and_trigger_digest(frequency: str):
    """Check the alert and trigger alert digest

    Args:
        frequency (str): frequency of alert digest

    Raises:
        Exception: Raise if digest frequency is incorrect or alert digests have not been configured

    Returns:
        bool: status of the alert digest trigger
    """

    if frequency not in ALERT_ATTRIBUTES_MAPPER.keys():
        msg = f"Alert Digest frequency is not valid. Got: {frequency}."
        logger.error(msg)
        raise Exception(msg)

    digest_config = get_config_object("alert_digest_settings")

    if digest_config is None:
        msg = "Alert digests have not been enabled."
        logger.error(msg)
        raise Exception(msg)

    digest_config_settings: dict = digest_config.config_setting

    if not digest_config_settings.get(ALERT_ATTRIBUTES_MAPPER[frequency]):
        msg = f"Digests with frequency {frequency} have not been enabled."
        logger.info(msg)
        raise Exception(msg)

    digest_obj = AlertDigestController(frequency)
    digest_obj.prepare_digests()

    return True
