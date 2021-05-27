# -*- coding: utf-8 -*-
"""Connection views for creating and viewing the connections."""
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
from chaos_genius.utils import flash_errors

blueprint = Blueprint("api_connection", __name__, static_folder="../static")


@blueprint.route("/", methods=["GET", "POST"])
def connection():
    """Connection List view."""
    current_app.logger.info("Connection list")
    # Handle logging in
    if request.method == "POST":
        pass
    return jsonify({'data': 'Connection List'})
    # return render_template("public/home.html", form=form)
