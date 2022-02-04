import datetime
import logging
import os
from collections import defaultdict

import pandas as pd
from jinja2 import Environment, FileSystemLoader, select_autoescape
from tabulate import tabulate

from chaos_genius.alerts.base_alerts import FREQUENCY_DICT
from chaos_genius.alerts.email import send_static_alert_email
from chaos_genius.alerts.slack import alert_digest_slack_formatted
from chaos_genius.controllers.digest_controller import get_alert_kpi_configurations
from chaos_genius.controllers.config_controller import get_config_object
from chaos_genius.databases.models.alert_model import Alert
from chaos_genius.databases.models.kpi_model import Kpi
from chaos_genius.databases.models.triggered_alerts_model import TriggeredAlerts
from chaos_genius.settings import ALERT_DIGEST_ENABLED, CHAOSGENIUS_WEBAPP_URL

logger = logging.getLogger()

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
        data = []

        for id_ in triggered_alert_ids:
            data.append(triggered_alert_dict.get(id_))
            if not CHAOSGENIUS_WEBAPP_URL:
                data[-1].link = "Webapp URL not setup"
                continue

            forward_slash = "/" if not CHAOSGENIUS_WEBAPP_URL[-1] == "/" else ""
            data[
                -1
            ].link = f"{CHAOSGENIUS_WEBAPP_URL}{forward_slash}api/digest?id={id_}"

        data_len = min(len(data), 10)
        data = data if data_len == 0 else data[0:data_len]

        test = self.send_template_email(
            "digest_template.html",
            [recipient],
            "Daily Alert Digest Report",
            [],
            column_names=["alert_name", "kpi_name", "created_at", "link"],
            data=data,
            preview_text="Alert Digest",
            getattr=getattr,
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

    def send_slack_digests(self, slack_digests):
        """Sends a slack alert containing a summary of triggered alerts"""

        column_names = ["alert_name", "kpi_name", "created_at"]
        slack_digests = [alert.__dict__ for alert in slack_digests]
        data = pd.DataFrame(slack_digests, columns=column_names)
        table_data = tabulate(data, tablefmt="fancy_grid", headers="keys")
        table_data = "```" + table_data + "```"
        test = alert_digest_slack_formatted(self.frequency, table_data)

        if test == "ok":
            logger.info(f"The slack alert digest was successfully sent")
        else:
            logger.info(f"The slack alert digest has not been sent")

        message = f"Status for slack alert digest: {test}"
        return message


def check_and_trigger_digest(frequency: str):
    """Check the alert and trigger alert digest

    Args:
        frequency (str): frequency of alert digest

    Raises:
        Exception: Raise if digest frequency is incorrect or alert digests have not been configured

    Returns:
        bool: status of the alert digest trigger
    """

    # TODO: take this from `get_config_object` for "alert_digest_settings"
    # For now, we will be using global env vars to set this

    if not ALERT_DIGEST_ENABLED:
        raise Exception("Alert Digests are not enabled.")

    if frequency not in ALERT_ATTRIBUTES_MAPPER.keys():
        raise Exception(f"Alert Digest frequency is not valid. Got: {frequency}.")

    digest_obj = AlertDigestController(frequency)
    digest_obj.prepare_digests()

    return True
