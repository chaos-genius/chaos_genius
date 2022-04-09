from dataclasses import dataclass
from datetime import date, timedelta
import re

import pytest

from _pytest.monkeypatch import MonkeyPatch
from chaos_genius.core.utils import data_loader
from chaos_genius.databases.models.data_source_model import DataSource


def test_data_loader(monkeypatch: MonkeyPatch):

    # TODO: Add filters for testing

    kpi_info = {
        "datetime_column": "date",
        "id": 1,
        "kpi_query": "",
        "kpi_type": "table",
        "metric": "cloud_cost",
        "table_name": "cloud_cost",
        "data_source": {},
        "filters": "",
        "timezone_aware": False,
    }

    data_source = {
        "connection_type": "Postgres",
        "id": 1,
        "database_timezone": "Etc/UTC",
    }

    @dataclass
    class TestDataSource:
        as_dict: dict

    def get_data_source(*args, **kwargs):
        return TestDataSource(data_source)

    monkeypatch.setattr(DataSource, "get_by_id", get_data_source)

    # tail
    tail = 5
    dl = data_loader.DataLoader(kpi_info, tail=tail)
    output_query = f"""select * from "cloud_cost" limit {tail}"""
    assert output_query == dl._build_query().strip()

    # count
    dl = data_loader.DataLoader(kpi_info)
    output_query = 'select count(*) from "cloud_cost"'
    assert output_query == dl._build_query(count=True).strip()

    # query
    kpi_info = {
        "datetime_column": "date",
        "id": 1,
        "kpi_query": "select * from cloud_cost",
        "kpi_type": "query",
        "metric": "cloud_cost",
        "data_source": {},
        "filters": "",
        "timezone_aware": False,
    }

    dl = data_loader.DataLoader(kpi_info)
    output_query = (
        r"select \* from \(select \* from cloud_cost\) as \"[a-z]{10}\""
    )
    assert re.match(output_query, dl._build_query().strip())

    # tests for different date inputs
    kpi_info = {
        "datetime_column": "date",
        "id": 1,
        "kpi_query": "",
        "kpi_type": "table",
        "metric": "cloud_cost",
        "table_name": "cloud_cost",
        "data_source": {},
        "filters": "",
        "timezone_aware": False,
    }

    # no end_date, no start_date, no days_before
    dl = data_loader.DataLoader(kpi_info)
    output_query = """select * from "cloud_cost\""""
    assert output_query == dl._build_query().strip()

    # end_date, no start_date, no days_before
    end_date = date(2020, 1, 1)
    dl = data_loader.DataLoader(kpi_info, end_date=end_date)
    end_date = end_date + timedelta(days=1)
    output_query = f"""select * from "cloud_cost" where "date" < '{end_date.strftime("%Y-%m-%d")}T00:00:00'"""
    assert output_query == dl._build_query().strip()

    # no end_date, start_date, no days_before
    start_date = date(2019, 1, 1)
    dl = data_loader.DataLoader(kpi_info, start_date=start_date)
    output_query = f"""select * from "cloud_cost" where "date" >= '{start_date.strftime("%Y-%m-%d")}T00:00:00'"""
    assert output_query == dl._build_query().strip()

    # end_date, start_date, no days_before
    end_date = date(2020, 1, 1)
    start_date = date(2019, 1, 1)
    dl = data_loader.DataLoader(
        kpi_info, end_date=end_date, start_date=start_date
    )
    end_date = end_date + timedelta(days=1)
    output_query = f"""select * from "cloud_cost" where "date" >= '{start_date.strftime("%Y-%m-%d")}T00:00:00' and "date" < '{end_date.strftime("%Y-%m-%d")}T00:00:00'"""
    assert output_query == dl._build_query().strip()

    # no end_date, no start_date, days_before
    with pytest.raises(
        ValueError,
        match="If days_before is specified, either start_date or end_date must be specified",
    ):
        dl = data_loader.DataLoader(kpi_info, days_before=1)

    # end_date, no start_date, days_before
    end_date = date(2020, 1, 1)
    days_before = 30
    dl = data_loader.DataLoader(
        kpi_info, end_date=end_date, days_before=days_before
    )
    start_date = end_date - timedelta(days=days_before)
    end_date = end_date + timedelta(days=1)
    output_query = f"""select * from "cloud_cost" where "date" >= '{start_date.strftime("%Y-%m-%d")}T00:00:00' and "date" < '{end_date.strftime("%Y-%m-%d")}T00:00:00'"""
    assert output_query == dl._build_query().strip()

    # no end_date, start_date, days_before
    start_date = date(2019, 1, 1)
    days_before = 30
    dl = data_loader.DataLoader(
        kpi_info, start_date=start_date, days_before=days_before
    )
    end_date = start_date + timedelta(days=days_before)
    end_date = end_date + timedelta(days=1)
    output_query = f"""select * from "cloud_cost" where "date" >= '{start_date.strftime("%Y-%m-%d")}T00:00:00' and "date" < '{end_date.strftime("%Y-%m-%d")}T00:00:00'"""
    assert output_query == dl._build_query().strip()

    # end_date, start_date, days_before
    end_date = date(2020, 1, 1)
    start_date = date(2019, 1, 1)
    days_before = 30
    with pytest.raises(
        ValueError,
        match="end_date, start_date and days_before cannot be specified at the same time",
    ):
        dl = data_loader.DataLoader(
            kpi_info,
            end_date=end_date,
            start_date=start_date,
            days_before=days_before,
        )

    # tz naive testing
    data_source["database_timezone"] = "Asia/Kolkata"
    end_date = date(2020, 1, 1)
    start_date = date(2019, 1, 1)
    dl = data_loader.DataLoader(
        kpi_info, end_date=end_date, start_date=start_date
    )
    end_date = end_date + timedelta(days=1)
    output_query = f"""select * from "cloud_cost" where "date" >= '{start_date.strftime("%Y-%m-%d")}T05:30:00' and "date" < '{end_date.strftime("%Y-%m-%d")}T05:30:00'"""
    assert output_query == dl._build_query().strip()

    data_source["database_timezone"] = "America/New_York"
    start_date = start_date - timedelta(days=1)
    end_date = end_date - timedelta(days=1)
    output_query = f"""select * from "cloud_cost" where "date" >= '{start_date.strftime("%Y-%m-%d")}T20:00:00' and "date" < '{end_date.strftime("%Y-%m-%d")}T20:00:00'"""

    # tz aware testing
    kpi_info["timezone_aware"] = True
    data_source["database_timezone"] = "Asia/Kolkata"
    end_date = date(2020, 1, 1)
    start_date = date(2019, 1, 1)
    dl = data_loader.DataLoader(
        kpi_info, end_date=end_date, start_date=start_date
    )
    end_date = end_date + timedelta(days=1)
    output_query = f"""select * from "cloud_cost" where "date" >= '{start_date.strftime("%Y-%m-%d")}T00:00:00+00:00' and "date" < '{end_date.strftime("%Y-%m-%d")}T00:00:00+00:00'"""
    assert output_query == dl._build_query().strip()

    data_source["database_timezone"] = "America/New_York"
    start_date = start_date - timedelta(days=1)
    end_date = end_date - timedelta(days=1)
    output_query = f"""select * from "cloud_cost" where "date" >= '{start_date.strftime("%Y-%m-%d")}T00:00:00+00:00' and "date" < '{end_date.strftime("%Y-%m-%d")}T00:00:00+00:00'"""

    from chaos_genius import settings

    settings.TIMEZONE = "Asia/Kolkata"

    import importlib

    importlib.reload(data_loader)

    kpi_info["timezone_aware"] = True
    data_source["database_timezone"] = "Asia/Kolkata"
    end_date = date(2020, 1, 1)
    start_date = date(2019, 1, 1)
    dl = data_loader.DataLoader(
        kpi_info, end_date=end_date, start_date=start_date
    )
    end_date = end_date + timedelta(days=1)
    output_query = f"""select * from "cloud_cost" where "date" >= '{start_date.strftime("%Y-%m-%d")}T00:00:00+05:30' and "date" < '{end_date.strftime("%Y-%m-%d")}T00:00:00+05:30'"""
    assert output_query == dl._build_query().strip()

    data_source["database_timezone"] = "America/New_York"
    start_date = start_date - timedelta(days=1)
    end_date = end_date - timedelta(days=1)
    output_query = f"""select * from "cloud_cost" where "date" >= '{start_date.strftime("%Y-%m-%d")}T00:00:00+05:30' and "date" < '{end_date.strftime("%Y-%m-%d")}T00:00:00+05:30'"""
