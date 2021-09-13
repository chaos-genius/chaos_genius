from chaos_genius.databases.models.data_source_model import DataSource

def get_datasource_data_from_id(n: int) -> dict:
    """Returns the corresponding Data-Source data for the given Data-Source ID 
    from DATA_SOURCE_DATA.

    :param n: ID of Data-Source
    :type n: int

    :raises: ValueError

    :returns: Data-Source data
    :rtype: dict
    """

    datasource_info = DataSource.get_by_id(n)
    if datasource_info and datasource_info.safe_dict:
        return datasource_info.safe_dict
    raise ValueError(f"Data Source ID {n} not found in DATA_SOURCE_DATA")
