# -*- coding: utf-8 -*-
"""Base views for config settings and onboarding."""
from flask import (
    Blueprint,
    current_app,
    flash,
    redirect,
    render_template,
    request,
    url_for,
    jsonify
)
from chaos_genius.databases.models.data_source_model import DataSource
from chaos_genius.databases.models.kpi_model import Kpi
from chaos_genius.databases.models.config_setting_model import ConfigSetting
from chaos_genius.alerts.slack import trigger_overall_kpi_stats
from chaos_genius.views.kpi_view import kpi_aggregation

blueprint = Blueprint("config_settings", __name__)


@blueprint.route("/onboarding-status", methods=["GET"])
def get_onboarding_status():
    """Onboarding status route."""
    data_sources, kpis, dashboards, analytics, alerts = False, False, False, False, False
    try:
        data_sources = True if DataSource.query.first() is not None else False
        kpis = True if Kpi.query.first() is not None else False
        analytics = True
    except Exception as err_msg:
        print(err_msg)
    steps = [
        {
            "step_no": 1,
            "step_name": "Add Data Source",
            "step_done": data_sources
        },
        {
            "step_no": 2,
            "step_name": "Add KPI",
            "step_done": kpis
        },
        # {
        #     "step_no": 3,
        #     "step_name": "Create Dashboard",
        #     "step_done": dashboards
        # },
        {
            "step_no": 3,
            "step_name": "Activate Analytics",
            "step_done": analytics
        },
        {
            "step_no": 4,
            "step_name": "Setup Smart Alert",
            "step_done": alerts
        }
    ]
    completion_precentage = int(len([step for step in steps if step["step_done"]])/len(steps)*100)
    return jsonify({'data': {"steps": steps, "completion_precentage": completion_precentage}})


@blueprint.route("/get-config", methods=["POST"])
def get_config():
    """Getting the settings."""
    if request.is_json:
        data = request.get_json()
        name = data.get("config_name")
        config_obj = ConfigSetting.query.filter_by(name=name).first()
        if not config_obj:
            return jsonify({"status": "not_found", "message": "Config doesn't exist"})
        return jsonify({"data": config_obj.safe_dict, "status": "success"})
    else:
        return jsonify({"message": "The request payload is not in JSON format", "status": "failure"})


@blueprint.route("/set-config", methods=["POST"])
def set_config():
    """Configuring the settings."""
    if request.is_json:
        data = request.get_json()
        config = data.get("config_name")
        if config not in ["email", "slack"]:
            return jsonify({"status": "not_found", "message": "Config doesn't exist"})
        config_obj = ConfigSetting.query.filter_by(name=name).first()
        if config_obj:
            config_obj.config_setting = data.get("config_settings", {})
            config_obj.save(commit=True)
        else:
            new_config = ConfigSetting(
                name=config,
                config_setting=data.get("config_settings", {})
            )
            new_config.save(commit=True)
        return jsonify({"message": f"Config {config} has been saved successfully.", "status": "success"})
    else:
        return jsonify({"message": "The request payload is not in JSON format", "status": "failure"})


@blueprint.route("/get-all-config", methods=["GET"])
def get_all_config():
    """Getting all the setting."""
    try:
        result = []
        configs = ConfigSetting.query.all()
        for config in configs:
            result.append(config.safe_dict)
        return jsonify({"data": result, "status": "success"})
    except Exception as err:
        return jsonify({"message": err, "status": "failure"})


@blueprint.route("/test-alert", methods=["POST"])
def test_alert():
    """Test Alert."""
    if request.is_json:
        data = request.get_json()
        kpi_info = Kpi.get_by_id(data["kpiId"]).as_dict
        connection_info = DataSource.get_by_id(kpi_info["data_source"]).as_dict
        kpi_aggregation_stats = kpi_aggregation(kpi_info, connection_info, 'wow')
        overall_stats = {
            "current": kpi_aggregation_stats["panel_metrics"]["grp2_metrics"],
            "past": kpi_aggregation_stats["panel_metrics"]["grp1_metrics"],
            "impact": kpi_aggregation_stats["panel_metrics"]["impact"]
        }
        status = trigger_overall_kpi_stats(
            data["name"],
            kpi_info["name"],
            connection_info["name"],
            data["alertMessage"],
            overall_stats
        )
        return jsonify({"message": f"Alert has been tested successfully.", "status": status})
    else:
        return jsonify({"error": "The request payload is not in JSON format"})

