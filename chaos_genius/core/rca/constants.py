"""Provides constants for RCA."""

from chaos_genius.core.rca.rca_utils.time_range import (
    get_dates_for_last_7_days,
    get_dates_for_last_30_days,
    get_dates_for_month_on_month,
    get_dates_for_month_to_date,
    get_dates_for_previous_day,
    get_dates_for_quarter_on_quarter,
    get_dates_for_quarter_to_date,
    get_dates_for_week_on_week,
    get_dates_for_week_to_date,
)

LINE_DATA_TIMESTAMP_FORMAT = "%Y/%m/%d %H:%M:%S"

STATIC_END_DATA_FORMAT = "%Y-%m-%d"

TIME_RANGES = [
    {
        "label": "last_30_days",
        "values": {
            "function": get_dates_for_last_30_days,
            "display_name": "Last 30 days",
            "last_period_name": "Previous Period",
            "current_period_name": "Current Period",
        },
    },
    {
        "label": "last_7_days",
        "values": {
            "function": get_dates_for_last_7_days,
            "display_name": "Last 7 days",
            "last_period_name": "Previous Period",
            "current_period_name": "Current Period",
        },
    },
    {
        "label": "previous_day",
        "values": {
            "function": get_dates_for_previous_day,
            "display_name": "Previous day",
            "last_period_name": "Previous Period",
            "current_period_name": "Current Period",
        },
    },
    {
        "label": "month_on_month",
        "values": {
            "function": get_dates_for_month_on_month,
            "display_name": "Month on month",
            "last_period_name": "Previous month",
            "current_period_name": "MTD",
        },
    },
    {
        "label": "month_to_date",
        "values": {
            "function": get_dates_for_month_to_date,
            "display_name": "MTD",
            "last_period_name": "MTD Previous month",
            "current_period_name": "MTD",
        },
    },
    {
        "label": "week_on_week",
        "values": {
            "function": get_dates_for_week_on_week,
            "display_name": "Week on week",
            "last_period_name": "Previous week",
            "current_period_name": "WTD",
        },
    },
    {
        "label": "week_to_date",
        "values": {
            "function": get_dates_for_week_to_date,
            "display_name": "WTD",
            "last_period_name": "WTD Previous week",
            "current_period_name": "WTD",
        },
    },
    {
        "label": "quarter_on_quarter",
        "values": {
            "function": get_dates_for_quarter_on_quarter,
            "display_name": "Quarter on quarter",
            "last_period_name": "Previous quarter",
            "current_period_name": "QTD",
        },
    },
    {
        "label": "quarter_to_date",
        "values": {
            "function": get_dates_for_quarter_to_date,
            "display_name": "QTD",
            "last_period_name": "QTD Previous quarter",
            "current_period_name": "QTD",
        },
    },
]

TIME_RANGES_BY_KEY = {i["label"]: i["values"] for i in TIME_RANGES}
