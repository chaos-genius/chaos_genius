ANOMALY_TABLE_COLUMN_NAMES_MAPPER = {
    "series_type": "Dimension",
    "data_datetime": "Time of Occurrence",
    "y": "Value",
    "severity": "Severity Score"
}

IGNORE_COLUMNS_ANOMALY_TABLE = [
    "id",
    "index",
    "kpi_id",
    "is_anomaly"
]

ANOMALY_ALERT_COLUMN_NAMES = [
    "Dimension",
    "Time of Occurrence",
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