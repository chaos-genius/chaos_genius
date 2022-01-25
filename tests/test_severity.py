"""Tests calculation for severity."""

import pandas as pd
import pytest

from chaos_genius.core.anomaly.processor import ProcessAnomalyDetection


def load_input_data(file_name):
    """Load the test data."""
    df = pd.read_csv(file_name)
    df["dt"] = pd.to_datetime(df["dt"])
    return df


testdata = [
    (
        load_input_data("tests/test_data/input_daily_severity_data.csv"),
        63.21255684609762,
    ),
    (
        load_input_data("tests/test_data/input_hourly_severity_data.csv"),
        81.62169085104664,
    ),
]


@pytest.mark.parametrize(
    "input_data,expected",
    testdata,
    ids=["daily", "hourly"],
)
def test_severity(input_data, expected):

    pred_series = ProcessAnomalyDetection(
        "EWMAModel",
        input_data,
        "2022-03-09",
        30,
        "test_table",
        "D",
        "medium",
        14,
        "overall",
        None,
        {},
    )._detect_severity(input_data)

    assert pred_series["severity"].iloc[-1] == expected
