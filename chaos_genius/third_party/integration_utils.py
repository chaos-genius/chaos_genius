import json
from chaos_genius.settings import AIRBYTE_ENABLED


def get_connection_config():
    all_connection_configs = []
    with open('chaos_genius/third_party/data_connection_config.json') as fp:
        all_connection_configs = json.load(fp)
    if AIRBYTE_ENABLED:
        connection_configs = all_connection_configs
    else:
        connection_configs = [config for config in all_connection_configs if config["isThirdParty"] == False]
    return connection_configs


def get_activated_third_party_from_env():
    """Get the activated third party data source from the env file
    """
    # TODO: Use this function to get the activated third party data source from the env file
    return []
