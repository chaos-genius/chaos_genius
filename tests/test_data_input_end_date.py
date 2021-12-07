"""Tests for end_date calculation in Anomaly and RCA data loading calls."""

from datetime import datetime

from chaos_genius.core.utils.end_date import load_input_data_end_date


def test_load_input_data_end_date():
    """Test load_input_data_end_date helper."""

    kpi_info = {"is_static": True, "static_params": {"end_date": "2021-10-02"}, "id": 1, "anomaly_params": {"frequency": "D"}}
    end_date = load_input_data_end_date(kpi_info)
    assert end_date == datetime(year=2021, month=10, day=2).date()

    kpi_info["static_params"] = {"end_date": "2021-10-02 11:22:33"}
    kpi_info["anomaly_params"] = {"frequency": "D"}
    end_date = load_input_data_end_date(kpi_info)
    assert end_date == datetime(2021, 10, 2).date()

    kpi_info["static_params"] = {"end_date": "2021-10-02 11:22:33"}
    kpi_info["anomaly_params"] = {"frequency": "H"}
    end_date = load_input_data_end_date(kpi_info)
    assert end_date == datetime(2021, 10, 2).date()
