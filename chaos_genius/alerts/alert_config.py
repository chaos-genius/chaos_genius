from copy import deepcopy

EMAIL_CONFIGS_EXPOSE = {
    "password": False,
    "port": True,
    "sender_email": True,
    "server": True,
    "username": False,
}

SLACK_CONFIGS_EXPOSE = {"webhook_url": False, "channel_name": True}


helper_objects = {"email": EMAIL_CONFIGS_EXPOSE, "slack": SLACK_CONFIGS_EXPOSE}

# TODO: Duplicate logic in the alert_cofig model too


def modified_config_state(config_state):
    config_obj = deepcopy(config_state)
    config_settings = config_state.get("config_setting", {})
    config_name = config_state.get("name")
    modified_state = {}
    for key, val in helper_objects.get(config_name, {}).items():
        if val is True:
            modified_state[key] = config_settings.get(key)
        else:
            real_val = config_settings.get(key, "")
            modified_state[key] = f"{real_val[:2]}********{real_val[-2:]}"
    config_obj["config_setting"] = modified_state
    return config_obj
