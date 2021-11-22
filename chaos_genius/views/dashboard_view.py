# -*- coding: utf-8 -*-
"""Base views for config settings and onboarding."""
from flask import Blueprint, current_app, request, jsonify

from chaos_genius.controllers import dashboard_controller


blueprint = Blueprint("dashboard", __name__)


@blueprint.route("/", methods=["GET"])
def get_dashboard():
    return jsonify({})
