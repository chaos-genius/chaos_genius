# -*- coding: utf-8 -*-
"""Helper utilities and decorators."""
import csv
import io
import subprocess
from typing import Iterator, List
import time
import functools
from types import GeneratorType

from flask import flash
from pydantic import BaseModel
from pydantic.json import pydantic_encoder


def flash_errors(form, category="warning"):
    """Flash all errors for a form."""
    for field, errors in form.errors.items():
        for error in errors:
            flash(f"{getattr(form, field).label.text} - {error}", category)


def latest_git_commit_hash() -> str:
    """Hash of the latest checked out commit.

    Returns empty string if git command was unsuccessful.
    """
    try:
        return (
            subprocess.check_output(["git", "rev-parse", "--short", "HEAD"])
            .decode("ascii")
            .strip()
        )
    except (subprocess.CalledProcessError, FileNotFoundError):
        return ""


def iter_csv(data: Iterator[List[str]]) -> Iterator[str]:
    """A Generator function to help in streaming csv downloads.

    Yields lines of CSV file made out of the input data"""
    line = io.StringIO()
    writer = csv.writer(line, delimiter=",")
    for csv_line in data:
        writer.writerow(csv_line)
        line.seek(0)
        yield line.read()
        line.truncate(0)
        line.seek(0)


def time_my_func(func):
    """Print the runtime of the decorated function."""
    @functools.wraps(func)
    def wrapper_timer(*args, **kwargs):
        start_time = time.perf_counter()
        value = func(*args, **kwargs)
        end_time = time.perf_counter()
        run_time = end_time - start_time
        print("----------------------------")
        print("Finished {0} in {1:.4f} secs".format(func.__name__, run_time))
        print("----------------------------")
        return value
    return wrapper_timer


def jsonable_encoder(obj):
    """Convert a (pydantic) object to a JSONable dict.

    See: https://github.com/samuelcolvin/pydantic/pull/317#issuecomment-443689941
    """
    if isinstance(obj, (str, int, float, type(None))):
        return obj
    if isinstance(obj, dict):
        return {
            jsonable_encoder(key): jsonable_encoder(value) for key, value in obj.items()
        }
    if isinstance(obj, (list, set, frozenset, GeneratorType, tuple)):
        return [jsonable_encoder(item) for item in obj]
    if isinstance(obj, BaseModel):
        obj_dict = obj.dict()
        if "__root__" in obj_dict:
            obj_dict = obj_dict["__root__"]
        return jsonable_encoder(obj_dict)
    return pydantic_encoder(obj)


DEMO_ENDPOINT_WHITELIST = {
    "alert.alert_meta_info": ["GET"],
    "alert.get_alert_info_by_id": ["GET"],
    "alert.disable_alert": ["GET"],
    "alert.enable_alert": ["GET"],
    "alert.list_alert": ["GET"],
    "anomaly_data.anomaly_settings_status": ["GET"],
    "anomaly_data.kpi_anomaly_data_quality": ["GET"],
    "anomaly_data.kpi_anomaly_detection": ["GET"],
    "anomaly_data.kpi_anomaly_drilldown": ["GET"],
    "anomaly_data.kpi_anomaly_params": ["GET"],
    "anomaly_data.kpi_anomaly_params_meta": ["GET"],
    "anomaly_data.kpi_subdim_anomaly": ["GET"],
    "anomaly_data.list_anomaly_data": ["GET"],
    "api_data_source.data_source": ["GET"],
    "api_data_source.data_source_meta_info": ["GET"],
    "api_data_source.get_data_source_info": ["GET"],
    "api_data_source.list_data_source_type": ["GET"],
    # "api_data_source.log_data_source",
    "api_data_source.metadata_data_source": ["POST"],
    "api_data_source.test_data_source_connection": ["GET"],
    "api_data_source.check_views_availability": ["POST"],
    "api_data_source.get_schema_list": ["POST"],
    "api_data_source.get_schema_tables": ["POST"],
    "api_data_source.get_table_info": ["POST"],
    "api_kpi.kpi": ["GET"],
    "api_kpi.get_all_kpis": ["GET"],
    "api_kpi.get_kpi_info": ["GET"],
    "api_kpi.kpi_get_dimensions": ["GET"],
    "api_kpi.get_timecuts_list": ["GET"],
    "api_kpi.kpi_meta_info": ["GET"],
    "api_rca.kpi_get_aggregation": ["GET"],
    "api_rca.kpi_get_line_data": ["GET"],
    "api_rca.kpi_rca_analysis": ["GET"],
    "api_rca.kpi_rca_hierarchical_data": ["GET"],
    "config_settings.get_all_config": ["GET"],
    "config_settings.get_config": ["POST"],
    "config_settings.set_config": ["POST"],
    "config_settings.get_config_meta_data": ["GET"],
    "config_settings.get_onboarding_status": ["GET"],
    "config_settings.global_config": ["GET"],
    # "config_settings.global_settings",
    "config_settings.multidim_status": ["GET"],
    "config_settings.edit_config_setting": ["PUT"],
    "dashboard.get_dashboard_list": ["GET"],
    "dashboard.get_dashboard": ["GET"],
    "downloads.download_anomaly_data": ["GET"],
    "downloads.download_hierarchical_data": ["GET"],
    "downloads.download_multidim_analysis_data": ["GET"],
    "downloads.kpi_download_line_data": ["GET"],
    # "meta.static",
    # "public.api_view",
    # "public.home",
    # "public.static",
    # "static",
    # "status.static",
    # "status.task_monitor_view",
    "meta.support_timezones": ["GET"],
    "meta.version_view": ["GET"],
}
