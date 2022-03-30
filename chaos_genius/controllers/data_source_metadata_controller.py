import json
import logging
from datetime import datetime
from typing import List, cast

from chaos_genius.connectors import (
    get_schema_names,
    get_sqla_db_conn,
    get_table_info,
    get_table_list,
)
from chaos_genius.controllers.data_source_controller import get_datasource_data_from_id
from chaos_genius.databases.models.data_source_metadata_model import DataSourceMetadata
from chaos_genius.databases.models.data_source_model import DataSource
from chaos_genius.utils.metadata_api_config import NON_THIRD_PARTY_DATASOURCES

logger = logging.getLogger(__name__)


def fetch_schema_list(data_source_id: int, as_obj: bool = False):
    """Fetch the schema list from the metadata of the given data source."""
    schema_list = []
    data_source_metadata: DataSourceMetadata = (
        DataSourceMetadata.query.filter(
            DataSourceMetadata.data_source_id == data_source_id,
            DataSourceMetadata.metadata_type == "schema_list",
        )
        .order_by(DataSourceMetadata.created_at.desc())
        .first()
    )
    if data_source_metadata:
        schema_list: List[str] = data_source_metadata.metadata_info.get("schema_list", [])

    if as_obj:
        return data_source_metadata
    else:
        return schema_list


def fetch_table_list(data_source_id: int, schema: str, as_obj: bool=False):
    """Fetch the table list from the metadata of the given data source and schema."""
    table_list = []
    data_source_metadata: DataSourceMetadata = (
        DataSourceMetadata.query.filter(
            DataSourceMetadata.data_source_id == data_source_id,
            DataSourceMetadata.metadata_type == "table_list",
            DataSourceMetadata.metadata_param == get_metadata_param_str([schema]),
        )
        .order_by(DataSourceMetadata.created_at.desc())
        .first()
    )
    if data_source_metadata:
        table_list = data_source_metadata.metadata_info.get("table_list", [])

    if as_obj:
        return data_source_metadata
    else:
        return table_list


def delete_table_list(data_source_id: int, schema: str):
    """Delete the table list from the metadata of the given data source and schema."""
    data_source_metadata: DataSourceMetadata = (
        DataSourceMetadata.query.filter(
            DataSourceMetadata.data_source_id == data_source_id,
            DataSourceMetadata.metadata_type == "table_list",
            DataSourceMetadata.metadata_param == get_metadata_param_str([schema]),
        )
        .order_by(DataSourceMetadata.created_at.desc())
        .first()
    )
    if data_source_metadata:
        data_source_metadata.delete(commit=True)


def fetch_table_info(data_source_id: int, schema: str, table: str, as_obj: bool=False):
    """Fetch the table info from the metadata of the given data source and table."""
    table_info = {}
    data_source_metadata: DataSourceMetadata = (
        DataSourceMetadata.query.filter(
            DataSourceMetadata.data_source_id == data_source_id,
            DataSourceMetadata.metadata_type == "table_info",
            DataSourceMetadata.metadata_param
            == get_metadata_param_str([schema, table]),
        )
        .order_by(DataSourceMetadata.created_at.desc())
        .first()
    )
    if data_source_metadata:
        table_info = data_source_metadata.metadata_info

    if as_obj:
        return data_source_metadata
    else:
        return table_info


def delete_table_info(data_source_id: int, schema: str, table: str):
    """Delete the table info from the metadata of the given data source and table"""
    data_source_metadata: DataSourceMetadata = (
        DataSourceMetadata.query.filter(
            DataSourceMetadata.data_source_id == data_source_id,
            DataSourceMetadata.metadata_type == "table_info",
            DataSourceMetadata.metadata_param
            == get_metadata_param_str([schema, table]),
        )
        .order_by(DataSourceMetadata.created_at.desc())
        .first()
    )
    if data_source_metadata:
        data_source_metadata.delete(commit=True)


def run_metadata_prefetch(data_source_id: int):
    """Fetch the metadata of the given data source."""

    data_source_obj = cast(DataSource, get_datasource_data_from_id(data_source_id, as_obj=True))
    sync_error = False

    if data_source_obj.connection_type not in NON_THIRD_PARTY_DATASOURCES:
        logger.warning(
            f"Datasource with id: {data_source_id} is a third-party datasource"
        )
        return False

    if data_source_obj.sync_status == "In Progress":
        logger.warning(
            f"Datasource with id: {data_source_id} already in Progress, skipping.."
        )
        return True

    try:
        data_source_obj.sync_status = "In Progress"
        data_source_obj.update(commit=True)

        db_connection = get_sqla_db_conn(data_source_obj.as_dict)

        schema_list, old_schemas_list = scan_db_and_save_schema_list(
            data_source_id, db_connection
        )
        for schema in schema_list:
            table_list, old_tables_list = scan_db_and_save_table_list(
                data_source_id, db_connection, schema
            )
            for table in table_list:
                _ = scan_db_and_save_table_info(
                    data_source_id, db_connection, schema, table
                )

            table_to_delete = list(set(old_tables_list) - set(table_list))
            for table in table_to_delete:
                delete_table_info(data_source_id, schema, table)

        schema_to_delete = list(set(old_schemas_list) - set(schema_list))
        for schema in schema_to_delete:
            delete_table_list(data_source_id, schema)

    except Exception as err:
        sync_error = True
        logger.error("Error in metadata prefetch.", exc_info=err)

    data_source_obj = cast(DataSource, get_datasource_data_from_id(data_source_id, as_obj=True))
    data_source_obj.sync_status = "Completed" if not sync_error else "Error"
    data_source_obj.last_sync = datetime.now()
    data_source_obj.update(commit=True)

    return True if not sync_error else False


def scan_db_and_save_schema_list(data_source_id, db_connection):
    """Scan the database for schema list."""
    schema_list = get_schema_names({}, from_db_conn=True, db_conn=db_connection)
    old_schemas = fetch_schema_list(data_source_id, as_obj=True)
    data_source_metadata = DataSourceMetadata(
        data_source_id=data_source_id,
        metadata_type="schema_list",
        metadata_param=get_metadata_param_str(),
        metadata_info={"schema_list": schema_list},
    )
    data_source_metadata.save(commit=True)
    old_schemas_list = []
    if old_schemas:
        old_schemas_list: List[str] = old_schemas.metadata_info.get("schema_list", [])
        old_schemas.delete(commit=True)
    return schema_list, old_schemas_list


def scan_db_and_save_table_list(data_source_id, db_connection, schema):
    """Scan the database for table list."""
    table_list = get_table_list({}, schema, from_db_conn=True, db_conn=db_connection)
    old_tables = fetch_table_list(data_source_id, schema, as_obj=True)
    data_source_metadata = DataSourceMetadata(
        data_source_id=data_source_id,
        metadata_type="table_list",
        metadata_param=get_metadata_param_str([schema]),
        metadata_info={"table_list": table_list},
    )
    data_source_metadata.save(commit=True)
    old_tables_list = []
    if old_tables:
        old_tables_list = old_tables.metadata_info.get("table_list", [])
        old_tables.delete(commit=True)
    return table_list, old_tables_list


def scan_db_and_save_table_info(data_source_id, db_connection, schema, table):
    """Scan the database for table info."""
    table_info = get_table_info(
        {}, schema, table, from_db_conn=True, db_conn=db_connection
    )
    old_table_info = fetch_table_info(data_source_id, schema, table, as_obj=True)
    data_source_metadata = DataSourceMetadata(
        data_source_id=data_source_id,
        metadata_type="table_info",
        metadata_param=get_metadata_param_str([schema, table]),
        metadata_info=table_info,
    )
    data_source_metadata.save(commit=True)
    if old_table_info:
        old_table_info.delete(commit=True)
    return table_info


def get_metadata_param_str(list_of_params=[]):
    """Get the metadata param string."""
    return json.dumps(list_of_params)
