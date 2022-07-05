"""View to handle requests pertaining to alert digests."""

import logging

from flask.blueprints import Blueprint
from flask.globals import request
from flask.templating import render_template

from chaos_genius.alerts.utils import webapp_url_prefix
from chaos_genius.controllers.digest_controller import get_digest_view_data
from chaos_genius.settings import EVENT_ALERTS_ENABLED

blueprint = Blueprint("digest", __name__, static_folder="../static")
logger = logging.getLogger(__name__)


@blueprint.route("", methods=["GET"])
def task_monitor_view():
    """A view that displays triggered alerts data."""
    triggered_alert_id = request.args.get("id", None)

    include_subdims = request.args.get("subdims", False)
    if include_subdims is not False:
        include_subdims = include_subdims == "true"

    anomaly_alerts_data, event_alerts_data = get_digest_view_data(
        int(triggered_alert_id) if triggered_alert_id else None,
        include_subdims,
    )

    return render_template(
        "alert_dashboard.html",
        anomaly_alerts_data=anomaly_alerts_data,
        event_alerts_data=event_alerts_data,
        len=len,
        cg_dashboard_link=f"{webapp_url_prefix()}#/alerts",
        EVENT_ALERTS_ENABLED=EVENT_ALERTS_ENABLED,
    )
