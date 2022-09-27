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


anomaly_data_metrics = {
    "negative_anomaly": pd.DataFrame(
        [[pd.Timestamp("2022-03-10"), 10766, 24711.63, 11880.44, -1]],
        columns=["dt", "y", "yhat_upper", "yhat_lower", "anomaly"],
    ),
    "positive_anomaly": pd.DataFrame(
        [[pd.Timestamp("2022-03-10"), 32791, 24711.63, 11880.44, 1]],
        columns=["dt", "y", "yhat_upper", "yhat_lower", "anomaly"],
    ),
    "no_anomaly": pd.DataFrame(
        [[pd.Timestamp("2022-03-10"), 15234, 24711.63, 11880.44, 0]],
        columns=["dt", "y", "yhat_upper", "yhat_lower", "anomaly"],
    ),
}


testdata_calculate_metrics = [
    (anomaly_data_metrics["negative_anomaly"], "overall", 20000, 6000, {}, [6.19, 0]),
    (anomaly_data_metrics["positive_anomaly"], "subdim", 20000, 6000, {pd.Timestamp("2022-03-10"): 1000}, [44.89, 17.22]),  # noqa: E501
    (anomaly_data_metrics["no_anomaly"], "overall", 20000, 0, {}, [0, 0]),
]


@pytest.mark.parametrize(
    "input_data,series,mean,std_dev,deviation_dict,expected",
    testdata_calculate_metrics,
    ids=["negative_overall_anomlay", "positve_subdim_anomaly", "zero_std_dev"],
)
def test_calculate_metrics(input_data, series, mean, std_dev, deviation_dict, expected):
    """Tests metric calculation of prediction df."""
    pred_series = ProcessAnomalyDetection(
        "EWMAModel",
        input_data,
        "2022-03-09",
        30,
        "test_table",
        "D",
        "medium",
        14,
        series,
        None,
        deviation_dict,
    )._calculate_metrics(input_data, mean, std_dev)

    assert pred_series["severity"].iloc[0].round(2) == expected[0]
    assert pred_series["impact"].iloc[0].round(2) == expected[1]


@pytest.mark.parametrize(
    "input_data,expected",
    [
        (anomaly_data_metrics["negative_anomaly"], -1),
        (anomaly_data_metrics["positive_anomaly"], 1),
        (anomaly_data_metrics["no_anomaly"], 0),
    ],
    ids=["negative_anomlay", "positve_anomaly", "no_anomaly"],
)
def test_detect_anomalies(input_data, expected):
    """Tests detection for anomaly."""
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
    )._detect_anomalies(input_data)

    assert pred_series["anomaly"].iloc[0] == expected


def test_compute_deviations():
    """Tests deviation from mean computation."""
    input_data = pd.DataFrame(
        [[pd.Timestamp("2022-03-10"), 10766, 24711.63, 11880.44, -1]],
        columns=["dt", "y", "yhat_upper", "yhat_lower", "anomaly"],
    )

    pred_series_obj = ProcessAnomalyDetection(
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
    )
    pred_series = pred_series_obj._compute_deviations(input_data, 20000)

    assert pred_series["deviation_from_mean"].iloc[0] == -9234
    assert pred_series_obj.deviation_from_mean_dict == {
        pd.Timestamp("2022-03-10"): -9234
    }


@pytest.mark.parametrize(
    "input_data,std_dev,expected",
    [
        (anomaly_data_metrics["negative_anomaly"], 6000, 0.19),
        (anomaly_data_metrics["positive_anomaly"], 6000, 1.35),
        (anomaly_data_metrics["no_anomaly"], 6000, 0),
    ],
    ids=["negative_anomlay", "positive_anomaly", "no_anomaly"],
)
def test_compute_zscore(input_data, std_dev, expected):
    """Tests calculation of zscore."""
    pred_series_obj = ProcessAnomalyDetection(
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
    )
    pred_series_obj.input_data["zscore"] = pred_series_obj.input_data.apply(
        lambda x: pred_series_obj._compute_zscore(x, std_dev), axis=1
    )

    assert pred_series_obj.input_data["zscore"].iloc[0].round(2) == expected


def test_compute_severity():
    """Tests calculation of severity given zscore."""
    pred_series_obj = ProcessAnomalyDetection(
        "EWMAModel",
        pd.DataFrame(),
        "2022-03-09",
        30,
        "test_table",
        "D",
        "medium",
        14,
        "overall",
        None,
        {},
    )

    assert pred_series_obj._compute_severity(-5) == 0
    assert pred_series_obj._compute_severity(1.5) == 50
    assert pred_series_obj._compute_severity(4.5) == 100


def test_compute_impact():
    """Tests calculation of impact for subdimensions."""
    input_data = pd.DataFrame(
        [
            [pd.Timestamp("2022-03-10"), 1000, 1.2, 0],
            [pd.Timestamp("2022-03-11"), -500, 0.5, 0],
            [pd.Timestamp("2022-03-12"), 23, 0.03, 0],
            [pd.Timestamp("2022-03-13"), 2500, 3, 0],
            [pd.Timestamp("2022-03-14"), 10, 0.01, 0],
        ],
        columns=["dt", "deviation_from_mean", "zscore", "impact"],
    )
    deviation_dict = {
        pd.Timestamp("2022-03-10"): 5000,
        pd.Timestamp("2022-03-11"): 2000,
        pd.Timestamp("2022-03-13"): 4000,
    }

    pred_series = ProcessAnomalyDetection(
        "EWMAModel",
        input_data,
        "2022-03-09",
        30,
        "test_table",
        "D",
        "medium",
        14,
        "subdim",
        None,
        deviation_dict,
    )._compute_impact(input_data)

    assert pred_series["impact"].to_list() == [0.24, 0.125, 0, 1.875, 0]
