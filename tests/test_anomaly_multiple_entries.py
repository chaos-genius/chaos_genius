"""Tests for multiple entries for last date in db in anomaly."""

from datetime import datetime

import pandas as pd
import pytest

from chaos_genius.core.anomaly.processor import ProcessAnomalyDetection
from chaos_genius.core.anomaly.models.ewma_model import EWMAModel


def load_input_data(file_name):
    """Load the test data."""
    df = pd.read_csv(file_name)
    df["dt"] = pd.to_datetime(df["dt"])
    return df


testdata = [
    (
        load_input_data(
            "tests/test_data/input_daily_data.csv"
        ),
        datetime(2022, 1, 15),
        30,
        "D",
        pd.date_range(start="2022/1/16 00:00:00", periods=1, freq="D"),
    ),
    (
        load_input_data(
            "tests/test_data/input_hourly_data.csv"
        ),
        datetime(2022, 1, 15, 23, 0, 0),
        336,
        "H",
        pd.date_range(start="2022/1/16 00:00:00", periods=24, freq="H"),
    ),
]


@pytest.mark.parametrize(
    "input_data,last_date_in_db,anomaly_period,frequency,expected",
    testdata,
    ids=["daily", "hourly"],
)
def test_anomaly_multiple_entries(
    input_data, last_date_in_db, anomaly_period, frequency, expected
):

    pred_series = ProcessAnomalyDetection(
        "EWMAModel",
        input_data,
        last_date_in_db,
        anomaly_period,
        "test_table",
        frequency,
        "medium",
        14,
        "overall",
        None,
        {},
    )._predict(EWMAModel())

    assert (pred_series["dt"].to_list() == expected).all()
