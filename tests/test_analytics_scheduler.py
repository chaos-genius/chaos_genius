"""Tests for analytics_scheduler"""

# Test cases:
# 1 minute/1 hour since last scheduled - should not schedule again  run  (last_scheduled_time_rca, last_scheduled_time_anomaly attr for rca, anomaly resp) ## both run_rca , run_anomanly
# 23 hours since last scheduled - should not schedule again
# 24 hours + 1 minute since last scheduled - should schedule again

# Anomaly not setup
    # 1 hour since KPI setup - should not schedule again
    # 24 hours + 1 minute since KPI setup - should schedule
    # Anomaly should not run in any case, only DeepDrills
# Anomaly setup after DeepDrills has run
    # DeepDrills should not run at 24 hours after first run
    # DeepDrills should run 24 hours after anomaly run






# rca is always daily and anomaly can be both hourly and daily
# for rca setup time is scheduled time and next time it will run at same time and can be overriden by using rca_time in scheduler params field
# for anomaly  scheduled time  is time field in scheduler params scheduler_params={ "time": "11:00:00",

# if model_name in anomaly_params is not set we assume anomaly is not setup

# anomaly runs when configured and then on the scheduled time going forward

# for hourly unit test pass scheduler_frequency  as "H" in scheduler params




# hypothesis 

# https://docs.celeryproject.org/en/stable/userguide/testing.html

# Integration Tests
# Test anomaly/deepdrills invocation outside of scheduler:
#     When KPI is setup:
# Deepdrils should run
# When anomaly is setup:
#     Only anomaly should run
#     Next DeepDrills should run with anomaly


# True and False cases for to_run_anomaly
#   Various scheduled time to confirm behavior
#      - Play with now (datetime.now and last_scheduled_time_anomaly) 
#      - Curr_time < scheduled_time ⇒  dont run  {prepare input values}
#      - Curr > scheduled time , play on last_scheduled_time_anomaly => (run or not based last_scheduled_time_anomaly value )

# We can use the above cases of scheduler frequency to test for this (H, D)

# True and False cases for _to_run_rca
#   - Various scheduled time to confirm behavior
#       - Play with (datetime.now and last_scheduled_time_rca)
#   - We can use the above cases of scheduler frequency to test for this (D)





# _get_scheduled_time_hourly
# 9:11pm =>9:10 ,9:59=> 9:10, 00:12 => 00:10  (kinda dont makes sense but ok like test now()) , scheduler_params.time = 11:12 => now_date now_hr:11:12
# _to_run_anomaly
# _to_run_rca














# _get_scheduled_time_daily

# (kpi.scheduler_params.time overrides kpi.created_at) 
# if kpi.scheduler_params.time ==> now_date input_hr:input_min:input sec
# else ==> now_date created_at_hr: created_at_min:created_at

# if case => hh:mm:ss => now_date hh:mm:ss # ss is 00 implicit
# else dd/mm/yy hh:mm:ss => now_Date hh:mm:ss




from datetime import datetime

from sqlalchemy.sql.expression import delete
from chaos_genius.databases.models.kpi_model import Kpi
from chaos_genius.jobs.analytics_scheduler import AnalyticsScheduler

from copy import deepcopy

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

# 1. scheduler params exist(KPI already run), return scheduled time
def test_get_scheduled_time_11():
    scheduler = AnalyticsScheduler()
    scheduled_time = scheduler._get_scheduled_time_daily(test_kpi)
    assert (
        scheduled_time.date() == datetime.now().date()
        and scheduled_time.hour == 11
        and scheduled_time.minute == 00
    )



# Scheduler Freq = Daily
# =========================

# RCA setup(its always setup .. duh!) , anomaly not setup (model_name is not present ..) => kpi_type_A
# Scheduled time(scheduled_time param to run_{rca,anomaly})   ==  kpi creation time (kpi.scheduler_params.rca_time or kpi.created_at)

test_kpi_A = Kpi(
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
        # "model_name": "ProphetModel",
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

# RCA setup and anomaly setup (model_name is present)
# Scheduler time (scheduled_time param to run_{rca,anomaly}) == Anomaly setup time (kpi.schedular_params.time)


test_kpi_B = Kpi(
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






# Scheduler Freq = Hourly
# =========================

# RCA setup, anomaly not setup  => kpi_type_C

test_kpi_C = Kpi(
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
        "frequency": "H",
        # "model_name": "ProphetModel",
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

# RCA setup, anomaly setup


test_kpi_D = Kpi(
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
        "frequency": "H",
        # "model_name": "ProphetModel",
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


now_hr = datetime.now().hour
now_date = str(datetime.now().date())
test_cases_get_scheduled_time_hourly_positive = [
        ("10:12", f"{now_date} {now_hr}:10:12"),
        ("00:59", f"{now_date} {now_hr}:00:59"),
        ("23:59", f"{now_date} {now_hr}:23:59"),
        ("00:59", f"{now_date} {now_hr}:00:59"),
        ("00:59", f"{now_date} {now_hr}:00:59"),
        ("", f"{now_date} {now_hr}:10:00"),
        ("11:15:56", f"{now_date} {now_hr}:10:00"),

]

FOUR_TYPES_OF_KPI_OBJS = [test_kpi_A, test_kpi_B, test_kpi_C, test_kpi_D]

# test _get_scheduled_time_hourly
# depends on kpi.scheduler_params.time (only 1 param) and implicit datetime.now()
# expected inputs formats /output 
#    mm:ss ==> now_date now_hr:mm:ss
#    hh:mm:ss ==> now_date now_hr:10:00


import pytest

@pytest.mark.parametrize("time,expected", test_cases_get_scheduled_time_hourly_positive)
def test_get_scheduled_time_hourly_positive(time, expected):
    # kpis_deep_copy = deepcopy(FOUR_TYPES_OF_KPI_OBJS)
    # for kpi in kpis_deep_copy:
    #     if time:
    #         kpi.scheduler_params["time"] = time
    #     else:
    #         del kpi.scheduler_params["time"]
    kpi = deepcopy(test_kpi)
    kpi.scheduler_params["time"] = time
    scheduler = AnalyticsScheduler()

    # print(time, " # ", expected, " # ", scheduler._get_scheduled_time_hourly(kpi).strftime('%Y-%m-%d %H:%M:%S'), " # ", datetime.strptime(expected, '%Y-%m-%d %H:%M:%S'))
    assert scheduler._get_scheduled_time_hourly(kpi).strftime('%Y-%m-%d %H:%M:%S') == expected


# test _to_run_anomaly
# depends on scheduled_time

# if not setup model_name absent => returns false



test_cases_test_to_run_anomaly_positive = [
    ({"anomaly_params": {}}, f"{now_date} {now_hr}:12:19", False),
    ({"scheduler_params": {}}, f"{now_date} {now_hr}:12:19", True),
    ({"scheduler_params": {"last_scheduled_time_anomaly": f"{now_date} {now_hr}:12:12"}}, f"{now_date} {now_hr}:12:14", True),
    ({"scheduler_params": {"last_scheduled_time_anomaly": f"{now_date} {now_hr}:12:08"}}, f"{now_date} {now_hr}:12:10", True),
]


@pytest.mark.parametrize("kpi_params,scheduled_time,expected", test_cases_test_to_run_anomaly_positive)
def test_to_run_anomaly(kpi_params, scheduled_time, expected):
    # kpis_deep_copy = deepcopy(FOUR_TYPES_OF_KPI_OBJS)
    # for kpi in kpis_deep_copy:
    #     if time:
    #         kpi.scheduler_params["time"] = time
    #     else:
    #         del kpi.scheduler_params["time"]
    kpi = deepcopy(test_kpi)
    for key in kpi_params:
        setattr(kpi, key, kpi_params[key])
    scheduler = AnalyticsScheduler()
    scheduled_time = datetime.strptime(scheduled_time, '%Y-%m-%d %H:%M:%S')

    # print(time, " # ", expected, " # ", scheduler._get_scheduled_time_hourly(kpi).strftime('%Y-%m-%d %H:%M:%S'), " # ", datetime.strptime(expected, '%Y-%m-%d %H:%M:%S'))
    assert scheduler._to_run_anomaly(kpi, scheduled_time) == expected


# _to_run_anomaly

