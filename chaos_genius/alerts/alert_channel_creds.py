from chaos_genius.controllers.config_controller import get_config_object


def get_creds(name):
    return HELPER_FUNC_DICT[name](name)


def get_email_creds(name):
    config_obj = get_config_object(name)
    if config_obj is None:
        return "", "", "", "", ""

    configs = config_obj.as_dict.get("config_setting", {})
    return (
        configs.get("server", ""),
        configs.get("port", ""),
        configs.get("username", ""),
        configs.get("password", ""),
        configs.get("sender_email", ""),
    )


def get_slack_creds(name):
    config_obj = get_config_object(name)
    if config_obj is None:
        return ""

    configs = config_obj.as_dict.get("config_setting", {})
    return configs.get("webhook_url", "")


HELPER_FUNC_DICT = {"email": get_email_creds, "slack": get_slack_creds}
