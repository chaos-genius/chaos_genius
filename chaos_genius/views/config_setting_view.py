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

blueprint = Blueprint("config_settings", __name__)


@blueprint.route("/onboarding-status", methods=["GET"])
def get_onboarding_status():
    """Onboarding status route."""
    data_sources, kpis, dashboards, analytics, alerts = False, False, False, False, False
    try:
        data_sources = True if DataSource.query.first() is not None else False
        kpis = True if Kpi.query.first() is not None else False
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
            "step_no": 4,
            "step_name": "Activate Analytics",
            "step_done": analytics
        },
        {
            "step_no": 5,
            "step_name": "Setup Smart Alert",
            "step_done": alerts
        }
    ]
    completion_precentage = int(len([step for step in steps if step["step_done"]])/len(steps)*100)
    return jsonify({'data': {"steps": steps, "completion_precentage": completion_precentage}})
