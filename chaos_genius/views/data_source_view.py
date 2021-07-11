# -*- coding: utf-8 -*-
"""DataSource views for creating and viewing the data source."""
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

from chaos_genius.databases.models.data_source_model import DataSource
from chaos_genius.extensions import integration_connector as connector
from chaos_genius.third_party.integration_server_config import (
    SOURCE_CONFIG_MAPPING,
    SOURCE_WHITELIST_AND_TYPE,
    DATABASE_CONFIG_MAPPER,
    DESTINATION_TYPE as db_type
)
from chaos_genius.databases.db_utils import create_sqlalchemy_uri
from chaos_genius.databases.db_metadata import DbMetadata, get_metadata

# from chaos_genius.utils import flash_errors

blueprint = Blueprint("api_data_source", __name__, static_folder="../static")
CORS(blueprint) # TODO: remove this

CONNECTION_TYPES = [
    {'name': 'PostgreSQL', 'value': 'postgresql'},
    {'name': 'MySQL', 'value': 'mysql'}
]


@blueprint.route("/", methods=["GET", "POST"])
def data_source():
    """DataSource List view."""
    current_app.logger.info("DataSource list")

    if request.method == 'POST':
        if request.is_json:
            data = request.get_json()
            conn_name = data.get('name')
            conn_type = data.get('connection_type')
            conn_uri = data.get('db_uri')
            new_data_source = DataSource(name=conn_name, db_uri=conn_uri, connection_type=conn_type)
            new_data_source.save()
            return jsonify({"message": f"DataSource {new_data_source.name} has been created successfully."})
        else:
            return jsonify({"error": "The request payload is not in JSON format"})

    elif request.method == 'GET':
        data_sources = DataSource.query.all()
        results = [conn.safe_dict for conn in data_sources]
        results = sorted(results, reverse=True, key=lambda x: x["id"]) # TODO: Remove this and do in the query
        return jsonify({"count": len(results), "data": results})


@blueprint.route("/connection-types", methods=["GET", "POST"])
def data_source_types():
    """DataSource Type view."""
    return jsonify({"data": CONNECTION_TYPES})


@blueprint.route("/types", methods=["GET"])
def list_data_source_type():
    """DataSource Type view."""
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
def test_data_source():
    """Test DataSource."""
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
def create_data_source():
    """Create DataSource."""
    connection_status, msg, status = {}, "failed", False
    sourceRecord, desinationRecord, connectionRecord, stream_tables = {}, {}, {}, []
    db_connection_uri = ""
    try:
        payload = request.get_json()
        conn_name = payload.get('name')
        conn_type = payload.get('connection_type')
        source_form = payload.get('sourceForm')
        is_third_party = SOURCE_WHITELIST_AND_TYPE[source_form["sourceDefinitionId"]]
        connector_client = connector.connection
        sourceCreationPayload = {
            "name": f"CG-{conn_name}",
            "sourceDefinitionId": source_form.get("sourceDefinitionId"),
            "workspaceId": connector_client.workspace_id,
            "connectionConfiguration": source_form.get("connectionConfiguration")
        }
        if is_third_party:
            # Create the source
            sourceRecord = connector_client.create_source(sourceCreationPayload)
            sourceRecord["connectionConfiguration"] = sourceCreationPayload["connectionConfiguration"]

            # create the destination record
            desinationRecord = connector_client.create_destination(conn_name)
            # create the third_party_connection
            mapping_config = SOURCE_CONFIG_MAPPING.get(source_form.get("sourceDefinitionId"), {})
            source_schema = connector_client.get_source_schema(sourceRecord["sourceId"])
            stream_schema = source_schema["catalog"]["streams"]
            for stream in stream_schema:
                stream["config"].update(mapping_config)

            table_prefix = f"CG-{conn_type}-{conn_name}-"
            conn_payload = {
                "sourceId": sourceRecord["sourceId"],
                "destinationId": desinationRecord["destinationId"],
                "schedule": {
                    "units": 24,
                    "timeUnit": "hours"
                },
                "prefix": table_prefix,
                "status": "active",
                "syncCatalog": {
                    "streams": stream_schema
                }
            }
            connectionRecord = connector_client.create_connection(conn_payload)
            stream_tables = [stream["stream"]["name"] for stream in stream_schema]
            stream_tables = list(map(lambda x: f"{table_prefix}{x}", stream_tables))
            db_config = connector_client.destination_db
            db_config["db_type"] = db_type
        else:
            sourceRecord = sourceCreationPayload
            db_mapper = DATABASE_CONFIG_MAPPER[source_form.get("sourceDefinitionId")]
            input_configuration = source_form.get("connectionConfiguration")
            db_config = {
                "host": input_configuration[db_mapper["host"]],
                "port": input_configuration[db_mapper["port"]],
                "database": input_configuration[db_mapper["database"]],
                "username": input_configuration[db_mapper["username"]],
                "password": input_configuration[db_mapper["password"]],
                "db_type": db_mapper["db_type"],
            }

        db_connection_uri = create_sqlalchemy_uri(**db_config)
        status = "connected"

        # Save in the database
        new_connection = DataSource(
            name=conn_name,
            db_uri=db_connection_uri, 
            connection_type=conn_type,
            active=True,
            is_third_party=is_third_party,
            connection_status=status,
            sourceConfig=sourceRecord,
            destinationConfig=desinationRecord,
            connectionConfig=connectionRecord,
            dbConfig={"tables": stream_tables, "db_connection_uri": db_connection_uri}
        )
        new_connection.save()
        msg = f"DataSource {new_connection.name} has been created successfully."

    except Exception as err_msg:
        print('-'*60)
        print(err_msg)
        msg = err_msg
        import traceback; print(traceback.format_exc())
    return jsonify({"data": {}, "msg": msg, "status": status})


@blueprint.route("/delete", methods=["POST"])
def delete_data_source():
    """Delete Data Source."""
    status, msg = False, "failed"
    try:
        payload = request.get_json()
        data_source_id = payload["data_source_id"]
        data_source_obj = DataSource.get_by_id(data_source_id)
        if data_source_obj:
            ds_data = data_source_obj.as_dict
            if ds_data["is_third_party"]:
                connector_client = connector.connection
                # delete the connection
                connection_details = ds_data["connectionConfig"]
                status = connector_client.delete_connection(connection_details["connectionId"])
                # delete the destination
                destination_details = ds_data["destinationConfig"]
                status = connector_client.delete_destination(destination_details["destinationId"])
                # delete the source
                source_details = ds_data["sourceConfig"]
                status = connector_client.delete_source(source_details["sourceId"])
            # delete the data source record
            data_source_obj.delete(commit=True)
            msg = "deleted"
            status = True
    except Exception as err_msg:
        print(err_msg)

    return jsonify({"data": {}, "msg": msg, "status": status})


@blueprint.route("/metadata", methods=["POST"])
def metadata_data_source():
    """Metadata Data Source."""
    metadata, msg = {}, ""
    try:
        payload = request.get_json()
        data_source_id = payload["data_source_id"]
        from_query = payload["from_query"]
        query = payload["query"]
        data_source_obj = DataSource.get_by_id(data_source_id)
        if data_source_obj:
            ds_data = data_source_obj.as_dict
            metadata, err_msg = get_metadata(ds_data, from_query, query)
    except Exception as err_msg:
        print(err_msg)
        msg = err_msg

    return jsonify({"data": metadata, "msg": msg})


@blueprint.route("/logs", methods=["POST"])
def log_data_source():
    """Log Data Source."""
    status, logs_details = False, {}
    try:
        payload = request.get_json()
        data_source_id = payload["data_source_id"]
        data_source_obj = DataSource.get_by_id(data_source_id)
        ds_data = data_source_obj.as_dict
        connection_details = ds_data["connectionConfig"]
        connection_id = connection_details.get("connectionId", {})

        if connection_id:
            connector_client = connector.connection
            logs_details = connector_client.get_job_list(connection_id)

        status = True
    except Exception as err_msg:
        print(err_msg)

    return jsonify({"data": logs_details, "status": status})
