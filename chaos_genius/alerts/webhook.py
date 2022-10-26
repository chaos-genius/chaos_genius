"""Utilities for posting data on webhook."""
import json
import logging
from typing import Dict
import requests

import chaos_genius.alerts.anomaly_alerts as anomaly_alerts
from chaos_genius.alerts.alert_channel_creds import get_webhook_creds
from chaos_genius.utils.utils import jsonable_encoder

logger = logging.getLogger(__name__)


def get_webhook() -> Dict:
    config = get_webhook_creds()
    return config


def anomaly_alert_webhook(
    data: "anomaly_alerts.AlertsIndividualData",
) -> int:
    status_code = 404
    config = get_webhook()
    if not config:
        # Issue with webhook configuration, return function
        logger.error("Webhook Not configured")
        return status_code
    result = {'cg_data': jsonable_encoder(data)}
    headers = {'Content-type': 'application/json'}
    # If custom auth header and auth token is given
    if "auth_header" in config and "auth_token" in config:
        headers[config["auth_header"]] = config["auth_token"]
    else:
        # If custom auth token is given
        if "auth_token" in config:
            headers['Authorization'] = config["auth_token"]

    alert = requests.post(config['webhook_url'], data=json.dumps(result), headers=headers)
    if alert:
        status_code = alert.status_code
    else:
        status_code = 400
    return status_code
