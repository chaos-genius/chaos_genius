from chaos_genius.databases.models.config_setting_model import ConfigSetting
from chaos_genius.alerts.alert_config import modified_config_state


def get_modified_config_file(config_state, name):

    return modified_config_state(config_state, name)