"""View to handle requests pertaining to alert digests"""

import logging
from typing import Dict, Optional, cast
from flask import Blueprint, render_template, jsonify, request
from chaos_genius.controllers.digest_controller import get_digest_view_data

blueprint = Blueprint("digest", __name__, static_folder="../static")
logger = logging.getLogger(__name__)

@blueprint.route("", methods=["GET"])
def task_monitor_view():
    """A view that sends triggered alerts data"""

    triggered_alert_id = request.args.get("id", None)
    anomaly_alerts_data, event_alerts_data = get_digest_view_data(triggered_alert_id)
    
    return render_template(
        "digest.html",
        anomaly_alerts_data=anomaly_alerts_data,
        event_alerts_data=event_alerts_data,
        enumerate=enumerate,
        str=str,
        repr=repr,
        list=list
    )
