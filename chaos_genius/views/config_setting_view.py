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
from chaos_genius.alerts.slack import trigger_overall_kpi_stats
from chaos_genius.views.kpi_view import kpi_aggregation
from chaos_genius.databases.models.config_setting_model import ConfigSetting
from chaos_genius.controllers.config_controller import (
    get_modified_config_file,
    get_config_object,
    create_config_object,
    get_all_configurations
)
from chaos_genius.databases.db_utils import chech_editable_field

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
        # {
        #     "step_no": 4,
        #     "step_name": "Setup Smart Alert",
        #     "step_done": alerts
        # }
    ]
    completion_precentage = int(len([step for step in steps if step["step_done"]])/len(steps)*100)
    return jsonify({'data': {"steps": steps, "completion_precentage": completion_precentage}})


@blueprint.route("/get-config", methods=["POST"])
def get_config():
    """Getting the settings."""
    if request.is_json:
        data = request.get_json()
        name = data.get("config_name")
        config_obj = get_config_object(name)
        if not config_obj:
            return jsonify({"status": "not_found", "message": "Config doesn't exist"})

        config_state = get_modified_config_file(config_obj.safe_dict, name)
        return jsonify({"data": config_state, "status": "success"})
    else:
        return jsonify({"message": "The request payload is not in JSON format", "status": "failure"})


@blueprint.route("/set-config", methods=["POST"])
def set_config():
    """Configuring the settings."""
    if request.is_json:
        data = request.get_json()
        config_name = data.get("config_name")
        if config_name not in ["email", "slack"]:
            return jsonify({"status": "not_found", "message": "Config doesn't exist"})
        config_obj = get_config_object(config_name)
        if config_obj:
            config_obj.active = False
            config_obj.save(commit=True)
        new_config = create_config_object(config_name, data.get("config_settings", {}))
        new_config.save(commit=True)
        return jsonify({"message": f"Config {config_name} has been saved successfully.", "status": "success"})
    else:
        return jsonify({"message": "The request payload is not in JSON format", "status": "failure"})


@blueprint.route("/get-all-config", methods=["GET"])
def get_all_config():
    """Getting all the setting."""
    try:
        result = get_all_configurations()
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

@blueprint.route("/get-meta-info", methods=["GET"])
def get_config_meta_data():
    """Getting all the config Setting Meta."""
    try:
        return jsonify({"data": ConfigSetting.meta_info(), "status": "success"})
    except Exception as err:
        current_app.logger.info(f"Error in getting meta info for Config Setting: {err}")
        return jsonify({"message": err, "status": "failure"})

@blueprint.route("/update", methods=["POST"])
def edit_config_setting():
    """edit config settings."""
    status, message = "", ""
    try:
        data = request.get_json()
        config_obj = get_config_object(data.get('config_name'))
        meta_info = ConfigSetting.meta_info()
        if config_obj and config_obj.active == True:
            if chech_editable_field(meta_info,'config_setting'):
                config_obj.config_setting=data.get('config_setting')
        
                config_obj.save(commit=True)
                status = "success"
        else:
            message = "Config setting not found or disabled"
            status = "failure"
    except Exception as err:
        status = "failure"
        current_app.logger.info(f"Error in updating the Config Setting: {err}")
    return jsonify({"message": message, "status": status})

