# -*- coding: utf-8 -*-
"""anomaly data view."""
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
from chaos_genius.databases.models.anomaly_data_model import AnomalyData

blueprint = Blueprint("anomaly_data", __name__, static_folder="../static")


@blueprint.route("/", methods=["GET"])
def list_anomaly_data():
    """List the anomaly data."""
    return jsonify({})

