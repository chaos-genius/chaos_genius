from dataclasses import dataclass
from datetime import date, timedelta
import re

from _pytest.monkeypatch import MonkeyPatch
from chaos_genius.core.utils.data_loader import DataLoader
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
    }

    data_source = {
        "connection_type": "Postgres",
        "id": 1
    }

    @dataclass
    class TestDataSource:
        as_dict: dict

    def get_data_source(*args, **kwargs):
        return TestDataSource(data_source)

    monkeypatch.setattr(DataSource, "get_by_id", get_data_source)

    # table, end_date, start_date
    end_date = date(2020, 1, 1)
    start_date = date(2019, 1, 1)
    dl = DataLoader(
        kpi_info,
        end_date=end_date,
        start_date=start_date
    )
    end_date = end_date + timedelta(days=1)
    output_query = f"""select * from "cloud_cost" where "date" >= '{start_date.strftime("%Y-%m-%d")}' and "date" < '{end_date.strftime("%Y-%m-%d")}'"""
    assert output_query == dl._build_query().strip()

    # table, end_date, start_date, count
    output_query = f"""select count(*) from "cloud_cost" where "date" >= '{start_date.strftime("%Y-%m-%d")}' and "date" < '{end_date.strftime("%Y-%m-%d")}'"""
    assert output_query == dl._build_query(count=True).strip()

    # table, end_date, start_date, tail
    dl = DataLoader(
        kpi_info,
        end_date=end_date,
        start_date=start_date,
        tail=10
    )
    end_date = end_date + timedelta(days=1)
    output_query = f"""select * from "cloud_cost" where "date" >= '{start_date.strftime("%Y-%m-%d")}' and "date" < '{end_date.strftime("%Y-%m-%d")}' limit 10"""
    assert output_query == dl._build_query().strip()

    # table, end_date, days_before
    end_date = date(2020, 1, 1)
    days_before = 30
    start_date = end_date - timedelta(days=days_before)
    dl = DataLoader(
        kpi_info,
        end_date=end_date,
        days_before=days_before
    )
    end_date = end_date + timedelta(days=1)
    output_query = f"""select * from "cloud_cost" where "date" >= '{start_date.strftime("%Y-%m-%d")}' and "date" < '{end_date.strftime("%Y-%m-%d")}'"""
    assert output_query == dl._build_query().strip()

    # table, end_date, days_before, count
    output_query = f"""select count(*) from "cloud_cost" where "date" >= '{start_date.strftime("%Y-%m-%d")}' and "date" < '{end_date.strftime("%Y-%m-%d")}'"""
    assert output_query == dl._build_query(count=True).strip()

    # table, end_date, days_before, tail
    end_date = date(2020, 1, 1)
    dl = DataLoader(
        kpi_info,
        end_date=end_date,
        days_before=days_before,
        tail=10
    )
    end_date = end_date + timedelta(days=1)
    output_query = f"""select * from "cloud_cost" where "date" >= '{start_date.strftime("%Y-%m-%d")}' and "date" < '{end_date.strftime("%Y-%m-%d")}' limit 10"""
    assert output_query == dl._build_query().strip()

    kpi_info = {
        "datetime_column": "date",
        "id": 1,
        "kpi_query": "select * from cloud_cost",
        "kpi_type": "query",
        "metric": "cloud_cost",
        "data_source": {},
        "filters": "",
    }

    # query, end_date, start_date
    end_date = date(2020, 1, 1)
    start_date = date(2019, 1, 1)
    dl = DataLoader(
        kpi_info,
        end_date=end_date,
        start_date=start_date
    )
    end_date = end_date + timedelta(days=1)
    output_query = r"select \* from \(select \* from cloud_cost\) as \"[a-z]{10}\""\
        + f""" where "date" >= '{start_date.strftime("%Y-%m-%d")}' and "date" < '{end_date.strftime("%Y-%m-%d")}'"""
    assert re.match(output_query, dl._build_query().strip())

    # query, end_date, start_date, count
    output_query = r"select count\(\*\) from \(select \* from cloud_cost\) as \"[a-z]{10}\""\
        + f""" where "date" >= '{start_date.strftime("%Y-%m-%d")}' and "date" < '{end_date.strftime("%Y-%m-%d")}'"""
    assert re.match(output_query, dl._build_query(count=True).strip())

    # query, end_date, start_date, tail
    end_date = date(2020, 1, 1)
    dl = DataLoader(
        kpi_info,
        end_date=end_date,
        start_date=start_date,
        tail=10
    )
    end_date = end_date + timedelta(days=1)
    # output_query = f"""select * from (select * from cloud_cost) where "date" >= '{start_date.strftime("%Y-%m-%d")}' and "date" < '{end_date.strftime("%Y-%m-%d")}' limit 10"""
    # assert output_query == dl._build_query().strip()
    output_query = r"select \* from \(select \* from cloud_cost\) as \"[a-z]{10}\""\
        + f""" where "date" >= '{start_date.strftime("%Y-%m-%d")}' and "date" < '{end_date.strftime("%Y-%m-%d")}' limit 10"""
    assert re.match(output_query, dl._build_query().strip())

    # query, end_date, days_before
    end_date = date(2020, 1, 1)
    days_before = 30
    start_date = end_date - timedelta(days=days_before)
    dl = DataLoader(
        kpi_info,
        end_date=end_date,
        days_before=days_before
    )
    end_date = end_date + timedelta(days=1)
    output_query = r"select \* from \(select \* from cloud_cost\) as \"[a-z]{10}\""\
        + f""" where "date" >= '{start_date.strftime("%Y-%m-%d")}' and "date" < '{end_date.strftime("%Y-%m-%d")}'"""
    assert re.match(output_query, dl._build_query().strip())

    # query, end_date, days_before, count
    output_query = r"select count\(\*\) from \(select \* from cloud_cost\) as \"[a-z]{10}\""\
        + f""" where "date" >= '{start_date.strftime("%Y-%m-%d")}' and "date" < '{end_date.strftime("%Y-%m-%d")}'"""
    assert re.match(output_query, dl._build_query(count=True).strip())

    # query, end_date, days_before, tail
    end_date = date(2020, 1, 1)
    dl = DataLoader(
        kpi_info,
        end_date=end_date,
        days_before=days_before,
        tail=10
    )
    end_date = end_date + timedelta(days=1)
    output_query = r"select \* from \(select \* from cloud_cost\) as \"[a-z]{10}\""\
        + f""" where "date" >= '{start_date.strftime("%Y-%m-%d")}' and "date" < '{end_date.strftime("%Y-%m-%d")}' limit 10"""
    assert re.match(output_query, dl._build_query().strip())
