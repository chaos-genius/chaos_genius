# -*- coding: utf-8 -*-
"""KPI views for creating and viewing the kpis."""
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

from chaos_genius.databases.models.kpi_model import Kpi
from chaos_genius.utils import flash_errors

blueprint = Blueprint("api_kpi", __name__, static_folder="../static")


@blueprint.route("/", methods=["GET", "POST"])
def kpi():
    """kpi list view."""
    current_app.logger.info("kpi list")
    # Handle logging in
    if request.method == 'POST':
        if request.is_json:
            data = request.get_json()
            # conn_name = data.get('name')
            # conn_uri = data.get('db_uri')
            # new_connection = Connection(name=conn_name, db_uri=conn_uri)
            # new_connection.save()
            return jsonify({"message": f"Connection new_connection.name has been created successfully."})
        else:
            return jsonify({"error": "The request payload is not in JSON format"})

    elif request.method == 'GET':
        kpis = Kpi.query.all()
        results = [kpi.safe_dict for kpi in kpis]
        return jsonify({"count": len(results), "data": results})
