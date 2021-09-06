from operator import mod
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


from chaos_genius.databases.models.config_setting_model import ConfigSetting
from chaos_genius.alerts.alert_config import modified_config_state


def get_configuration_request_json_verified():
    """Controller for getting configuration if request object is JSON"""

    data = request.get_json()
    name = data.get("config_name")
    config_obj = ConfigSetting.query.filter_by(name=name).first()
    if not config_obj:
        return jsonify({"status": "not_found", "message": "Config doesn't exist"})

    config_state = config_obj.safe_dict
    modified_config_state(config_state, name)
    return jsonify({"data": config_state, "status": "success"})


def get_configuration_request_not_json():
    """Controller for getting configuration if request object is not JSON"""

    return jsonify({"message": "The request payload is not in JSON format", "status": "failure"})


def set_configuration_request_json_verified():
    """Controller for creating and updating configurations"""
    data = request.get_json()
    config = data.get("config_name")
    if config not in ["email", "slack"]:
        return jsonify({"status": "not_found", "message": "Config doesn't exist"})
    config_obj = ConfigSetting.query.filter_by(name=config).first()
    if config_obj:
        config_obj.config_setting = data.get("config_settings", {})
        config_obj.active=True
        config_obj.save(commit=True)
    else:
        new_config = ConfigSetting(
            name=config,
            config_setting=data.get("config_settings", {}),
            active=True
        )
        new_config.save(commit=True)
    return jsonify({"message": f"Config {config} has been saved successfully.", "status": "success"})
    

def set_configuration_request_not_json():
    """Controller for setting configuration if request object is not JSON"""

    return jsonify({"message": "The request payload is not in JSON format", "status": "failure"})


def get_all_configuration():
    try:
        result = []
        configs = ConfigSetting.query.all()
        for config in configs:
            result.append(config.safe_dict)
        return jsonify({"data": result, "status": "success"})
    except Exception as err:
        return jsonify({"message": err, "status": "failure"})