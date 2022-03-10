"""Provides helper functions related to datetime operations."""

from datetime import date, datetime, timedelta, timezone

import pandas as pd
import pytz

from chaos_genius.core.utils.constants import SUPPORTED_TIMEZONES
from chaos_genius.settings import TIMEZONE


def get_server_timezone():
    """Get server timezone."""
    return datetime.now(timezone.utc).astimezone().tzname()


def get_rca_date_from_string(date_value):
    """Get RCA date from string."""
    return datetime.strptime(date_value, "%Y/%m/%d %H:%M:%S").date()


def get_datetime_string_with_tz(date_value, hourly=False) -> str:
    """Get date string with timezone."""
    if hourly:
        main_str = date_value.strftime("%d %b %Y %H:%M") + f" {TIMEZONE}"
    else:
        main_str = date_value.strftime("%d %b %Y") + f" {TIMEZONE}"
    return main_str


def _get_tz_from_offset_str(utc_offset_str):
    # TODO: update code when tz implementation is complete
    sign = -1 if utc_offset_str[-6] == "-" else 1
    utc_offset_mins = int(utc_offset_str[-2:]) * sign
    utc_offset_hrs = int(utc_offset_str[-5:-3]) * sign

    utc_offset = timedelta(hours=utc_offset_hrs, minutes=utc_offset_mins)

    timezones = pytz.all_timezones
    for tz_name in timezones:
        try:
            tz = pytz.timezone(tz_name)
            tz_offset = tz._transition_info[-1][0]
            if utc_offset == tz_offset:
                return tz
        except AttributeError:
            pass
    return _get_tz_from_offset_str("GMT+00:00")


def get_lastscan_string_with_tz(datetime_value_str) -> str:
    """Get last scan time in reporting timezone."""
    reporting_tz_offset = SUPPORTED_TIMEZONES[TIMEZONE]
    server_tz_offset = timezone(datetime.now().astimezone().utcoffset())

    datetime_value = pd.Timestamp(
        datetime.strptime(datetime_value_str, "%Y-%m-%dT%H:%M:%S.%f")
    ).tz_localize(tz=server_tz_offset)

    if reporting_tz_offset:
        timezone_info = _get_tz_from_offset_str(reporting_tz_offset)
    else:
        timezone_info = _get_tz_from_offset_str("GMT+00:00")

    datetime_value = datetime_value.tz_convert(tz=timezone_info)
    main_str = datetime_value.strftime("%d %b %Y %H:%M") + f" {TIMEZONE}"
    return main_str


def convert_datetime_to_timestamp(date_value) -> int:
    """Convert datetime to timestamp."""
    if isinstance(date_value, date):
        date_value = datetime(
            year=date_value.year, month=date_value.month, day=date_value.day
        )
    return int(date_value.timestamp()) * 1000
