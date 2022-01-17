"""Provides constants for RCA."""

from chaos_genius.core.rca.rca_utils.time_range import (
    get_dates_for_last_7_days,
    get_dates_for_last_30_days,
    get_dates_for_month_on_month,
    get_dates_for_month_to_date,
    get_dates_for_previous_day,
    get_dates_for_week_on_week,
    get_dates_for_week_to_date,
)

LINE_DATA_TIMESTAMP_FORMAT = "%Y/%m/%d %H:%M:%S"

STATIC_END_DATA_FORMAT = "%Y-%m-%d"

TIME_RANGES_ALL = {
    "last_30_days": {
        "function": get_dates_for_last_30_days,
        "display_name": "Last 30 days",
        "last_period_name": "Previous 30 days",
        "current_period_name": "Last 30 days",
    },
    "last_7_days": {
        "function": get_dates_for_last_7_days,
        "display_name": "Last 7 days",
        "last_period_name": "Previous 7 days",
        "current_period_name": "Last 7 days",
    },
    "previous_day": {
        "function": get_dates_for_previous_day,
        "display_name": "Previous day",
        "last_period_name": "Previous day",
        "current_period_name": "This day",
    },
    "month_on_month": {
        "function": get_dates_for_month_on_month,
        "display_name": "Month on month",
        "last_period_name": "Previous month",
        "current_period_name": "MTD",
    },
    "month_to_date": {
        "function": get_dates_for_month_to_date,
        "display_name": "MTD",
        "last_period_name": "MTD Previous month",
        "current_period_name": "MTD",
    },
    "week_on_week": {
        "function": get_dates_for_week_on_week,
        "display_name": "Week on week",
        "last_period_name": "Previous week",
        "current_period_name": "WTD",
    },
    "week_to_date": {
        "function": get_dates_for_week_to_date,
        "display_name": "WTD",
        "last_period_name": "WTD Previous week",
        "current_period_name": "WTD",
    },
}

TIME_RANGES_KEYS_ALL = list(TIME_RANGES_ALL.keys())

# TODO: Create env var for this
TIME_RANGES_ACTIVE = {i: TIME_RANGES_ALL[i] for i in ["last_30_days", "last_7_days", "previous_day"]}

TIMERANGES_KEYS_ACTIVE = list(TIME_RANGES_ACTIVE.keys())
