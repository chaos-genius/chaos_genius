from datetime import date, datetime, timezone


def get_server_timezone():
    return datetime.now(timezone.utc).astimezone().tzname()


def get_rca_timestamp(date_value):
    return datetime.strptime(date_value, "%Y/%m/%d %H:%M:%S").date()


def get_epoch_timestamp(date_value):
    if isinstance(date_value, date):
        date_value = datetime(
            date_value.year, date_value.month, date_value.day
        )
    return int(datetime.timestamp(date_value)) * 1000
