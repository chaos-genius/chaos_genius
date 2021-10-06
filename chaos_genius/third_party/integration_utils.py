import json


def get_connection_config():
    connection_configs = []
    with open('chaos_genius/third_party/data_connection_config.json') as fp:
        connection_configs = json.load(fp)
    return connection_configs
