"""Constants used in alerts."""

import datetime

ALERT_DATETIME_FORMAT = "%Y-%m-%d %H:%M:%S"

ALERT_DATE_FORMAT = "%b %d %Y"

ALERT_READABLE_DATE_FORMAT = "%b %d"

ALERT_READABLE_DATETIME_FORMAT = "%b %d, %I %p"

ALERT_READABLE_DATA_TIMESTAMP_FORMAT = "%b %d %Y %H:%M:%S"

ANOMALY_TABLE_COLUMN_NAMES_MAPPER = {
    "series_type": "Dimension",
    "data_datetime": "Time of Occurrence",
    "y": "Value",
    "severity": "Severity Score",
    "change_message": "Change",
    "expected_value": "Expected Value",
}

FREQUENCY_DICT = {
    "weekly": datetime.timedelta(days=7, hours=0, minutes=0),
    "daily": datetime.timedelta(days=1, hours=0, minutes=0),
    "hourly": datetime.timedelta(days=0, hours=1, minutes=0),
    "every_15_minute": datetime.timedelta(days=0, hours=0, minutes=15),
    "every_minute": datetime.timedelta(days=0, hours=0, minutes=1),
}

OVERALL_KPI_SERIES_TYPE_REPR = "Overall KPI"
