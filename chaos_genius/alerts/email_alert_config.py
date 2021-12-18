ANOMALY_TABLE_COLUMN_NAMES_MAPPER = {
    "series_type": "Dimension",
    "data_datetime": "Time of Occurence",
    "y": "Value",
    "severity": "Severity Score"
}

IGNORE_COLUMNS_ANOMALY_TABLE = [
    "id",
    "index",
    "kpi_id",
    "is_anomaly"
]

ANOMALY_ALERT_EMAIL_COLUMN_NAMES = [
    "Dimension",
    "Time of Occurence",
    "Value",
    "Expected Value",
    "Severity Score"
]

ANOMALY_TABLE_COLUMNS_HOLDING_FLOATS = [
    "y",
    "yhat_upper",
    "yhat_lower",
    "severity"
]