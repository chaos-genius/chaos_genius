"""Provides constants for RCA."""

from datetime import timedelta

TIMELINES = ["mom", "wow", "dod"]

TIMELINE_NUM_DAYS_MAP = {"mom": 30, "wow": 7, "dod": 1}

LINE_DATA_TIMESTAMP_FORMAT = "%Y/%m/%d %H:%M:%S"

STATIC_END_DATA_FORMAT = "%Y-%m-%d"

TIME_DICT = {
    "mom": {
        "expansion": "month",
        "time_delta": timedelta(days=30, hours=0, minutes=0),
    },
    "wow": {
        "expansion": "week",
        "time_delta": timedelta(days=7, hours=0, minutes=0),
    },
    "dod": {
        "expansion": "day",
        "time_delta": timedelta(days=1, hours=0, minutes=0),
    },
}
