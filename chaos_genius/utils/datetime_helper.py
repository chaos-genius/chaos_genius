"""Provides helper functions related to datetime operations."""

from datetime import date, datetime, timezone

from chaos_genius.core.utils.constants import SUPPORTED_TIMEZONES
from chaos_genius.settings import TIMEZONE


def get_server_timezone():
    """Get server timezone."""
    return datetime.now(timezone.utc).astimezone().tzname()


def get_rca_date_from_string(date_value):
    """Get RCA date from string."""
    return datetime.strptime(date_value, "%Y/%m/%d %H:%M:%S").date()


def get_date_string_with_tz(date_value) -> str:
    """Get date string with timezone."""
    tz_offset = SUPPORTED_TIMEZONES[TIMEZONE]
    main_str = date_value.strftime("%d %b %Y") + f" {TIMEZONE}"
    return f"{main_str} ({tz_offset})" if tz_offset != "" else main_str


def convert_datetime_to_timestamp(date_value) -> int:
    """Convert datetime to timestamp."""
    if isinstance(date_value, date):
        date_value = datetime(
            year=date_value.year, month=date_value.month, day=date_value.day
        )
    return int(date_value.timestamp()) * 1000
