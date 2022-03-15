"""Tests Anomaly Processor Functions."""

from datetime import datetime

import pandas as pd
import pytest

from chaos_genius.core.anomaly.models.ewma_model import EWMAModel
from chaos_genius.core.anomaly.processor import ProcessAnomalyDetection


def load_input_data(file_name):
    """Load the test data."""
    df = pd.read_csv(file_name)
    df["dt"] = pd.to_datetime(df["dt"])
    return df


testdata_predict = [
    (
        "tests/test_data/input_daily_data.csv",
        datetime(2022, 1, 15),
        30,
        "D",
        pd.date_range(start="2022/1/16 00:00:00", periods=1, freq="D"),
    ),
    (
        "tests/test_data/input_hourly_data.csv",
        datetime(2022, 1, 15, 23, 0, 0),
        360,
        "H",
        pd.date_range(start="2022/1/16 00:00:00", periods=1, freq="H"),
    ),
]


@pytest.mark.parametrize(
    "input_data_str,last_date_in_db,anomaly_period,frequency,expected",
    testdata_predict,
    ids=["daily", "hourly"],
)
def test_anomaly_multiple_entries(
    input_data_str, last_date_in_db, anomaly_period, frequency, expected
):
    """Tests for multiple entries for last date in db in anomaly."""
    input_data = load_input_data(input_data_str)
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


testdata_detect_anomalies = [
    (
        pd.DataFrame(
            [[10766, 24711.63, 11880.44, 0]],
            columns=["y", "yhat_upper", "yhat_lower", "anomaly"],
        ),
        -1,
    ),
    (
        pd.DataFrame(
            [[32791, 24711.63, 11880.44, 0]],
            columns=["y", "yhat_upper", "yhat_lower", "anomaly"],
        ),
        1,
    ),
    (
        pd.DataFrame(
            [[15234, 24711.63, 11880.44, 0]],
            columns=["y", "yhat_upper", "yhat_lower", "anomaly"],
        ),
        0,
    ),
]


@pytest.mark.parametrize(
    "input_data,expected",
    testdata_detect_anomalies,
    ids=["negative_anomlay", "positve_anomaly", "no_anomaly"],
)
def test_detect_anomalies(input_data, expected):
    """Tests calculation for anomaly."""
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
    )._detect_anomalies(input_data)

    assert pred_series["anomaly"].iloc[0] == expected


testdata_detect_severity = [
    (
        "tests/test_data/input_daily_severity_data.csv",
        63.21255684609762,
    ),
    (
        "tests/test_data/input_hourly_severity_data.csv",
        81.62169085104664,
    ),
]


@pytest.mark.parametrize(
    "input_data_str,expected",
    testdata_detect_severity,
    ids=["daily", "hourly"],
)
def test_detect_severity(input_data_str, expected):
    """Tests calculation for severity."""
    input_data = load_input_data(input_data_str)
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
