# -*- coding: utf-8 -*-
"""Base views for config settings and onboarding."""
from flask import Blueprint, current_app, request, jsonify

from chaos_genius.databases.models.data_source_model import DataSource
from chaos_genius.databases.models.kpi_model import Kpi
from chaos_genius.alerts.slack import trigger_overall_kpi_stats
from chaos_genius.utils.datetime_helper import get_server_timezone
from chaos_genius.utils.modules_utils import is_enterprise_edition
from chaos_genius.core.rca.rca_utils.api_utils import kpi_aggregation
from chaos_genius.databases.models.config_setting_model import ConfigSetting
from chaos_genius.controllers.config_controller import (
    get_modified_config_file,
    get_config_object,
    create_config_object,
    get_all_configurations,
    get_multidim_status_for_kpi
)
from chaos_genius.databases.db_utils import chech_editable_field
from copy import deepcopy

blueprint = Blueprint("config_settings", __name__)


@blueprint.route("/onboarding-status", methods=["GET"])
def get_onboarding_status():
    """Onboarding status route."""
    data_sources, kpis, analytics = False, False, False
    organisation_settings = False
    try:
        data_sources = True if DataSource.query.first() is not None else False
        kpis = True if Kpi.query.first() is not None else False
        if kpis:
            kpi_list = Kpi.query.filter(
                            Kpi.active == True,
                            Kpi.anomaly_params != None
                        ).all()

            analytics = True if len(kpi_list) > 0 else False
        
        organisation_settings_value = ConfigSetting.query.filter(
                                    ConfigSetting.name == "organisation_settings",
                                    ConfigSetting.active == True
                                ).all()
        organisation_settings = True if len(organisation_settings_value) > 0 else False
    except Exception as err_msg:
        print(err_msg)
    
    steps = [
        {
            "step_no": 1,
            "step_name": "Add Data Source",
            "step_done": data_sources
        }, {
            "step_no": 2,
            "step_name": "Add KPI",
            "step_done": kpis
        }, {
            "step_no": 3,
            "step_name": "Activate Analytics",
            "step_done": analytics
        }
    ]
    completion_precentage = int(
        len([step for step in steps if step["step_done"]]) / len(steps) * 100
    )
    return jsonify({
        "data": {
            "steps": steps,
            "completion_precentage": completion_precentage,
            "organisation_onboarding": organisation_settings
        }
    })


@blueprint.route("/get-config", methods=["POST"])
def get_config():
    """Getting the settings."""
    if request.is_json:
        data = request.get_json()
        name = data.get("config_name")
        config_obj = get_config_object(name)
        if not config_obj:
            return jsonify({
                "status": "not_found",
                "message": "Config doesn't exist"
            })

        config_state = get_modified_config_file(config_obj.safe_dict, name)
        return jsonify({"data": config_state, "status": "success"})
    else:
        return jsonify(
            {
                "message": "The request payload is not in JSON format",
                "status": "failure",
            }
        )


@blueprint.route("/set-config", methods=["POST"])
def set_config():
    """Configuring the settings."""
    if request.is_json:
        data = request.get_json()
        config_name = data.get("config_name")
        if config_name not in ["email", "slack", "organisation_settings", "alert_digest_settings"]:
            return jsonify({
                "status": "not_found",
                "message": "Config doesn't exist"
            })
        config_obj = get_config_object(config_name)
        config_settings = data.get("config_settings", {})
        updated_config_settings = {}
        if config_obj:
            updated_config_settings = config_obj.config_setting
            config_obj.active = False
            config_obj.save(commit=True)
            if config_name == "organisation_settings":
                for module in config_settings.keys():
                    updated_config_settings[module].update(config_settings[module])
            else:
                updated_config_settings.update(data.get("config_settings", {})) #this will work for all email, slack and alert_digest_settings

        if not updated_config_settings:
            updated_config_settings = config_settings
        new_config = create_config_object(config_name, updated_config_settings)
        new_config.save(commit=True)
        return jsonify({
            "message": f"{config_name.capitalize()} configuration has been saved successfully.",
            "status": "success",
        })
    else:
        return jsonify(
            {
                "message": "The request payload is not in JSON format",
                "status": "failure",
            }
        )


@blueprint.route("/get-all-config", methods=["GET"])
def get_all_config():
    """Getting all the setting."""
    try:
        result = get_all_configurations()
        alert_destination_result = [config for config in result if config["name"] in ("slack", "email")]
        return jsonify({"data": alert_destination_result, "status": "success"})
    except Exception as err:
        return jsonify({"message": err, "status": "failure"})


@blueprint.route("/test-alert", methods=["POST"])
def test_alert():
    """Test Alert."""
    if request.is_json:
        data = request.get_json()
        kpi_info = Kpi.get_by_id(data["kpiId"]).as_dict
        connection_info = DataSource.get_by_id(kpi_info["data_source"]).as_dict
        _, _, kpi_aggregation_stats = kpi_aggregation(
            kpi_info, connection_info, "last_7_days"
        )
        overall_stats = {
            "current": kpi_aggregation_stats["panel_metrics"]["grp2_metrics"],
            "past": kpi_aggregation_stats["panel_metrics"]["grp1_metrics"],
            "impact": kpi_aggregation_stats["panel_metrics"]["impact"],
        }
        status = trigger_overall_kpi_stats(
            data["name"],
            kpi_info["name"],
            connection_info["name"],
            data["alertMessage"],
            overall_stats,
        )
        return jsonify({
            "message": "Alert has been tested successfully.",
            "status": status
        })
    else:
        return jsonify({"error": "The request payload is not in JSON format"})


@blueprint.route("/get-meta-info/<string:config>", methods=["GET"])
def get_config_meta_data(config):
    """Getting all the config Setting Meta."""
    try:
        meta_info = ConfigSetting.get_meta_info(config)
        if not meta_info:
            raise Exception("Config Type doesn't exist")
        results = {"name": config}
        fields = []
        for config_key, info in meta_info.items():
            info.update({"name": config_key})
            fields.append(info)
        results["fields"] = fields
        return jsonify({"data": results, "status": "success"})
    except Exception as err:
        current_app.logger.info(
            f"Error in getting meta info for Config Setting: {err}"
        )
        return jsonify({"message": str(err), "status": "failure"})


@blueprint.route("/dashboard_config", methods=["GET"])
def multidim_status():
    """check the number of dimensions in the kpi and return True if more than one dimension is present
    False otherwise"""
    status, message = "", ""
    data = {}
    try:
        kpi_id = request.args.get("kpi_id")
        data["multidim_status"] = get_multidim_status_for_kpi(kpi_id)
        status="success"
    except Exception as err:
        status = "failure"
        current_app.logger.info(f"Error in fetching Dashboad Config Data: {err}")
        message = str(err)
    return jsonify({"data": data, "msg": message, "status": status})


@blueprint.route("/update", methods=["PUT"])
def edit_config_setting():
    """edit config settings."""
    status, message = "", ""
    try:
        data = request.get_json()
        config_obj = get_config_object(data.get("config_name"))
        meta_info = ConfigSetting.meta_info()
        if config_obj and config_obj.active is True:
            if config_obj.name == "organisation_settings":
                new_config_settings = deepcopy(config_obj.config_setting)
                updated_settings = data.get("config_settings", {})

                for module in updated_settings.keys():
                    for key in updated_settings.get(module).keys():
                        if meta_info["organisation_settings"][module][key]["is_editable"] == True:
                            new_config_settings[module][key] = updated_settings[module][key]

                config_obj.config_setting = new_config_settings
                config_obj.save(commit=True)
            else:
                if chech_editable_field(meta_info, "config_setting"):
                    config_obj.config_setting = data.get("config_setting")
                    config_obj.save(commit=True)
            status = "success"
        else:
            message = "Config setting not found or disabled"
            status = "failure"
    except Exception as err:
        status = "failure"
        current_app.logger.info(f"Error in updating the Config Setting: {err}")
        message = str(err)
    return jsonify({"message": message, "status": status})


@blueprint.route("/global-settings", methods=["GET"])
def global_settings():
    status, message = "", ""
    data = {}
    try:
        data["timezone"] = get_server_timezone()
        status = "success"
    except Exception as err:
        status = "failure"
        current_app.logger.info(f"Error in fetching Global Config Data: {err}")
        message = str(err)
    return jsonify({"data": data, "msg": message, "status": status})


@blueprint.route("/global-config", methods=["GET"])
def global_config():
    status, message = "", ""
    data = {}
    try:
        data["timezone"] = get_server_timezone()
        data["is_ee"] = is_enterprise_edition()
        status = "success"
    except Exception as err:
        status = "failure"
        current_app.logger.info(f"Error in fetching Global Config Data: {err}")
        message = str(err)
    return jsonify({"data": data, "msg": message, "status": status})
