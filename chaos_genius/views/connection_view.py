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
from flask_cors import CORS

from chaos_genius.databases.models.connection_model import Connection
from chaos_genius.extensions import airbyte
# from chaos_genius.utils import flash_errors

blueprint = Blueprint("api_connection", __name__, static_folder="../static")
CORS(blueprint) # TODO: remove this

CONNECTION_TYPES = [
    {'name': 'PostgreSQL', 'value': 'postgresql'},
    {'name': 'MySQL', 'value': 'mysql'}
]


@blueprint.route("/", methods=["GET", "POST"])
def connection():
    """Connection List view."""
    current_app.logger.info("Connection list")

    if request.method == 'POST':
        if request.is_json:
            data = request.get_json()
            conn_name = data.get('name')
            conn_type = data.get('connection_type')
            conn_uri = data.get('db_uri')
            new_connection = Connection(name=conn_name, db_uri=conn_uri, connection_type=conn_type)
            new_connection.save()
            return jsonify({"message": f"Connection {new_connection.name} has been created successfully."})
        else:
            return jsonify({"error": "The request payload is not in JSON format"})

    elif request.method == 'GET':
        connections = Connection.query.all()
        results = [conn.safe_dict for conn in connections]
        return jsonify({"count": len(results), "data": results})


@blueprint.route("/connection-types", methods=["GET", "POST"])
def connection_types():
    """Connection Type view."""
    return jsonify({"data": CONNECTION_TYPES})


@blueprint.route("/types", methods=["GET"])
def connection_type_list():
    """Connection Type view."""
    connection_types, msg = [], ""
    try:
        airbyte_client = airbyte.connection
        airbyte_client.init_source_def_conf()
        connection_types = airbyte_client.source_conf
    except Exception as err_msg:
        print(err_msg)
        msg = err_msg
    return jsonify({"data": connection_types, "msg": msg})


@blueprint.route("/test", methods=["POST"])
def connection_test():
    """Test Connection."""
    connection_status, msg = [], ""
    try:
        payload = request.get_json()
        airbyte_client = airbyte.connection
        connection_status = airbyte_client.test_connection(payload)
    except Exception as err_msg:
        print(err_msg)
        msg = err_msg
    return jsonify({"data": connection_status, "msg": msg})


@blueprint.route("/create", methods=["POST"])
def connection_create():
    """Test Connection."""
    connection_status, msg = {}, ""
    try:
        payload = request.get_json()
        airbyte_client = airbyte.connection
        # connection_status = airbyte_client.create_connection(payload)
    except Exception as err_msg:
        print(err_msg)
        msg = err_msg
    return jsonify({"data": connection_status, "msg": msg})
