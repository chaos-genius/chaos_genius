"""Tests for analytics_scheduler"""

# Test cases:
# 1 minute/1 hour since last scheduled - should not schedule again
# 23 hours since last scheduled - should not schedule again
# 24 hours + 1 minute since last scheduled - should schedule again

# Anomaly not setup
    # 1 hour since KPI setup - should not schedule again
    # 24 hours + 1 minute since KPI setup - should schedule
    # Anomaly should not run in any case, only DeepDrills
# Anomaly setup after DeepDrills has run
    # DeepDrills should not run at 24 hours after first run
    # DeepDrills should run 24 hours after anomaly run

# https://docs.celeryproject.org/en/stable/userguide/testing.html

# Integration Tests
# Test anomaly/deepdrills invocation outside of scheduler:
#     When KPI is setup:
# Deepdrils should run
# When anomaly is setup:
#     Only anomaly should run
#     Next DeepDrills should run with anomaly
from datetime import datetime
from chaos_genius.databases.models.kpi_model import Kpi
from chaos_genius.jobs.analytics_scheduler import AnalyticsScheduler

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
        "anomaly_status": "completed",
        "scheduler_frequency": "D",
        "last_scheduled_time_rca": "2022-02-24T11:51:26.358842",
        "last_scheduled_time_anomaly": "2022-02-24T11:51:26.346090",
    },
)

# 1. scheduler params exist(KPI already run), return scheduled time
def test_get_scheduled_time_11():
    scheduler = AnalyticsScheduler()
    scheduled_time = scheduler._get_scheduled_time(test_kpi)
    assert (
        scheduled_time.date == datetime.now().date
        and scheduled_time.hour == 11
        and scheduled_time.minute == 00
    )
