"""Tests for miscellaneous helpers and utils."""

from datetime import datetime

from chaos_genius.views.anomaly_data_view import get_end_date


def test_get_end_date():
    """Test get_end_date helper."""
    # TODO: Figure out how to get app context here

    # kpi_info = {"is_static": False, "static_params": {}, "id": 1}
    # end_date = get_end_date(kpi_info)

    # assert end_date.date() == datetime.today().date()

    # kpi_info["is_static"] = True
    # end_date = get_end_date(kpi_info)
    # assert end_date.date() == datetime.today().date()

    # TODO: fix get_end_date to pass this test
    # kpi_info["static_params"] = None
    # end_date = get_end_date(kpi_info)
    # assert end_date.date() == datetime.today().date()

    kpi_info = {"is_static": True, "static_params": {"end_date": "2021-10-02"}, "id": 1, "anomaly_params": {"frequency": "D"}}
    end_date = get_end_date(kpi_info)
    assert end_date.date() == datetime(year=2021, month=10, day=2).date()

    kpi_info["static_params"] = {"end_date": "2021-10-02 11:22:33"}
    kpi_info["anomaly_params"] = {"frequency": "D"}
    end_date = get_end_date(kpi_info)
    assert end_date.date() == datetime(year=2021, month=10, day=2).date()
