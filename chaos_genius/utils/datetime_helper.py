from datetime import datetime, timezone


def get_server_timezone():
    return datetime.now(timezone.utc).astimezone().tzname()
