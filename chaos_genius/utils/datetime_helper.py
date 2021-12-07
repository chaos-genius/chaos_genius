from datetime import datetime, timezone


def get_server_timezone():
    return datetime.now(timezone.utc).astimezone().tzname()


def get_rca_timestamp(date):
    return datetime.strptime(date, '%Y/%m/%d %H:%M:%S')


def get_epoch_timestamp(date):
    return int(datetime.timestamp(date)) * 1000
