from chaos_genius.controllers.config_controller import get_config_object

def get_creds(name):

    return HELPER_FUNC_DICT[name](name)

def get_email_creds(name):

    config_obj = get_config_object(name)
    if config_obj is None:
        return [
            "", "", "", "", "", False
        ]

    try:
        return [
            config_obj.config_setting['server'],
            int(config_obj.config_setting['port']),
            config_obj.config_setting['username'],
            config_obj.config_setting['password'],
            config_obj.config_setting['sender_email'],
            False
        ]
    except:
        return [
            "", "", "", "", "", False
        ]

def get_slack_creds(name):

    config_obj = get_config_object(name)
    if config_obj is None:
        return ""

    try:
        temp_var = config_obj.config_setting['webhook_url']
        return temp_var
    except:
        return ""

HELPER_FUNC_DICT = {
    "email": get_email_creds,
    "slack": get_slack_creds
}