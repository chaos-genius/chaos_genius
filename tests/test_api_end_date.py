"""Tests for end_date calculation in API calls."""

from datetime import datetime

from chaos_genius.core.rca.rca_utils.api_utils import get_rca_output_end_date
from chaos_genius.views.anomaly_data_view import get_anomaly_output_end_date


def test_get_anomaly_output_end_date():
    """Test get_anomaly_output_end_date helper."""
    # TODO: Figure out how to get app context here

    # kpi_info = {"is_static": False, "static_params": {}, "id": 1}
    # end_date = get_anomaly_output_end_date(kpi_info)

    # assert end_date.date() == datetime.today().date()

    # kpi_info["is_static"] = True
    # end_date = get_anomaly_output_end_date(kpi_info)
    # assert end_date.date() == datetime.today().date()

    # TODO: fix get_anomaly_output_end_date to pass this test
    # kpi_info["static_params"] = None
    # end_date = get_anomaly_output_end_date(kpi_info)
    # assert end_date.date() == datetime.today().date()

    kpi_info = {"is_static": True, "static_params": {"end_date": "2021-10-02"}, "id": 1, "anomaly_params": {"frequency": "D"}}
    end_date = get_anomaly_output_end_date(kpi_info)
    assert end_date.date() == datetime(year=2021, month=10, day=2).date()

    kpi_info["static_params"] = {"end_date": "2021-10-02 11:22:33"}
    kpi_info["anomaly_params"] = {"frequency": "D"}
    end_date = get_anomaly_output_end_date(kpi_info)
    assert end_date == datetime(2021, 10, 2, 0, 0, 0)

    kpi_info["static_params"] = {"end_date": "2021-10-02 11:22:33"}
    kpi_info["anomaly_params"] = {"frequency": "H"}
    end_date = get_anomaly_output_end_date(kpi_info)
    assert end_date == datetime(2021, 10, 2, 11, 22, 33)


def test_get_rca_output_end_date():
    """Test get_rca_output_end_date helper."""
    kpi_info = {"is_static": False, "id": 1}
    end_date = get_rca_output_end_date(kpi_info)
    assert end_date == datetime.today().date()

    kpi_info = {"is_static": True, "static_params": {"end_date": "2021-10-02"}, "id": 1}
    end_date = get_rca_output_end_date(kpi_info)
    assert end_date == datetime(year=2021, month=10, day=2).date()
