import json
import logging

from chaos_genius.databases.models.data_source_metadata_model import DataSourceMetadata
from chaos_genius.controllers.data_source_controller import get_datasource_data_from_id
from chaos_genius.connectors import (
    get_sqla_db_conn,
    get_schema_names,
    get_table_list,
    get_table_info,
)

logger = logging.getLogger(__name__)


def run_metadata_prefetch(data_source_id, first_time=False):
    """Fetch the metadata of the given data source."""

    data_source_obj = get_datasource_data_from_id(data_source_id, as_obj=True)
    sync_error = False

    if first_time:
        data_source_obj.sync_status = "In Progress"
        data_source_obj.update(commit=True)

    try:
        db_connection = get_sqla_db_conn(data_source_obj.as_dict)

        schema_list = scan_db_and_save_schema_list(data_source_id, db_connection)
        for schema in schema_list:
            table_list = scan_db_and_save_table_list(data_source_id, db_connection, schema)
            for table in table_list:
                _ = scan_db_and_save_table_info(data_source_id, db_connection, schema, table)

    except Exception as err:
        sync_error = True
        logger.error(err)

    if first_time:
        data_source_obj = get_datasource_data_from_id(data_source_id, as_obj=True)
        data_source_obj.sync_status = "Completed" if not sync_error else "Error"
        data_source_obj.update(commit=True)
    return True if not sync_error else False


def scan_db_and_save_schema_list(data_source_id, db_connection):
    """Scan the database for schema list."""
    schema_list = get_schema_names({}, from_db_conn=True, db_conn=db_connection)
    data_source_metadata = DataSourceMetadata(
        data_source_id=data_source_id,
        metadata_type="schema_list",
        metadata_param=get_metadata_param_str(),
        metadata_info={"schema_list": schema_list},
    )
    data_source_metadata.save(commit=True)
    return schema_list


def scan_db_and_save_table_list(data_source_id, db_connection, schema):
    """Scan the database for table list."""
    table_list = get_table_list({}, schema, from_db_conn=True, db_conn=db_connection)
    data_source_metadata = DataSourceMetadata(
        data_source_id=data_source_id,
        metadata_type="table_list",
        metadata_param=get_metadata_param_str([schema]),
        metadata_info={"table_list": table_list},
    )
    data_source_metadata.save(commit=True)
    return table_list


def scan_db_and_save_table_info(data_source_id, db_connection, schema, table):
    """Scan the database for table info."""
    table_info = get_table_info(
        {}, schema, table, from_db_conn=True, db_conn=db_connection
    )
    data_source_metadata = DataSourceMetadata(
        data_source_id=data_source_id,
        metadata_type="table_info",
        metadata_param=get_metadata_param_str([schema, table]),
        metadata_info=table_info,
    )
    data_source_metadata.save(commit=True)
    return table_info


def get_metadata_param_str(list_of_params=[]):
    """Get the metadata param string."""
    return json.dumps(list_of_params)
