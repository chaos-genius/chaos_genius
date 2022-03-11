# -*- coding: utf-8 -*-
"""DataSource views for creating and viewing the data source."""
import logging
from copy import deepcopy
from datetime import datetime
from uuid import uuid4

from flask.blueprints import Blueprint
from flask.globals import request
from flask.json import jsonify
from sqlalchemy import func

from chaos_genius.connectors import get_metadata, get_schema_names
from chaos_genius.connectors import get_table_info as get_table_metadata
from chaos_genius.connectors import get_table_list, get_view_list
from chaos_genius.controllers.data_source_controller import (
    get_datasource_data_from_id,
    mask_sensitive_info,
    test_data_source,
    update_third_party,
)
from chaos_genius.databases.db_utils import create_sqlalchemy_uri
from chaos_genius.databases.models.data_source_model import DataSource
from chaos_genius.databases.models.kpi_model import Kpi
from chaos_genius.extensions import cache, db
from chaos_genius.extensions import integration_connector as connector
from chaos_genius.settings import AIRBYTE_ENABLED
from chaos_genius.third_party.integration_client import get_localhost_host
from chaos_genius.third_party.integration_server_config import (
    DATA_SOURCE_ABBREVIATION,
    DATABASE_CONFIG_MAPPER,
)
from chaos_genius.third_party.integration_server_config import (
    DESTINATION_TYPE as db_type,
)
from chaos_genius.third_party.integration_server_config import (
    SOURCE_CONFIG_MAPPING,
    SOURCE_WHITELIST_AND_TYPE,
)
from chaos_genius.third_party.integration_utils import get_connection_config
from chaos_genius.utils.metadata_api_config import (
    SCHEMAS_AVAILABLE,
    TABLE_VIEW_MATERIALIZED_VIEW_AVAILABILITY,
)

blueprint = Blueprint("api_data_source", __name__)

logger = logging.getLogger(__name__)


@blueprint.route("/", methods=["GET", "POST"])  # TODO: Remove this
@blueprint.route("", methods=["GET", "POST"])
def data_source():
    """Data source List view."""
    if request.method == "POST":
        logger.info("Adding a data source.")

        data = request.get_json()

        if data is not None:
            conn_name = data.get("name")
            conn_type = data.get("connection_type")
            conn_uri = data.get("db_uri")
            new_data_source = DataSource(
                name=conn_name, db_uri=conn_uri, connection_type=conn_type
            )
            new_data_source.save()

            logger.info("Data source '%s' added successfully.", new_data_source.name)

            return jsonify(
                {
                    "message": f"DataSource {new_data_source.name} has been created successfully."
                }
            )
        else:
            err_msg = "The request payload is not in JSON format"
            logger.error("Error adding data source: %s", err_msg)

            return jsonify({"error": err_msg})

    elif request.method == "GET":
        logger.info("Listing data sources.")

        data_sources = (
            DataSource.query.filter(DataSource.active == True)  # noqa: E712
            .order_by(DataSource.created_at.desc())
            .all()
        )
        ds_kpi_count = (
            db.session.query(DataSource.id, func.count(Kpi.id))
            .join(Kpi, Kpi.data_source == DataSource.id)
            .filter(DataSource.active == True, Kpi.active == True)  # noqa: E712
            .group_by(DataSource.id)
            .order_by(DataSource.created_at.desc())
            .all()
        )
        data_source_kpi_map = {}
        for row in ds_kpi_count:
            data_source_kpi_map[row[0]] = row[1]
        results = []
        for conn in data_sources:
            # TODO: Add the kpi_count, real sync details and sorting info
            conn_detail = conn.safe_dict
            conn_detail["last_sync"] = datetime.now()
            conn_detail["kpi_count"] = data_source_kpi_map.get(conn_detail["id"], 0)
            results.append(conn_detail)
        results = sorted(results, reverse=True, key=lambda x: x["id"])

        logger.info("Found %d data sources", len(results))

        return jsonify({"count": len(results), "data": results})


@blueprint.route("/types", methods=["GET"])
@cache.memoize()
def list_data_source_type():
    """Data source Type view."""
    logger.info("Listing data sources types.")

    connection_types, msg, status = [], "", "success"
    try:
        connection_types = get_connection_config()
    except Exception as err_msg:
        logger.error(
            "Error in listing data source types: %s", err_msg, exc_info=err_msg
        )
        msg = str(err_msg)
        status = "failed"
    return jsonify({"data": connection_types, "msg": msg, "status": status})


@blueprint.route("/test", methods=["POST"])
def test_data_source_connection():
    """Test DataSource."""
    connection_status, msg, status = [], "", "success"
    try:
        payload = request.get_json()

        if payload is None:
            msg = "The request payload is not in JSON format"
            status = "failed"
            logger.error("Error in testing data source: %s", msg)
        else:
            connection_status = test_data_source(payload)
            logger.info("Testing a data source. Results: %s", connection_status)

    except Exception as err_msg:
        logger.error("Error in testing data source: %s", err_msg, exc_info=err_msg)
        msg = str(err_msg)
        status = "failed"

    return jsonify({"data": connection_status, "msg": msg, "status": status})


@blueprint.route("/create", methods=["POST"])
def create_data_source():
    """Create DataSource."""
    logger.info("Creating a new data source.")

    # TODO: Better error handling and proper message in case of the failure
    connection_data = {}
    connection_status, msg, status = {}, "failed", False
    sourceRecord, desinationRecord, connectionRecord, stream_tables = {}, {}, {}, []
    db_connection_uri = ""
    try:
        payload = request.get_json()
        conn_name = payload.get("name")
        conn_type = payload.get("connection_type")
        source_form = payload.get("sourceForm")
        is_third_party = SOURCE_WHITELIST_AND_TYPE[source_form["sourceDefinitionId"]]
        if is_third_party and not AIRBYTE_ENABLED:
            raise Exception("Airbytes is not enabled.")
        sourceCreationPayload = {
            "name": f"CG-{conn_name}",
            "sourceDefinitionId": source_form.get("sourceDefinitionId"),
            "connectionConfiguration": source_form.get("connectionConfiguration"),
        }
        if is_third_party:
            connector_client = connector.connection
            sourceCreationPayload["workspaceId"] = connector_client.workspace_id
            # Create the source
            sourceRecord = connector_client.create_source(sourceCreationPayload)
            sourceRecord["connectionConfiguration"] = sourceCreationPayload[
                "connectionConfiguration"
            ]

            # create the destination record
            desinationRecord = connector_client.create_destination(conn_name)
            # create the third_party_connection
            mapping_config = SOURCE_CONFIG_MAPPING.get(
                source_form.get("sourceDefinitionId"), {}
            )
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
                "schedule": {"units": 24, "timeUnit": "hours"},
                "prefix": table_prefix,
                "status": "active",
                "operations": [
                    {
                        "name": "Normalization",
                        "workspaceId": connector_client.workspace_id,
                        "operatorConfiguration": {
                            "operatorType": "normalization",
                            "normalization": {"option": "basic"},
                        },
                    }
                ],
                "syncCatalog": {"streams": stream_schema},
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
            dbConfig={"tables": stream_tables, "db_connection_uri": db_connection_uri},
        )
        new_connection.save(commit=True)
        msg = f"Connection {new_connection.name} has been created successfully."
        logger.info("Data source '%s' added successfully.", new_connection.name)
        connection_data = new_connection.safe_dict

    except Exception as err_msg:
        msg = str(err_msg)
        logger.error("Error in creating data source: %s", err_msg, exc_info=err_msg)

    return jsonify({"data": connection_data, "msg": msg, "status": status})


@blueprint.route("/delete", methods=["POST"])
def delete_data_source():
    """Delete Data Source."""
    status, msg = False, "failed"
    try:
        payload = request.get_json()
        data_source_id = payload["data_source_id"]
        data_source_obj = DataSource.get_by_id(data_source_id)
        if data_source_obj:
            logger.info(
                "Deleting data source - Name: %s, ID: %s",
                data_source_obj.name,
                data_source_obj.id,
            )

            ds_data = data_source_obj.as_dict
            # Remove the third party data source even if airbyte is disabled
            if ds_data["is_third_party"] and AIRBYTE_ENABLED:
                connector_client = connector.connection
                # delete the connection
                connection_details = ds_data["connectionConfig"]
                status = connector_client.delete_connection(
                    connection_details["connectionId"]
                )
                # delete the destination
                destination_details = ds_data["destinationConfig"]
                status = connector_client.delete_destination(
                    destination_details["destinationId"]
                )
                # delete the source
                source_details = ds_data["sourceConfig"]
                status = connector_client.delete_source(source_details["sourceId"])
            # delete the data source record
            data_source_obj.active = False
            data_source_obj.save(commit=True)
            msg = "deleted"
            status = True
    except Exception as err_msg:
        logger.error("Error in deleting data source: %s", err_msg, exc_info=err_msg)
        msg = str(err_msg)

    return jsonify({"data": {}, "msg": msg, "status": status})


@blueprint.route("/metadata", methods=["POST"])
def metadata_data_source():
    """Metadata Data Source."""
    metadata, msg, status = {}, "", "success"

    try:
        payload = request.get_json()

        if payload is None:
            msg = "The request payload is not in JSON format"
            status = "failure"
            logger.error("Error in data source metadata: %s", msg)
        else:
            data_source_id = payload["data_source_id"]

            logger.info("Retrieving data source metadata. ID: %s", data_source_id)

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
        logger.error("Error in data source metadata: %s", err_msg, exc_info=err_msg)
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

        logger.info("Retrieving data source logs. ID: %s", data_source_id)

        data_source_obj = DataSource.get_by_id(data_source_id)
        ds_data = data_source_obj.as_dict
        connection_details = ds_data["connectionConfig"]
        connection_id = connection_details.get("connectionId", {})

        if connection_id and AIRBYTE_ENABLED:
            connector_client = connector.connection
            logs_details = connector_client.get_job_list(connection_id)

        status = True
    except Exception as err_msg:
        logger.error("Error in data source logs: %s", err_msg, exc_info=err_msg)

    return jsonify({"data": logs_details, "status": status})


@blueprint.route("/<int:datasource_id>", methods=["GET"])
def get_data_source_info(datasource_id):
    """Get data source details."""
    status, message = "failure", ""
    data = None
    try:
        ds_obj = get_datasource_data_from_id(datasource_id, as_obj=True)

        logger.info("Retrieving details of data source. ID: %s", datasource_id)

        data_source_def = ds_obj.sourceConfig["sourceDefinitionId"]
        if data_source_def:
            connection_types = get_connection_config()
            connection_def = next(
                (
                    source_def
                    for source_def in connection_types
                    if source_def["sourceDefinitionId"] == data_source_def
                ),
                None,
            )
            masked_details = {}
            if connection_def:
                masked_details = mask_sensitive_info(
                    connection_def, ds_obj.sourceConfig["connectionConfiguration"]
                )
        data = ds_obj.safe_dict
        data["sourceForm"] = masked_details
        status = "success"
    except Exception as err:
        status = "failure"
        message = str(err)
        logger.error("Error in retrieving data source: %s", err, exc_info=err)

    return jsonify({"message": message, "status": status, "data": data})


@blueprint.route("/<int:datasource_id>/test-and-update", methods=["POST"])
def update_data_source_info(datasource_id):
    """Get data source details."""
    logger.info("Updating data source. ID: %s", datasource_id)

    status, message = "failure", ""
    data = None

    try:
        payload = request.get_json()
        conn_name = payload.get("name")
        source_form = payload.get("sourceForm")
        ds_obj = get_datasource_data_from_id(datasource_id, as_obj=True)
        if ds_obj.is_third_party and not AIRBYTE_ENABLED:
            raise Exception("Airbyte is not enabled")
        ds_obj.name = conn_name
        connection_config = deepcopy(ds_obj.sourceConfig)
        connection_config["connectionConfiguration"].update(
            source_form.get("connectionConfiguration", {})
        )
        connection_config["connection_type"] = ds_obj.connection_type
        connection_status = test_data_source(deepcopy(connection_config))
        if connection_status["status"] == "failed":
            raise Exception(connection_status["message"])

        updated_config = update_third_party(connection_config)
        if updated_config:
            # third party configs update
            updated_config["connectionConfiguration"] = connection_config[
                "connectionConfiguration"
            ]
            ds_obj.sourceConfig = updated_config
        else:
            ds_obj.sourceConfig = connection_config
        ds_obj.save(commit=True)
        status = "success"
    except Exception as err:
        status = "failure"
        message = str(err)
        logger.error("Error in updating data source: %s", err, exc_info=err)

    return jsonify({"message": message, "status": status, "data": data})


@blueprint.route("/meta-info", methods=["GET"])
def data_source_meta_info():
    """Data source meta info view."""
    logger.info("Retrieving data source meta info")
    return jsonify({"data": DataSource.meta_info()})


@blueprint.route("/get-availability", methods=["POST"])
def check_views_availability():
    views = False
    materialize_views = False
    schema_exist = False
    message = ""
    status = "failure"

    try:
        data = request.get_json()
        datasource_id = data.get("datasource_id", None)

        logger.info("Getting data source availability. ID: %s", datasource_id)

        if datasource_id is None:
            message = "Datasource ID needs to be provided"
        else:
            ds_data = get_datasource_data_from_id(datasource_id, as_obj=True)
            if not ds_data or not getattr(ds_data, "active"):
                raise ValueError(
                    f"There exists no active datasource matching the provided id: {datasource_id}"
                )

            datasource_name = getattr(ds_data, "connection_type")
            schema_exist = SCHEMAS_AVAILABLE.get(datasource_name, False)
            views = TABLE_VIEW_MATERIALIZED_VIEW_AVAILABILITY[datasource_name]["views"]
            supported_aggregations = TABLE_VIEW_MATERIALIZED_VIEW_AVAILABILITY[datasource_name]["supported_aggregations"]
            materialize_views = TABLE_VIEW_MATERIALIZED_VIEW_AVAILABILITY[
                datasource_name
            ]["materialized_views"]
            status = "success"
    except Exception as err:
        message = "Error in fetching table info: {}".format(err)
        logger.error("Error in data source availability: %s", err, exc_info=err)
    else:
        if status == "failure":
            logger.error("Error in data source availability: %s", message)

    return jsonify(
        {
            "message": message,
            "status": status,
            "available": {
                "schema": schema_exist,
                "views": views,
                "materialize_views": materialize_views,
                "supported_aggregations": supported_aggregations
            },
        }
    )


@blueprint.route("/list-schema", methods=["POST"])
def get_schema_list():
    status = "failure"
    message = ""
    data = []

    try:
        data = request.get_json()
        datasource_id = data.get("datasource_id", None)

        logger.info("Listing data source schemas. ID: %s", datasource_id)

        if datasource_id is None:
            message = "Datasource ID needs to be provided"
        else:
            ds_data = get_datasource_data_from_id(datasource_id, as_obj=True)
            if not ds_data or not getattr(ds_data, "active"):
                raise ValueError(
                    f"There exists no active datasource matching the provided id: {datasource_id}"
                )

            data = get_schema_names(ds_data.as_dict)
            if data is None:
                message = "Error occurred while establishing DB Connection"
                data = []
            else:
                status = "success"
    except Exception as err:
        message = "Error in fetching table info: {}".format(err)
        logger.error("Error in data source schema list: %s", err, exc_info=err)
    else:
        if status == "failure":
            logger.error("Error in data source schema list: %s", message)

    return jsonify({"message": message, "status": status, "data": data})


@blueprint.route("/get-table-list", methods=["POST"])
def get_schema_tables():
    status = "failure"
    message = ""
    table_names = []

    try:
        data = request.get_json()
        datasource_id = data.get("datasource_id", None)
        schema = data.get("schema", None)

        logger.info("Listing data source tables. ID: %s", datasource_id)

        if datasource_id is None:
            message = "Datasource ID needs to be provided"
        else:
            ds_data = get_datasource_data_from_id(datasource_id, as_obj=True)
            if not ds_data or not getattr(ds_data, "active"):
                raise ValueError(
                    f"There exists no active datasource matching the provided id: {datasource_id}"
                )

            ds_name = getattr(ds_data, "connection_type")
            schema = None if SCHEMAS_AVAILABLE[ds_name] == False else schema

            table_names = get_table_list(ds_data.as_dict, schema)
            if table_names is None:
                message = "Error occurred while establishing DB Connection"
                table_names = []
            else:
                status = "success"
    except Exception as err:
        message = "Error in fetching table info: {}".format(err)
        logger.error("Error in data source table list: %s", err, exc_info=err)
    else:
        if status == "failure":
            logger.error("Error in data source table list: %s", message)

    return jsonify({"message": message, "status": status, "table_names": table_names})


@blueprint.route("/get-view-list", methods=["POST"])
def get_schema_views():
    """Returns a list of names of both views and materialized views."""
    status = "failure"
    message = ""
    view_names = []
    try:
        data = request.get_json()
        datasource_id = data.get("datasource_id", None)
        schema = data.get("schema", None)

        logger.info("Listing data source views. ID: %s", datasource_id)

        if datasource_id is None:
            message = "Datasource ID needs to be provided"
        else:
            ds_data = get_datasource_data_from_id(datasource_id, as_obj=True)
            if not ds_data or not getattr(ds_data, "active"):
                raise ValueError(
                    f"There exists no active datasource matching the provided id: {datasource_id}"
                )

            ds_name = getattr(ds_data, "connection_type")
            schema = None if SCHEMAS_AVAILABLE[ds_name] == False else schema

            view_names = get_view_list(ds_data.as_dict, schema)
            if view_names is None:
                message = "Error occurred while establishing DB Connection"
                view_names = []
            else:
                status = "success"
    except Exception as err:
        message = "Error in fetching table info: {}".format(err)
        logger.error("Error in data source views list: %s", err, exc_info=err)
    else:
        if status == "failure":
            logger.error("Error in data source views list: %s", message)

    return jsonify({"message": message, "status": status, "view_names": view_names})


@blueprint.route("/table-info", methods=["POST"])
def get_table_info():
    """Returns Columns and primary key of a given table/view in a Dict."""
    status = "failure"
    message = ""
    table_info = {}

    try:
        data = request.get_json()
        params_list = ["datasource_id", "schema", "table_name"]
        if not set(params_list).issubset(list(data.keys())):
            status = "failure"
            message = "Missing required parameters. Please follow request format"
            logger.error("Error in data source table info: %s", message)
            return jsonify(
                {"status": status, "message": message, "table_info": table_info}
            )

        datasource_id = data["datasource_id"]

        logger.info("Retrieving data source table info. ID: %s", datasource_id)

        schema = data["schema"]
        table_name = data["table_name"]
        ds_data = get_datasource_data_from_id(datasource_id, as_obj=True)
        if not ds_data or not getattr(ds_data, "active"):
            raise ValueError(
                f"There exists no active datasource matching the provided id: {datasource_id}"
            )

        ds_name = getattr(ds_data, "connection_type")

        schema = None if SCHEMAS_AVAILABLE[ds_name] == False else schema

        table_info = get_table_metadata(ds_data.as_dict, schema, table_name)
        if table_info is None:
            raise Exception("Unable to fetch table info for the requested table")
        else:
            status = "success"
    except Exception as e:
        status = "failure"
        message = "Error in fetching table info: {}".format(e)
        table_info = {}
        logger.error("Error in data source table info: %s", e, exc_info=e)
    else:
        if status == "failure":
            logger.error("Error in data source table info: %s", message)

    return jsonify({"table_info": table_info, "status": status, "message": message})
