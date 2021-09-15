# -*- coding: utf-8 -*-
"""alert data view."""
from datetime import datetime, timedelta

from flask import (
    Blueprint,
    current_app,
    flash,
    redirect,
    render_template,
    request,
    url_for,
    jsonify
)
from chaos_genius.controllers.alert_controller import get_alert_list

blueprint = Blueprint("alert", __name__)


@blueprint.route("/", methods=["GET"])
def list_alert():
    """List the alert data."""
    results = get_alert_list()
    return jsonify({"data": results})
