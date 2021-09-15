from collections import defaultdict
from chaos_genius.databases.models.data_source_model import DataSource

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
            if prop_def_details.get('airbyte_secret', False):
                masked_value = '*'*len(value)
                masked_dict[prop] = masked_value[:16]
            else:
                masked_dict[prop] = value
        else:
            for inner_prop, inner_value in value.items():
                prop_def_details = source_def_prop.get(prop, {}).get('properties', {}).get(inner_prop, {})
                if prop_def_details.get('airbyte_secret', False):
                    masked_value = '*'*len(inner_value)
                    masked_dict[prop][inner_prop] = masked_value[:16]
                else:
                    masked_dict[prop][inner_prop] = inner_value
    return masked_dict
