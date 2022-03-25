# -*- coding: utf-8 -*-
"""Helper utilities and decorators."""
import subprocess

from flask import flash


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
    # "meta.static",
    # "public.api_view",
    # "public.home",
    # "public.static",
    # "static",
    # "status.static",
    # "status.task_monitor_view",
    "meta.version_view": ["GET"],
}
