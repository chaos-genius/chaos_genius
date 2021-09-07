import json

EMAIL_CONFIGS_EXPOSE = {
    "password": False,
    "port": True,
    "sender_email": True,
    "server": True,
    "username": False
}

helper_objects = {
    'email': EMAIL_CONFIGS_EXPOSE,
    # 'slack': SLACK_CONFIGS_EXPOSE #for future purposes
}

def modified_config_state(config_state, name):
    for key, val in helper_objects[name].items():
        if val == False:
            del config_state[key]

