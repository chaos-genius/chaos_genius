import logging
import os
import datetime
from jinja2 import Environment, FileSystemLoader, select_autoescape

from chaos_genius.databases.models.triggered_alerts_model import TriggeredAlerts
from chaos_genius.databases.models.kpi_model import Kpi
from chaos_genius.databases.models.alert_model import Alert

from chaos_genius.alerts.email import send_static_alert_email

logger = logging.getLogger()

FREQUENCY_DICT = {
    "weekly": datetime.timedelta(days=7, hours=0, minutes=0),
    "daily": datetime.timedelta(days=1, hours=0, minutes=0),
    "hourly": datetime.timedelta(days=0, hours=1, minutes=0),
    "every_15_minute": datetime.timedelta(days=0, hours=0, minutes=15),
    "every_minute": datetime.timedelta(days=0, hours=0, minutes=1),
}

ALERT_ATTRIBUTES_MAPPER = {
    "daily": "daily_digest",
    "weekly": "weekly_digest"
}

class AlertDigestController:

    def __init__(self, frequency: str):

        self.time_diff = FREQUENCY_DICT[frequency]
        self.curr_time = datetime.datetime.now()
        self.alert_config_cache = dict()
        self.kpi_cache = dict()
        self.frequency = frequency

    def prepare_digests(self):

        data = TriggeredAlerts.query.filter(
                                    TriggeredAlerts.created_at >= (self.curr_time - self.time_diff)
                                ).order_by(TriggeredAlerts.created_at.desc()).all()

        for alert in data:
            id_ = getattr(alert, "alert_conf_id")
            alert_conf = None
            if id_ in self.alert_config_cache.keys():
                alert_conf = self.alert_config_cache.get(id_)
            else:
                alert_conf = Alert.query.filter(Alert.id == id_).first().as_dict
                self.alert_config_cache[id_] = alert_conf
                
            kpi_id = alert_conf.get("kpi")
            kpi = None

            if kpi_id is not None:
                if kpi_id in self.kpi_cache.keys():
                    kpi = self.kpi_cache.get(kpi_id)
                else:
                    kpi = Kpi.query.filter(Kpi.id == kpi_id).first().as_dict
                    self.kpi_cache[kpi_id] = kpi
                
            alert.kpi_name = kpi.get("name") if kpi is not None else "Doesn't Exist"
            alert.alert_name = alert_conf.get("alert_name")
            alert.alert_channel = alert_conf.get("alert_channel")
            alert.daily_digest = alert_conf.get("daily_digest", False)
            alert.weekly_digest = alert_conf.get("weekly_digest", False)

            if alert_conf.get("alert_channel_conf") is None:
                alert.alert_channel_conf = None
            else:
                alert.alert_channel_conf = alert_conf.get("alert_channel_conf").get(alert.alert_channel, None)
        
        slack_digests = [alert for alert in data if alert.alert_channel == "slack" and getattr(alert, ALERT_ATTRIBUTES_MAPPER[self.frequency]) == True] 
        email_digests = [alert for alert in data if alert.alert_channel == "email" and getattr(alert, ALERT_ATTRIBUTES_MAPPER[self.frequency]) == True]

        self.segregate_email_digests(email_digests)
        self.send_slack_digests(slack_digests)

    def segregate_email_digests(self, email_digests):
        
        user_triggered_alerts = dict()

        for alert in email_digests:
            for user in alert.alert_channel_conf:
                if user not in user_triggered_alerts.keys():
                    user_triggered_alerts[user] = set()

                user_triggered_alerts[user].add(alert.id)

        triggered_alert_dict = dict()
        for alert in email_digests:
            triggered_alert_dict[alert.id] = alert

        for recipient in user_triggered_alerts.keys():
            self.send_alert_digest(
                            recipient, 
                            user_triggered_alerts[recipient], 
                            triggered_alert_dict
                        )
    
    def send_alert_digest(self, recipient, triggered_alert_ids, triggered_alert_dict):
        data = []

        for id_ in triggered_alert_dict:
            data.append(triggered_alert_dict.get(id_))
            data[-1].link = f"http://localhost:5000/api/digest?id={id_}"

        data_len = min(len(data), 10)
        data = data if data_len == 0 else data[0:data_len]
            

        test = self.send_template_email("digest_template.html", 
                                            [recipient], 
                                            "The very first alert digest",
                                            [],
                                            column_names=["alert_name", "kpi_name", "created_at", "link"],
                                            data=data,
                                            preview_text="Alert Digest",
                                            getattr=getattr
                                        )

    def send_template_email(self, template, recipient_emails, subject, files, **kwargs):
        """Sends an email using a template."""

        path = os.path.join(os.path.dirname(__file__), "email_templates")
        env = Environment(
            loader=FileSystemLoader(path), autoescape=select_autoescape(["html", "xml"])
        )

        template = env.get_template(template)
        test = send_static_alert_email(recipient_emails, subject, template.render(**kwargs), None, files)

        print(test)
        return test

    def send_slack_digests(self, slack_digests):
        pass