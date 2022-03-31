"""Utilities for retrieving channel credentials from config-setting."""
from typing import Tuple

from chaos_genius.controllers.config_controller import get_config_object


# TODO: make a new type here to better represent the return value
#   ref: https://github.com/chaos-genius/chaos_genius/pull/836#discussion_r838085548
def get_email_creds() -> Tuple[str, int, str, str, str]:
    """Retrieves email channel configuration.

    Returns:
        A tuple of (host, port, username, password, sender_email)

    Raises:
        Exception: if email channel was not configured.
    """
    # TODO: remove hardcoding of "email" - use a constant or a function
    #   ref: https://github.com/chaos-genius/chaos_genius/pull/836#discussion_r838110482
    config_obj = get_config_object("email")
    if not config_obj:
        raise Exception("Email alert channel was not configured")

    email_config = config_obj.as_dict.get("config_setting")

    if not email_config:
        raise Exception("Email alert channel was not configured")

    return (
        email_config.get("server", ""),
        email_config.get("port", 0),
        email_config.get("username", ""),
        email_config.get("password", ""),
        email_config.get("sender_email", ""),
    )


def get_slack_creds() -> str:
    """Retrieves slack channel configuration.

    Returns:
        The slack webhook URL

    Raises:
        Exception: if slack channel was not configured.
    """
    config_obj = get_config_object("slack")
    if not config_obj:
        raise Exception("Slack alert channel was not configured")

    configs = config_obj.as_dict.get("config_setting")
    if not configs:
        raise Exception("Slack alert channel was not configured")

    if "webhook_url" not in configs:
        raise Exception(
            "Slack alert channel configuration is invalid. webhook_url was not found."
        )

    return configs["webhook_url"]
