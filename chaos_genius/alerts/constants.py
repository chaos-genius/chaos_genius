"""Constants used in alerts."""

import datetime

ALERT_DATETIME_FORMAT = "%Y-%m-%d %H:%M:%S"

ALERT_DATE_FORMAT = "%b %d %Y"

ALERT_READABLE_DATE_FORMAT = "%b %d"

ALERT_READABLE_DATETIME_FORMAT = "%b %d, %I %p"

ANOMALY_TABLE_COLUMN_NAMES_MAPPER = {
    "series_type": "Dimension",
    "data_datetime": "Time of Occurrence",
    "y": "Value",
    "severity": "Severity Score",
    "nl_message": "Change",
}

IGNORE_COLUMNS_ANOMALY_TABLE = ["id", "index", "kpi_id", "is_anomaly"]

ANOMALY_ALERT_COLUMN_NAMES = [
    "Dimension",
    "Time of Occurrence",
    "Value",
    "Expected Value",
    "Severity Score",
    "Change",
]

ANOMALY_TABLE_COLUMNS_HOLDING_FLOATS = ["y", "yhat_upper", "yhat_lower", "severity"]

FREQUENCY_DICT = {
    "weekly": datetime.timedelta(days=7, hours=0, minutes=0),
    "daily": datetime.timedelta(days=1, hours=0, minutes=0),
    "hourly": datetime.timedelta(days=0, hours=1, minutes=0),
    "every_15_minute": datetime.timedelta(days=0, hours=0, minutes=15),
    "every_minute": datetime.timedelta(days=0, hours=0, minutes=1),
}

OVERALL_KPI_SERIES_TYPE_REPR = "Overall KPI"
