"""Tests Anomaly Utility Functions."""

from datetime import datetime, timedelta

import pandas as pd
import pytest
from pandas.testing import assert_series_equal

from chaos_genius.core.anomaly.utils import (
    bound_between,
    get_timedelta,
    date_time_checker,
    fill_data,
)


@pytest.mark.parametrize(
    "value, expected",
    [(95, 95), (0, 0), (100, 100), (210, 100), (-50, 0)],
)
def test_bound_between(value, expected):
    """Bound value between min and max."""
    assert bound_between(0, value, 100) == expected


@pytest.mark.parametrize(
    "value, freq, expected",
    [(100, "D", timedelta(days=100)), (100, "H", timedelta(hours=100))],
    ids=["daily", "hourly"],
)
def test_get_timedelta(value, freq, expected):
    """Return a timedelta obj with the diff assigned to the appopriate offset."""
    assert get_timedelta(freq, value) == expected


def load_input_data(file_name):
    """Load the test data."""
    df = pd.read_csv(file_name)
    df["dt"] = pd.to_datetime(df["dt"])
    return df


testdata_time_checker = [
    (
        "tests/test_data/input_daily_data.csv",
        datetime(2022, 1, 15),
        "dt",
        "D",
        False,
    ),
    (
        "tests/test_data/input_daily_data.csv",
        datetime(2022, 1, 23),
        "dt",
        "D",
        True,
    ),
    (
        "tests/test_data/input_hourly_data.csv",
        datetime(2022, 1, 15, 23, 0, 0),
        "dt",
        "H",
        False,
    ),
    (
        "tests/test_data/input_hourly_data.csv",
        datetime(2022, 1, 16, 1, 0, 0),
        "dt",
        "H",
        True,
    ),
]


@pytest.mark.parametrize(
    "input_data_str, datetime_obj, dt_col, frequency, expected",
    testdata_time_checker,
    ids=["daily_false", "daily_true", "hourly_false", "hourly_true"],
)
def test_date_time_checker(input_data_str, datetime_obj, dt_col, frequency, expected):
    """Tests if datetime_obj is not present in the input dataframe."""
    input_data = load_input_data(input_data_str)
    assert date_time_checker(input_data, datetime_obj, dt_col, frequency) == expected


testdata_fill_data = [
    (
        "tests/test_data/input_daily_data.csv",
        "dt",
        "y",
        datetime(2022, 1, 16),
        30,
        datetime(2022, 1, 17),
        "D",
        pd.Series({"dt": datetime(2022, 1, 17), "y": 0.0}),
    ),
]


@pytest.mark.parametrize(
    "input_data_str, dt_col, metric_col, last_date, period, end_date, frequency, expected",
    testdata_fill_data,
    ids=["daily"],
)
def test_fill_data(
    input_data_str, dt_col, metric_col, last_date, period, end_date, frequency, expected
):
    input_data = load_input_data(input_data_str)
    output = fill_data(
        input_data, dt_col, metric_col, last_date, period, end_date, frequency
    )
    assert_series_equal(output.iloc[-1], expected, check_names=False)
