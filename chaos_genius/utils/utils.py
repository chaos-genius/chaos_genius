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

DEMO_ENDPOINT_WHITELIST = ["alert.alert_meta_info",
                        "alert.get_alert_info_by_id",
                        "alert.list_alert",
                        "anomaly_data.anomaly_settings_status",
                        "anomaly_data.kpi_anomaly_data_quality",
                        "anomaly_data.kpi_anomaly_detection",
                        "anomaly_data.kpi_anomaly_drilldown",
                        "anomaly_data.kpi_anomaly_params_meta",
                        "anomaly_data.kpi_subdim_anomaly",
                        "anomaly_data.list_anomaly_data",
                        "api_data_source.data_source_meta_info",
                        "api_data_source.get_data_source_info",
                        "api_data_source.list_data_source_type",
                        "api_data_source.log_data_source",
                        "api_data_source.metadata_data_source",
                        "api_data_source.test_data_source_connection",
                        "api_kpi.get_all_kpis",
                        "api_kpi.get_kpi_info",
                        "api_kpi.kpi_get_aggregation",
                        "api_kpi.kpi_get_dimensions",
                        "api_kpi.kpi_get_line_data",
                        "api_kpi.kpi_meta_info",
                        "api_kpi.kpi_rca_analysis",
                        "api_kpi.kpi_rca_hierarchical_data",
                        "config_settings.get_all_config",
                        "config_settings.get_config",
                        "config_settings.get_config_meta_data",
                        "config_settings.get_onboarding_status",
                        "config_settings.global_config",
                        "config_settings.global_settings",
                        "config_settings.multidim_status",
                        "dashboard.get_dashboard",
                        "dashboard.get_dashboard_list",
                        "meta.static",
                        "meta.version_view",
                        "public.api_view",
                        "public.home",
                        "public.static",
                        "static",
                        "status.static",
                        "status.task_monitor_view"]
