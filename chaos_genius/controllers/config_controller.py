from chaos_genius.databases.models.config_setting_model import ConfigSetting
from chaos_genius.alerts.alert_config import modified_config_state
from chaos_genius.connectors.postgres import PostgresDb
from chaos_genius.settings import (
    DB_HOST,
    DB_USERNAME,
    DB_PASSWORD,
    DB_PORT,
    META_DATABASE
)

def get_modified_config_file(safe_dict, name):
    return modified_config_state(safe_dict)

def get_meta_db_connection_status():
    status, message = "", ""
    try:
        ds_info = {
            "host": DB_HOST,
            "username": DB_USERNAME,
            "password": DB_PASSWORD,
            "port": DB_PORT,
            "database": META_DATABASE
        }

        pg_connector_obj = PostgresDb(connection_info = ds_info)
        status, message = pg_connector_obj.test_connection()
    except Exception as err:
        status = False
        message = "There might be an issue with the environment variables"
    return (status, message)

def get_config_object(name):
    return ConfigSetting.query.filter_by(name=name, active=True).first()


def create_config_object(config_name, config_settings):
    return ConfigSetting(
        name=config_name,
        config_setting=config_settings,
        active=True
    )


def get_all_configurations():
    result = []
    configs = ConfigSetting.query.filter_by(active=True).all()

    for config in configs:
        config_state = get_modified_config_file(config.safe_dict, config.name)
        result.append(config_state)

    return result
