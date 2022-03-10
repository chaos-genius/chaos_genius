from datetime import datetime, timedelta

from chaos_genius.databases.models.kpi_model import Kpi
from chaos_genius.app import create_app

app = create_app()
from chaos_genius.jobs.analytics_scheduler import AnalyticsScheduler


from copy import deepcopy

import pytest

test_kpi = Kpi(
    name="AOV",
    is_certified="false",
    data_source=1,
    kpi_type="table",
    kpi_query="",
    schema_name="public",
    table_name="ecom_retail_data",
    metric="ItemTotalPrice",
    aggregation="mean",
    datetime_column="date",
    filters=[],
    dimensions=["DayOfWeek", "PurchaseTime", "Country"],
    anomaly_params={
        "anomaly_period": 60,
        "seasonality": [],
        "frequency": "D",
        "model_name": "ProphetModel",
        "sensitivity": "medium",
    },
    scheduler_params={
        "time": "11:00:00",
        "rca_status": "completed",
        # "rca_time"
        "anomaly_status": "completed",
        "scheduler_frequency": "D",
        "last_scheduled_time_rca": "2022-02-24T11:51:26.358842",
        "last_scheduled_time_anomaly": "2022-02-24T11:51:26.346090",
    },
)


DATETIME_FMT = "%Y-%m-%d %H:%M:%S"

now = datetime.now()

make_2_digit = lambda x: f"0{x}" if x < 10 else x
now_hr = make_2_digit(now.hour)
now_min = make_2_digit(now.minute)
now_sec = make_2_digit(now.second)
now_hr = make_2_digit(now.hour)
now_date = str(now.date())


test_cases_get_scheduled_time_hourly = [
    # Not time in scheduler params
    ("", f"{now_date} {now_hr}:10:00"),
    # different times in 24 hrs provided in time param
    ("11:15:59", f"{now_date} {now_hr}:15:59"),
    ("23:15:01", f"{now_date} {now_hr}:15:01"),
    ("00:11:56", f"{now_date} {now_hr}:11:56"),
    ("08:45:23", f"{now_date} {now_hr}:45:23"),
    ("08:00:00", f"{now_date} {now_hr}:00:00"),
]


@pytest.mark.parametrize("time,expected", test_cases_get_scheduled_time_hourly)
def test_get_scheduled_time_hourly(monkeypatch, time, expected):
    """
    monkeypatch takes global test_kpi object and transforms according to the current test case
    in a way that global test_kpi is used as a template but all changes made to it are limited
    to the scope of test case
    """
    if time:
        monkeypatch.setitem(test_kpi.scheduler_params, "time", time)
    else:
        monkeypatch.delitem(test_kpi.scheduler_params, "time", raising=True)
    scheduler = AnalyticsScheduler()
    assert (
        scheduler._get_scheduled_time_hourly(test_kpi).strftime(DATETIME_FMT)
        == expected
    )


# Not testing _get_scheduled_time_daily with 2nd param as "rca_time" since its just a name change
test_cases_get_scheduled_time_daily = [
    # time not present in scheduler params
    ("", now, f"{now_date} {now_hr}:{now_min}:{now_sec}"),
    ("", now - timedelta(days=1), f"{now_date} {now_hr}:{now_min}:{now_sec}"),
    ("", now - timedelta(days=800), f"{now_date} {now_hr}:{now_min}:{now_sec}"),
    (
        "",
        now - timedelta(hours=2),
        f"{now_date} {make_2_digit((now - timedelta(hours=2)).hour)}:{now_min}:{now_sec}",
    ),
    (
        "",
        now - timedelta(minutes=35, days=4),
        f"{now_date} {make_2_digit((now - timedelta(minutes=35)).hour)}:{make_2_digit((now - timedelta(minutes=35)).minute)}:{now_sec}",
    ),  # time not empty
    (
        "00:01:02",
        now - timedelta(seconds=35, days=3),
        f"{now_date} 00:01:02",
    ),
    # time present in scheduler params
    ("05:10:19", now, f"{now_date} 05:10:19"),
    ("23:59:59", now - timedelta(days=1), f"{now_date} 23:59:59"),
    ("12:12:01", now - timedelta(days=800), f"{now_date} 12:12:01"),
    (
        "00:00:01",
        now - timedelta(hours=2),
        f"{now_date} 00:00:01",
    ),
    (
        "17:59:01",
        now - timedelta(minutes=35, days=4),
        f"{now_date} 17:59:01",
    ),
    (
        "21:08:10",
        now - timedelta(seconds=35, days=3),
        f"{now_date} 21:08:10",
    ),
]


@pytest.mark.parametrize(
    "time,created_at,expected", test_cases_get_scheduled_time_daily
)
def test_get_scheduled_time_daily(monkeypatch, time, created_at, expected):
    monkeypatch.setattr(test_kpi, "created_at", created_at)
    if time:
        monkeypatch.setitem(test_kpi.scheduler_params, "time", time)
    else:
        monkeypatch.delitem(test_kpi.scheduler_params, "time", raising=True)
    scheduler = AnalyticsScheduler()
    assert (
        scheduler._get_scheduled_time_daily(test_kpi).strftime(DATETIME_FMT) == expected
    )


test_cases_test_to_run_anomaly = [
    ({"anomaly_params": {}}, f"{now_date} {now_hr}:12:19", False),  # anomaly not setup
    (
        {"scheduler_params": {}},
        f"{now_date} {now_hr}:12:19",
        True,
    ),  # need to recheck this
    (
        {
            "scheduler_params": {
                "last_scheduled_time_anomaly": f"{now_date} {now_hr}:12:12"
            }
        },
        f"{now_date} {now_hr}:12:14",
        True,
    ),
    (
        {
            "scheduler_params": {
                "last_scheduled_time_anomaly": f"{now_date} {now_hr}:12:08"
            }
        },
        f"{now_date} {now_hr}:12:10",
        True,
    ),
    (
        {
            "scheduler_params": {
                "last_scheduled_time_anomaly": f"{now_date} {now_hr}:15:12"
            }
        },
        f"{now_date} {now_hr}:12:14",
        False,
    ),
    (
        {
            "scheduler_params": {
                "last_scheduled_time_anomaly": f"{now_date} {now_hr}:49:08"
            }
        },
        f"{now_date} {now_hr}:10:00",
        False,
    ),
    (
        {
            "scheduler_params": {
                "last_scheduled_time_anomaly": f"{(now - timedelta(days=800)).date()} {now_hr}:15:12"
            }
        },
        f"{now_date} {now_hr}:12:14",
        True,
    ),
    (
        {
            "scheduler_params": {
                "last_scheduled_time_anomaly": f"{(now - timedelta(hours=2)).date()} {make_2_digit((now - timedelta(hours=2)).hour)}:49:08"
            }
        },
        f"{now_date} {now_hr}:10:00",
        True,
    ),
]


@pytest.mark.parametrize(
    "kpi_params,scheduled_time,expected", test_cases_test_to_run_anomaly
)
def test_to_run_anomaly(monkeypatch, kpi_params, scheduled_time, expected):
    for key in kpi_params:
        monkeypatch.setattr(test_kpi, key, kpi_params[key])
    scheduler = AnalyticsScheduler()
    scheduled_time = datetime.strptime(scheduled_time, DATETIME_FMT)

    assert scheduler._to_run_anomaly(test_kpi, scheduled_time) == expected


test_cases_test_to_run_rca = [
    (
        {"anomaly_params": {}, "scheduler_params": {}},
        f"{now_date} {now_hr}:12:19",
        True,
    ),
    ({"scheduler_params": {}}, f"{now_date} {now_hr}:12:19", True),
    (
        {"scheduler_params": {"last_scheduled_time_rca": f"{now_date} {now_hr}:12:12"}},
        f"{now_date} {now_hr}:12:14",
        True,
    ),
    (
        {"scheduler_params": {"last_scheduled_time_rca": f"{now_date} {now_hr}:12:08"}},
        f"{now_date} {now_hr}:12:10",
        True,
    ),
    (
        {"scheduler_params": {"last_scheduled_time_rca": f"{now_date} {now_hr}:15:12"}},
        f"{now_date} {now_hr}:12:14",
        False,
    ),
    (
        {"scheduler_params": {"last_scheduled_time_rca": f"{now_date} {now_hr}:49:08"}},
        f"{now_date} {now_hr}:10:00",
        False,
    ),
    (
        {
            "scheduler_params": {
                "last_scheduled_time_rca": f"{(now - timedelta(days=800)).date()} {now_hr}:15:12"
            }
        },
        f"{now_date} {now_hr}:12:14",
        True,
    ),
    (
        {
            "scheduler_params": {
                "last_scheduled_time_rca": f"{(now - timedelta(hours=2)).date()} {make_2_digit((now - timedelta(hours=2)).hour)}:49:08"
            }
        },
        f"{now_date} {now_hr}:10:00",
        True,
    ),  # -1 day
    (
        {
            "scheduler_params": {
                "last_scheduled_time_rca": f"{(now - timedelta(days=1)).date()} {now_hr}:17:12"
            }
        },
        f"{now_date} {now_hr}:12:14",
        True,
    ),
    (
        {
            "scheduler_params": {
                "last_scheduled_time_rca": f"{(now - timedelta(days=1)).date()} {now_hr}:06:08"
            }
        },
        f"{now_date} {now_hr}:12:10",
        True,
    ),
    (
        {
            "scheduler_params": {
                "last_scheduled_time_rca": f"{(now - timedelta(days=1)).date()} {now_hr}:15:12"
            }
        },
        f"{now_date} {now_hr}:12:14",
        True,
    ),
    (
        {
            "scheduler_params": {
                "last_scheduled_time_rca": f"{(now - timedelta(days=1)).date()} {now_hr}:49:08"
            }
        },
        f"{now_date} {now_hr}:10:00",
        True,
    ),
]


@pytest.mark.parametrize(
    "kpi_params,scheduled_time,expected", test_cases_test_to_run_rca
)
def test_to_run_rca(monkeypatch, kpi_params, scheduled_time, expected):
    for key in kpi_params:
        monkeypatch.setattr(test_kpi, key, kpi_params[key])
    scheduler = AnalyticsScheduler()
    scheduled_time = datetime.strptime(scheduled_time, DATETIME_FMT)
    assert scheduler._to_run_rca(test_kpi, scheduled_time) == expected
