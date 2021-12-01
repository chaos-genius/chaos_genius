from sqlalchemy_utils import database_exists

from chaos_genius.databases.models.config_setting_model import ConfigSetting
from chaos_genius.alerts.alert_config import modified_config_state
from chaos_genius.settings import SQLALCHEMY_DATABASE_URI

def get_modified_config_file(safe_dict, name):
    return modified_config_state(safe_dict)

def get_meta_db_uri():
    return SQLALCHEMY_DATABASE_URI

def get_meta_db_connection_status(META_DB_URI):
    if not database_exists(META_DB_URI):
        return False
    return True

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
