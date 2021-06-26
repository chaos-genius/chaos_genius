# -*- coding: utf-8 -*-
"""Base views for api and home."""
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

from chaos_genius.databases.models.connection_model import Connection
# from chaos_genius.utils import flash_errors

blueprint = Blueprint("public", __name__, static_folder="../static")


@blueprint.route("/", methods=["GET"])
def home_view():
    """Home route."""
    return jsonify({'data': 'Check the project documentation for more'})


@blueprint.route("/api", methods=["GET"])
def api_view():
    """API base route."""
    return jsonify({'data': 'Check the API documentation for more'})
