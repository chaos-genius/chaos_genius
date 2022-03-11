"""Tests for KPI Validation."""
from typing import Tuple

import pandas as pd
import pytest
from _pytest.monkeypatch import MonkeyPatch
from pytest_bdd import given, parsers, scenario, then, when

from chaos_genius.core.utils.data_loader import DataLoader
from chaos_genius.core.utils.kpi_validation import _validate_kpi_from_df
from chaos_genius.databases.models.kpi_model import Kpi


@pytest.fixture
def mock_dataloader(monkeypatch):
    """Mock DataLoader to not hardcode init and get_count."""

    def mock_dataloader_init(_, *args, **kwargs):
        pass

    def mock_dataloader_get_count(_):
        return 100

    monkeypatch.setattr(DataLoader, "__init__", mock_dataloader_init)
    monkeypatch.setattr(DataLoader, "get_count", mock_dataloader_get_count)


@given("a newly added KPI and its DataFrame", target_fixture="new_kpi_df")
def new_kpi_df():  # noqa: D103
    kpi = Kpi(
        name="test_validation_kpi",
        data_source=-1,
        kpi_type="table",
        kpi_query="",
        table_name="some_table_that_should_not_exist",
        metric="metric_col",
        aggregation="sum",
        datetime_column="date_col",
        filters=[],
        dimensions=["dim1", "dim2"],
    )
    df = pd.DataFrame(
        [
            [
                "2021-12-21",
                "2022-03-10T14:34:12+05:30",
                1,
                "a",
                "q",
                "1",
                1.0,
                "Jan 19,17 05:04:50 PM",
                "2262-04-11 23:47:16.854775807",
                1641890403,
            ],
            [
                "2021-12-22",
                "2022-02-10T14:34:12+05:30",
                2,
                "b",
                "w",
                "2",
                1.1,
                "Jan 19,17 05:04:51 PM",
                "2262-04-12 23:47:16.854775807",
                1000000000,
            ],
            [
                "2021-12-23",
                "2022-01-10T14:34:12+05:30",
                3,
                "c",
                "e",
                "3",
                2.5,
                "Jan 19,17 05:04:52 PM",
                "2262-04-13 23:47:16.854775807",
                10,
            ],
            [
                "2021-12-24",
                "2021-12-10T14:34:12+05:30",
                4,
                "d",
                "r",
                "4",
                6.9,
                "Jan 19,17 05:04:53 PM",
                "2262-04-14 23:47:16.854775807",
                1641890438,
            ],
        ],
        columns=[
            "date_col",
            "datetime_timezone_aware",
            "metric_col",
            "dim1",
            "dim2",
            "dim3",
            "some_float_col",
            "invalid_time_col",
            "large_time_col",
            "unix_time",
        ],
    )
    # another col which is date but in string form
    df["date_col_str"] = df["date_col"]
    df["date_col"] = pd.to_datetime(df["date_col"])
    # another col which is tz-ware timestamp but in string form
    df["datetime_timezone_aware_str"] = df["datetime_timezone_aware"]
    df["datetime_timezone_aware"] = pd.to_datetime(df["datetime_timezone_aware"])
    return kpi, df


@pytest.fixture
def extra_kpi_validation_data():
    """A fixture to pass extra data to _validate_kpi_from_df.

    This dict will be passed a kwarg to it.
    """
    return {}


@then(
    parsers.parse("validation should {status}"), target_fixture="kpi_validation_message"
)
def check_kpi_validation(  # noqa: D103
    new_kpi_df: Tuple[Kpi, pd.DataFrame],
    status,
    mock_dataloader,
    extra_kpi_validation_data,
):
    kpi, df = new_kpi_df

    kpi_info = kpi.as_dict

    valid, message = _validate_kpi_from_df(
        df,
        kpi_info,
        kpi_column_name=kpi_info["metric"],
        agg_type=kpi_info["aggregation"],
        date_column_name=kpi_info["datetime_column"],
        **extra_kpi_validation_data,
    )

    if status == "pass":
        assert valid is True
    else:
        assert valid is False

    return message


@then(parsers.parse('error message should end with "{expected_msg}"'))
def message_ends_with(kpi_validation_message: str, expected_msg: str):  # noqa: D103
    assert kpi_validation_message.endswith(expected_msg)


@then(parsers.parse('error message should start with "{expected_msg}"'))
def message_starts_with(kpi_validation_message: str, expected_msg: str):  # noqa: D103
    assert kpi_validation_message.startswith(expected_msg)


@then(parsers.parse('error message should be "{expected_msg}"'))
def message_exact(kpi_validation_message: str, expected_msg: str):  # noqa: D103
    assert kpi_validation_message == expected_msg


@scenario("features/kpi_validation.feature", "metric column does not exist or invalid")
def test_metric_column_not_exist():  # noqa: D103
    pass


@scenario(
    "features/kpi_validation.feature", "date/time column does not exist or invalid"
)
def test_datetime_column_not_exist():  # noqa: D103
    pass


@scenario("features/kpi_validation.feature", "duplicate column names in obtained data")
def test_duplicate_cols():  # noqa: D103
    pass


@scenario("features/kpi_validation.feature", "invalid or unsupported aggregation")
def test_invalid_agg():  # noqa: D103
    pass


@scenario("features/kpi_validation.feature", "date column in dimensions")
def test_date_col_in_dimension():  # noqa: D103
    pass


@scenario("features/kpi_validation.feature", "metric column in dimensions")
def test_metric_col_in_dimension():  # noqa: D103
    pass


@scenario("features/kpi_validation.feature", "data has more than 10 million rows")
def test_more_than_10m_rows():  # noqa: D103
    pass


@scenario(
    "features/kpi_validation.feature", "numerical aggregation on categorical column"
)
def test_num_agg_on_cat_col():  # noqa: D103
    pass


@scenario("features/kpi_validation.feature", "numerical aggregation on a string column")
def test_num_agg_on_str_col():  # noqa: D103
    pass


@scenario(
    "features/kpi_validation.feature", "numerical aggregation on a numerical column"
)
def test_num_agg_on_num_col():  # noqa: D103
    pass


@scenario(
    "features/kpi_validation.feature", "metric column is same as date/time column"
)
def test_metric_col_is_date_col():  # noqa: D103
    pass


@scenario(
    "features/kpi_validation.feature", "date/time column is a floating point value"
)
def test_date_col_is_float():  # noqa: D103
    pass


@scenario("features/kpi_validation.feature", "date/time column is a date string")
def test_date_col_is_date_str():  # noqa: D103
    pass


@scenario(
    "features/kpi_validation.feature", "date/time column is some categorical string"
)
def test_date_col_is_cat():  # noqa: D103
    pass


@scenario(
    "features/kpi_validation.feature",
    "date/time column has a very large timestamp",
)
def test_date_very_large():  # noqa: D103
    pass


@scenario(
    "features/kpi_validation.feature",
    "date/time column has is in a weird format",
)
def test_date_weird():  # noqa: D103
    pass


@scenario(
    "features/kpi_validation.feature",
    "date/time column has unix timestamp",
)
def test_date_unix():  # noqa: D103
    pass


@scenario(
    "features/kpi_validation.feature",
    "date/time column is timezone-aware",
)
def test_datetime_timezone_aware():  # noqa: D103
    pass


@scenario(
    "features/kpi_validation.feature",
    "date/time column is timezone-aware for a Druid KPI",
)
def test_datetime_timezone_aware_druid():  # noqa: D103
    pass


@scenario(
    "features/kpi_validation.feature",
    "date/time column is timezone-aware but in string format",
)
def test_datetime_timezone_aware_str():  # noqa: D103
    pass


@when("metric column name is incorrect", target_fixture="new_kpi_df")
def incorrect_metric_col(  # noqa: D103
    new_kpi_df: Tuple[Kpi, pd.DataFrame], monkeypatch
):
    kpi, df = new_kpi_df

    monkeypatch.setattr(kpi, "metric", "some_column_that_does_not_exist")

    return kpi, df


@when("date/time column name is incorrect", target_fixture="new_kpi_df")
def incorrect_datetime_col(  # noqa: D103
    new_kpi_df: Tuple[Kpi, pd.DataFrame], monkeypatch
):
    kpi, df = new_kpi_df

    monkeypatch.setattr(kpi, "datetime_column", "some_column_that_does_not_exist")

    return kpi, df


@when("a column name is repeated", target_fixture="new_kpi_df")
def duplicate_col_name(new_kpi_df: Tuple[Kpi, pd.DataFrame]):  # noqa: D103
    kpi, df = new_kpi_df

    # add a column to DF
    df = pd.concat([df, pd.DataFrame(df["dim1"])], axis=1)

    return kpi, df


@when(
    parsers.parse('aggregation given for metric is invalid - say "{agg_name}"'),
    target_fixture="new_kpi_df",
)
def invalid_agg(  # noqa: D103
    new_kpi_df: Tuple[Kpi, pd.DataFrame], agg_name, monkeypatch
):
    kpi, df = new_kpi_df

    monkeypatch.setattr(kpi, "aggregation", agg_name)

    return kpi, df


@when("the date column is also included in dimension", target_fixture="new_kpi_df")
def date_col_in_dimension(  # noqa: D103
    new_kpi_df: Tuple[Kpi, pd.DataFrame], monkeypatch
):
    kpi, df = new_kpi_df

    monkeypatch.setattr(kpi, "dimensions", kpi.dimensions + ["date_col"])

    return kpi, df


@when("the metric column is also included in dimension", target_fixture="new_kpi_df")
def metric_col_in_dimension(  # noqa: D103
    new_kpi_df: Tuple[Kpi, pd.DataFrame], monkeypatch
):
    kpi, df = new_kpi_df

    monkeypatch.setattr(kpi, "dimensions", kpi.dimensions + ["metric_col"])

    return kpi, df


@when(
    "the data for KPI has 10,000,001 rows",
    target_fixture="mock_dataloader",
)
def more_than_10m_rows(mock_dataloader, monkeypatch):  # noqa: D103

    monkeypatch.setattr(DataLoader, "get_count", lambda _: 10_000_001)


@when(
    "a numerical aggregation (mean or sum) on a column with strings",
    target_fixture="new_kpi_df",
)
def num_agg_on_str_col(new_kpi_df: Tuple[Kpi, pd.DataFrame], monkeypatch):  # noqa: D103
    kpi, df = new_kpi_df

    monkeypatch.setattr(kpi, "metric", "dim3")
    monkeypatch.setattr(kpi, "aggregation", "sum")

    return kpi, df


@when(
    "a numerical aggregation (mean or sum) on a non-numerical column",
    target_fixture="new_kpi_df",
)
def num_agg_on_cat_col(new_kpi_df: Tuple[Kpi, pd.DataFrame], monkeypatch):  # noqa: D103
    kpi, df = new_kpi_df

    monkeypatch.setattr(kpi, "metric", "dim1")
    monkeypatch.setattr(kpi, "dimensions", ["dim2", "dim3"])
    monkeypatch.setattr(kpi, "aggregation", "sum")

    return kpi, df


@when(
    "a numerical aggregation (mean or sum) on a numerical column",
    target_fixture="new_kpi_df",
)
def num_agg_on_num_col(new_kpi_df: Tuple[Kpi, pd.DataFrame], monkeypatch):  # noqa: D103
    kpi, df = new_kpi_df

    monkeypatch.setattr(kpi, "metric", "metric_col")
    monkeypatch.setattr(kpi, "aggregation", "sum")

    return kpi, df


@when(
    "the metric column name is same as the date/time column",
    target_fixture="new_kpi_df",
)
def metric_col_is_date_col(  # noqa: D103
    new_kpi_df: Tuple[Kpi, pd.DataFrame], monkeypatch
):
    kpi, df = new_kpi_df

    monkeypatch.setattr(kpi, "datetime_column", "metric_col")

    return kpi, df


@when(
    "the date/time column is of type float",
    target_fixture="new_kpi_df",
)
def date_col_is_float(new_kpi_df: Tuple[Kpi, pd.DataFrame], monkeypatch):  # noqa: D103
    kpi, df = new_kpi_df

    monkeypatch.setattr(kpi, "datetime_column", "some_float_col")

    return kpi, df


@when(
    "the date/time column is a date string",
    target_fixture="new_kpi_df",
)
def date_col_is_date_str(  # noqa: D103
    new_kpi_df: Tuple[Kpi, pd.DataFrame], monkeypatch
):
    kpi, df = new_kpi_df

    monkeypatch.setattr(kpi, "datetime_column", "date_col_str")

    return kpi, df


@when(
    "the date/time column is a categorical string",
    target_fixture="new_kpi_df",
)
def date_col_is_cat(new_kpi_df: Tuple[Kpi, pd.DataFrame], monkeypatch):  # noqa: D103
    kpi, df = new_kpi_df

    monkeypatch.setattr(kpi, "datetime_column", "dim1")
    monkeypatch.setattr(kpi, "dimensions", ["dim2", "dim3"])

    return kpi, df


@when(
    "date/time column has a very large timestamp",
    target_fixture="new_kpi_df",
)
def date_very_large(new_kpi_df: Tuple[Kpi, pd.DataFrame], monkeypatch):  # noqa: D103
    kpi, df = new_kpi_df

    monkeypatch.setattr(kpi, "datetime_column", "large_time_col")

    return kpi, df


@when(
    "date/time column has is in a weird format",
    target_fixture="new_kpi_df",
)
def date_weird(new_kpi_df: Tuple[Kpi, pd.DataFrame], monkeypatch):  # noqa: D103
    kpi, df = new_kpi_df

    monkeypatch.setattr(kpi, "datetime_column", "invalid_time_col")

    return kpi, df


@when(
    "date/time column has integer unix timestamp",
    target_fixture="new_kpi_df",
)
def date_unix(new_kpi_df: Tuple[Kpi, pd.DataFrame], monkeypatch):  # noqa: D103
    kpi: Kpi
    df: pd.DataFrame
    kpi, df = new_kpi_df

    monkeypatch.setattr(kpi, "datetime_column", "unix_time")

    return kpi, df


@when(
    "date/time column is a timezone-aware timestamp",
    target_fixture="new_kpi_df",
)
def datetime_timezone_aware(  # noqa: D103
    new_kpi_df: Tuple[Kpi, pd.DataFrame], monkeypatch
):
    kpi: Kpi
    df: pd.DataFrame
    kpi, df = new_kpi_df

    monkeypatch.setattr(kpi, "datetime_column", "datetime_timezone_aware")

    return kpi, df


@when(
    "date/time column is a timezone-aware timestamp but in string format",
    target_fixture="new_kpi_df",
)
def datetime_timezone_aware_str(  # noqa: D103
    new_kpi_df: Tuple[Kpi, pd.DataFrame], monkeypatch
):
    kpi: Kpi
    df: pd.DataFrame
    kpi, df = new_kpi_df

    monkeypatch.setattr(kpi, "datetime_column", "datetime_timezone_aware_str")

    return kpi, df


@when("the KPI is from a Druid data source", target_fixture=extra_kpi_validation_data)
def is_druid_kpi(  # noqa: D103
    extra_kpi_validation_data: dict, monkeypatch: MonkeyPatch
):
    monkeypatch.setitem(extra_kpi_validation_data, "supports_tz_aware", True)

    return extra_kpi_validation_data
