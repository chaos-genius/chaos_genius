"""Tests for KPI Validation."""
import pandas as pd
from pytest_bdd import given, parsers, scenario, then, when
from sqlalchemy.sql.operators import endswith_op

from chaos_genius.core.utils.kpi_validation import _validate_kpi_from_df
from chaos_genius.databases.models.kpi_model import Kpi


@given("a newly added KPI and its DataFrame", target_fixture="new_kpi_df")
def new_kpi_df():  # noqa: D103
    kpi = Kpi(
        name="test_validation_kpi",
        data_source=0,
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
            ["2021-12-21", "2021-12-22", "2021-12-23", "2021-12-24"],
            [1, 2, 3, 4],
            ["a", "b", "c", "d"],
            ["q", "w", "e", "r"],
        ],
        columns=["date_col", "metric_col", "dim1", "dim2"],
    )
    return kpi, df


@then(
    parsers.parse("validation should {status}"), target_fixture="kpi_validation_message"
)
def check_kpi_validation(new_kpi_df, status):  # noqa: D103
    kpi: Kpi
    df: pd.DataFrame
    kpi, df = new_kpi_df

    kpi_info = kpi.as_dict

    valid, message = _validate_kpi_from_df(
        df,
        kpi_info,
        kpi_column_name=kpi_info["metric"],
        agg_type=kpi_info["aggregation"],
        date_column_name=kpi_info["datetime_column"],
        date_format=kpi_info.get("date_format"),
        unix_unit=kpi_info.get("unix_unit"),
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


# TODO: add remaining scenarios


@when("metric column name is incorrect", target_fixture="new_kpi_df")
def incorrect_metric_col(new_kpi_df, monkeypatch):  # noqa: D103
    kpi: Kpi
    df: pd.DataFrame
    kpi, df = new_kpi_df

    monkeypatch.setattr(kpi, "metric", "some_column_that_does_not_exist")

    return kpi, df


@when("date/time column name is incorrect", target_fixture="new_kpi_df")
def incorrect_datetime_col(new_kpi_df, monkeypatch):  # noqa: D103
    kpi: Kpi
    df: pd.DataFrame
    kpi, df = new_kpi_df

    monkeypatch.setattr(kpi, "datetime_column", "some_column_that_does_not_exist")

    return kpi, df
