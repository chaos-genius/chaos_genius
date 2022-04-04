from collections import defaultdict
from typing import List

from chaos_genius.connectors import test_connection
from chaos_genius.databases.models.data_source_model import DataSource
from chaos_genius.extensions import integration_connector as connector
from chaos_genius.settings import AIRBYTE_ENABLED
from chaos_genius.third_party.integration_server_config import SOURCE_WHITELIST_AND_TYPE
from chaos_genius.utils.metadata_api_config import NON_THIRD_PARTY_DATASOURCES


def get_datasource_data_from_id(n: int, as_obj: bool = False) -> dict:
    """Returns the corresponding Data-Source data for the given Data-Source ID
    from DATA_SOURCE_DATA.

    :param n: ID of Data-Source
    :type n: int

    :raises: ValueError

    :returns: Data-Source data
    :rtype: dict
    """

    datasource_info = DataSource.get_by_id(n)
    if datasource_info:
        if as_obj:
            return datasource_info
        else:
            return datasource_info.safe_dict
    raise ValueError(f"Data Source ID {n} not found in DATA_SOURCE_DATA")


def mask_sensitive_info(data_source_type_def: dict, data_source_details: dict) -> dict:
    """This will mask the sensitive info and return the dict

    Args:
        data_source_type_def (dict): Defination of the source type
        data_source_details (dict): Details of the data source

    Returns:
        dict: Masked values of the data source
    """
    masked_dict = defaultdict(dict)
    source_def_prop = data_source_type_def["connectionSpecification"]["properties"]
    for prop, value in data_source_details.items():
        if not isinstance(value, dict):
            prop_def_details = source_def_prop.get(prop, {})
            if prop_def_details.get("airbyte_secret", False):
                value = str(value)
                masked_dict[prop] = f"{value[:2]}********{value[-2:]}"
            else:
                masked_dict[prop] = value
        else:
            for inner_prop, inner_value in value.items():
                prop_def_details = (
                    source_def_prop.get(prop, {})
                    .get("properties", {})
                    .get(inner_prop, {})
                )
                if prop_def_details.get("airbyte_secret", False):
                    inner_value = str(inner_value)
                    masked_dict[prop][
                        inner_prop
                    ] = f"{inner_value[:2]}********{inner_value[-2:]}"
                else:
                    masked_dict[prop][inner_prop] = inner_value
    return masked_dict


def test_data_source(payload: dict) -> dict:
    """This will be used for testing the data source connection status

    Args:
        payload (dict): payload containing the source configuration and credentials

    Returns:
        dict: status of the connection
    """
    is_third_party = SOURCE_WHITELIST_AND_TYPE[payload["sourceDefinitionId"]]
    if is_third_party and not AIRBYTE_ENABLED:
        return {
            "message": "Airbyte is not enabled. Please enable Airbyte to test the third party connection",
            "status": "failed",
        }
    if is_third_party:
        connector_client = connector.connection
        for _property in [
            "connection_type",
            "sourceId",
            "workspaceId",
            "name",
            "sourceName",
        ]:
            payload.pop(_property, None)
        connection_status = connector_client.test_connection(payload)
    else:
        db_status, message = test_connection(payload)
        connection_status = {
            "message": message,
            "status": "succeeded" if db_status is True else "failed",
        }
    return connection_status


def update_third_party(payload):
    """This will be used for updating the third party data source

    Args:
        payload (dict): payload containing the source configuration and credentials

    Returns:
        dict: status of the connection
    """
    is_third_party = SOURCE_WHITELIST_AND_TYPE[payload["sourceDefinitionId"]]
    connection_status = {}
    if is_third_party:
        if AIRBYTE_ENABLED:
            connector_client = connector.connection
            for _property in [
                "sourceDefinitionId",
                "workspaceId",
                "sourceName",
                "connection_type",
            ]:
                payload.pop(_property, None)
            connection_status = connector_client.update_source(payload)
    return connection_status


def get_data_source_list(exclude_third_party=True) -> List[DataSource]:
    args = ()
    if exclude_third_party:
        args = (DataSource.connection_type.in_(NON_THIRD_PARTY_DATASOURCES),)
    data_sources = (
        DataSource.query.filter(DataSource.active == True, *args)  # noqa: E712
        .order_by(DataSource.created_at.desc())
        .all()
    )
    return data_sources
