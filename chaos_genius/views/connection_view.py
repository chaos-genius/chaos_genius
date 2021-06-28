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
from chaos_genius.extensions import third_party_connector as connector
from chaos_genius.third_party.source_config_mapping import SOURCE_CONFIG_MAPPING
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
        connector_client = connector.connection
        connector_client.init_source_def_conf()
        connection_types = connector_client.source_conf
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
        connector_client = connector.connection
        connection_status = connector_client.test_connection(payload)
    except Exception as err_msg:
        print(err_msg)
        msg = err_msg
    return jsonify({"data": connection_status, "msg": msg})


@blueprint.route("/create", methods=["POST"])
def connection_create():
    """Create Connection."""
    connection_status, msg, status = {}, "failed", False
    sourceRecord, desinationRecord, connectionRecord, stream_tables = {}, {}, {}, []

    is_third_party = False
    try:
        payload = request.get_json()
        conn_name = payload.get('name')
        conn_type = payload.get('connection_type')
        source_form = payload.get('sourceForm')
        connector_client = connector.connection
        # Create the source
        sourceCreationPayload = {
            "name": f"CG-{conn_name}",
            "sourceDefinitionId": source_form.get("sourceDefinitionId"),
            "workspaceId": connector_client.workspace_id,
            "connectionConfiguration": source_form.get("connectionConfiguration")
        }
        sourceRecord = connector_client.create_source(sourceCreationPayload)
        sourceRecord["connectionConfiguration"] = sourceCreationPayload["connectionConfiguration"]
        if is_third_party: # if the connection is third party type
            # create the destination record
            desinationRecord = connector_client.create_destination(conn_name)
            # create the third_party_connection
            mapping_config = SOURCE_CONFIG_MAPPING.get(source_form.get("sourceDefinitionId"), {})
            source_schema = connector_client.get_source_schema(sourceRecord["sourceId"])
            stream_schema = source_schema["catalog"]["streams"]
            for stream in stream_schema:
                stream["config"].update(mapping_config)
            conn_payload = {
                "sourceId": "",
                "destinationId": "",
                "schedule": {
                    "units": 24,
                    "timeUnit": "hours"
                },
                "prefix": f"CG-{conn_type}-{conn_name}",
                "status": "active",
                "syncCatalog": {
                    "streams": stream_schema
                }
            }
            connectionRecord = connector_client.create_connection(conn_payload)
            stream_tables = [stream["stream"]["name"] for stream in stream_schema]
        status = "connected"

        # Save in the database
        new_connection = Connection(
            name=conn_name,
            # db_uri=conn_uri, Create the db uri at the creation itself
            connection_type=conn_type,
            active=True,
            is_third_party=is_third_party,
            connection_status=status,
            sourceConfig=sourceRecord,
            destinationConfig=desinationRecord,
            connectionConfig=connectionRecord,
            dbConfig={"tables": stream_tables}
        )
        new_connection.save()
        msg = f"Connection {new_connection.name} has been created successfully."

    except Exception as err_msg:
        print(err_msg)
        msg = err_msg
        import traceback; print(traceback.format_exc())
    return jsonify({"data": {}, "msg": msg, "status": status})
