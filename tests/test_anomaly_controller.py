"""Tests Anomaly Controller Functions."""

from dataclasses import dataclass
from datetime import datetime

import pandas as pd
import pytest
from _pytest.monkeypatch import MonkeyPatch
from pandas.testing import assert_frame_equal

from chaos_genius.core.anomaly.controller import AnomalyDetectionController
from chaos_genius.databases.models.data_source_model import DataSource


def load_input_data(file_name):
    """Load the test data."""
    df = pd.read_csv(file_name)
    df["dt"] = pd.to_datetime(df["dt"])
    return df


kpi_info_daily = {
    "id": 1,
    "data_source": 1,
    "kpi_type": "table",
    "aggregation": "sum",
    "datetime_column": "dt",
    "table_name": "lyft_data",
    "metric": "y",
    "anomaly_params": {
        "anomaly_period": 30,
        "seasonality": [],
        "sensitivity": "medium",
        "model_name": "EWMAModel",
        "frequency": "D",
    },
    "scheduler_params": {"scheduler_frequency": "D"},
}

kpi_info_hourly = {
    "id": 1,
    "data_source": 1,
    "kpi_type": "table",
    "aggregation": "sum",
    "datetime_column": "dt",
    "table_name": "cloud_cost",
    "metric": "y",
    "anomaly_params": {
        "anomaly_period": 30,
        "seasonality": [],
        "sensitivity": "medium",
        "model_name": "EWMAModel",
        "frequency": "H",
    },
    "scheduler_params": {"scheduler_frequency": "D"},
}


testdata_detect_anomaly = [
    (
        kpi_info_daily,
        "EWMAModel",
        "tests/test_data/input_daily_data.csv",
        datetime(2022, 1, 15),
        "overall",
        None,
        "D",
        pd.DataFrame(
            {
                "dt": [datetime(2022, 1, 16, 0, 0, 0)],
                "y": [19353.0],
                "yhat_lower": [14144.412922],
                "yhat_upper": [21216.619383],
                "anomaly": [0],
                "severity": [0.0],
            }
        ),
    ),
    (
        kpi_info_hourly,
        "EWMAModel",
        "tests/test_data/input_hourly_data.csv",
        datetime(2022, 1, 15, 23, 0, 0),
        "overall",
        None,
        "H",
        pd.DataFrame(
            {
                "dt": [datetime(2022, 1, 16, 0, 0, 0)],
                "y": [6.81],
                "yhat_lower": [9.582939],
                "yhat_upper": [14.374409],
                "anomaly": [-1],
                "severity": [34.093368],
            }
        ),
    ),
]


# Tests Anomaly Prediction on both daily and hourly data.
@pytest.mark.parametrize(
    "kpi_info,model_name,input_data_str,last_date,series,subgroup,frequency,expected",
    testdata_detect_anomaly,
    ids=["daily", "hourly"],
)
def test_detect_anomaly(
    monkeypatch: MonkeyPatch,
    kpi_info,
    model_name,
    input_data_str,
    last_date,
    series,
    subgroup,
    frequency,
    expected,
):
    """Tests calculation for prediction."""
    data_source = {
        "connection_type": "Postgres",
        "id": 1
    }

    @dataclass
    class TestDataSource:
        as_dict: dict

    def get_data_source(*args, **kwargs):
        return TestDataSource(data_source)

    monkeypatch.setattr(DataSource, "get_by_id", get_data_source)

    input_data = load_input_data(input_data_str)
    adc = AnomalyDetectionController(kpi_info, datetime(2022, 1, 16))
    pred_series = adc._detect_anomaly(
        model_name, input_data, last_date, series, subgroup, frequency
    )
    pred_series["anomaly"] = int(pred_series["anomaly"])

    assert_frame_equal(pred_series, expected)
