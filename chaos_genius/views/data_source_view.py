# -*- coding: utf-8 -*-
"""DataSource views for creating and viewing the data source."""
from uuid import uuid4
from copy import deepcopy
from datetime import datetime
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
from sqlalchemy import func
from chaos_genius.extensions import cache, db
from chaos_genius.third_party.integration_client import get_localhost_host
from chaos_genius.databases.models.kpi_model import Kpi
from chaos_genius.databases.models.data_source_model import DataSource
from chaos_genius.extensions import integration_connector as connector
from chaos_genius.third_party.integration_server_config import (
    SOURCE_CONFIG_MAPPING,
    SOURCE_WHITELIST_AND_TYPE,
    DATABASE_CONFIG_MAPPER,
    DESTINATION_TYPE as db_type,
    DATA_SOURCE_ABBREVIATION
)
from chaos_genius.databases.db_utils import create_sqlalchemy_uri
from chaos_genius.connectors import get_metadata
from chaos_genius.third_party.integration_utils import get_connection_config
# from chaos_genius.databases.db_metadata import DbMetadata, get_metadata

from chaos_genius.controllers.data_source_controller import (
    get_datasource_data_from_id,
    mask_sensitive_info,
    test_data_source,
    update_third_party
)

# from chaos_genius.utils import flash_errors

blueprint = Blueprint("api_data_source", __name__)


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
        data_sources = DataSource.query.filter(DataSource.active==True).order_by(DataSource.created_at.desc()).all()
        ds_kpi_count = db.session.query(DataSource.id, func.count(Kpi.id)) \
                    .join(Kpi, Kpi.data_source == DataSource.id) \
                    .filter(DataSource.active==True, Kpi.active==True) \
                    .group_by(DataSource.id) \
                    .order_by(DataSource.created_at.desc()) \
                    .all()
        data_source_kpi_map = {}
        for row in ds_kpi_count:
            data_source_kpi_map[row[0]] = row[1]
        results = []
        for conn in data_sources:
            # TODO: Add the kpi_count, real sync details and sorting info
            conn_detail = conn.safe_dict
            conn_detail['last_sync'] = datetime.now()
            conn_detail['kpi_count'] = data_source_kpi_map.get(conn_detail['id'], 0)
            results.append(conn_detail)
        results = sorted(results, reverse=True, key=lambda x: x["id"])
        return jsonify({"count": len(results), "data": results})


@blueprint.route("/types", methods=["GET"])
@cache.memoize()
def list_data_source_type():
    """DataSource Type view."""
    connection_types, msg, status = [], "", "success"
    try:
        # connector_client = connector.connection
        # connector_client.init_source_def_conf()
        # connection_types = connector_client.source_conf
        connection_types = get_connection_config()
    except Exception as err_msg:
        print(err_msg)
        msg = str(err_msg)
        status = "failed"
    return jsonify({"data": connection_types, "msg": msg, "status": status})


@blueprint.route("/test", methods=["POST"])
def test_data_source_connection():
    """Test DataSource."""
    connection_status, msg, status = [], "", "success"
    try:
        payload = request.get_json()
        connection_status = test_data_source(payload)
    except Exception as err_msg:
        print(err_msg)
        msg = str(err_msg)
        status = "failed"
    return jsonify({"data": connection_status, "msg": msg, "status": status})


@blueprint.route("/create", methods=["POST"])
def create_data_source():
    """Create DataSource."""
    # TODO: Better error handling and proper message in case of the failure
    connection_status, msg, status = {}, "failed", False
    sourceRecord, desinationRecord, connectionRecord, stream_tables = {}, {}, {}, []
    db_connection_uri = ""
    try:
        payload = request.get_json()
        conn_name = payload.get('name')
        conn_type = payload.get('connection_type')
        source_form = payload.get('sourceForm')
        is_third_party = SOURCE_WHITELIST_AND_TYPE[source_form["sourceDefinitionId"]]
        sourceCreationPayload = {
            "name": f"CG-{conn_name}",
            "sourceDefinitionId": source_form.get("sourceDefinitionId"),
            "connectionConfiguration": source_form.get("connectionConfiguration")
        }
        if is_third_party:
            connector_client = connector.connection
            sourceCreationPayload["workspaceId"] = connector_client.workspace_id
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

            abbv_conn_type = DATA_SOURCE_ABBREVIATION[conn_type]
            random_conn_name = str(uuid4())[:4]
            table_prefix = f"{abbv_conn_type}_{random_conn_name}_"
            table_prefix = table_prefix.lower()
            conn_payload = {
                "sourceId": sourceRecord["sourceId"],
                "destinationId": desinationRecord["destinationId"],
                "schedule": {
                    "units": 24,
                    "timeUnit": "hours"
                },
                "prefix": table_prefix,
                "status": "active",
                "operations": [
                    {
                        "name": "Normalization",
                        "workspaceId": connector_client.workspace_id,
                        "operatorConfiguration": {
                            "operatorType": "normalization",
                            "normalization": {
                                "option": "basic"
                            }
                        }
                    }
                ],
                "syncCatalog": {
                    "streams": stream_schema
                }
            }
            connectionRecord = connector_client.create_connection(conn_payload)
            if not connectionRecord:
                raise Exception("Connection not created")
            stream_tables = [stream["stream"]["name"] for stream in stream_schema]
            stream_tables = list(map(lambda x: f"{table_prefix}{x}", stream_tables))
            db_config = connector_client.destination_db
            db_config["host"] = get_localhost_host(db_config["host"])
            db_config["db_type"] = db_type
            db_connection_uri = create_sqlalchemy_uri(**db_config)
        else:
            sourceRecord = sourceCreationPayload
            db_mapper = DATABASE_CONFIG_MAPPER[source_form.get("sourceDefinitionId")]
            input_configuration = source_form.get("connectionConfiguration")
            if db_mapper["db_type"] in ["mysql", "postgres"]:
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
        new_connection.save(commit=True)
        msg = f"Connection {new_connection.name} has been created successfully."

    except Exception as err_msg:
        print('-'*60)
        print(err_msg)
        msg = str(err_msg)
        # import traceback; print(traceback.format_exc())
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
            data_source_obj.active = False
            data_source_obj.save(commit=True)
            msg = "deleted"
            status = True
    except Exception as err_msg:
        print(err_msg)

    return jsonify({"data": {}, "msg": msg, "status": status})


@blueprint.route("/metadata", methods=["POST"])
def metadata_data_source():
    """Metadata Data Source."""
    metadata, msg, status = {}, "", "success"

    try:
        payload = request.get_json()
        data_source_id = payload["data_source_id"]
        from_query = payload["from_query"]
        query = payload["query"]
        data_source_obj = DataSource.get_by_id(data_source_id)
        if data_source_obj:
            ds_data = data_source_obj.as_dict
            metadata, msg = get_metadata(ds_data, from_query, query)
            if msg != "":
                status = "failure"
        else:
            status = "failure"
    except Exception as err_msg:
        print(err_msg)
        msg = str(err_msg)
        status = "failure"

    return jsonify({"data": metadata, "msg": msg, "status": status})


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


@blueprint.route("/<int:datasource_id>", methods=["GET"])
def get_data_source_info(datasource_id):
    """get data source details."""
    status, message = "", ""
    data = None
    try:
        ds_obj = get_datasource_data_from_id(datasource_id, as_obj=True)
        data_source_def = ds_obj.sourceConfig["sourceDefinitionId"]
        if data_source_def:
            connection_types = get_connection_config()
            connection_def = next((source_def for source_def in connection_types if source_def["sourceDefinitionId"] == data_source_def), None)
            masked_details = {}
            if connection_def:
                masked_details = mask_sensitive_info(connection_def, ds_obj.sourceConfig["connectionConfiguration"])
        data = ds_obj.safe_dict
        data["sourceForm"] = masked_details
        status = "success"
    except Exception as err:
        status = "failure"
        message = str(err)
        current_app.logger.info(f"Error in fetching the Data Source: {err}")
    return jsonify({"message": message, "status": status, "data": data})


@blueprint.route("/<int:datasource_id>/test-and-update", methods=["POST"])
def update_data_source_info(datasource_id):
    """get data source details."""
    status, message = "", ""
    data = None
    try:
        payload = request.get_json()
        conn_name = payload.get('name')
        source_form = payload.get('sourceForm')
        ds_obj = get_datasource_data_from_id(datasource_id, as_obj=True)
        ds_obj.name = conn_name
        connection_config = deepcopy(ds_obj.sourceConfig)
        connection_config["connectionConfiguration"].update(
            source_form.get("connectionConfiguration", {})
        )
        connection_config["connection_type"] = ds_obj.connection_type
        connection_status = test_data_source(deepcopy(connection_config))
        if connection_status["status"] == "failed":
            raise Exception(connection_status['message'])

        updated_config = update_third_party(connection_config)
        if updated_config:
            # third party configs update
            updated_config["connectionConfiguration"] = connection_config["connectionConfiguration"]
            ds_obj.sourceConfig = updated_config
        else:
            ds_obj.sourceConfig = connection_config
        ds_obj.save(commit=True)
        status = "success"
    except Exception as err:
        status = "failure"
        message = str(err)
        current_app.logger.info(f"Error in udpating the Data Source: {err}")
    return jsonify({"message": message, "status": status, "data": data})


@blueprint.route("/meta-info", methods=["GET"])
def data_source_meta_info():
    """data source meta info view."""
    current_app.logger.info("data source meta info")
    return jsonify({"data": DataSource.meta_info()})
