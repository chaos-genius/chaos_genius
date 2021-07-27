# -*- coding: utf-8 -*-
"""anomaly data view."""
from datetime import datetime, timedelta

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

from chaos_genius.connectors.base_connector import get_df_from_db_uri
from chaos_genius.core.anomaly.constants import date_output, no_date_output
from chaos_genius.databases.models.anomaly_data_model import AnomalyData
from chaos_genius.databases.models.data_source_model import DataSource
from chaos_genius.views.kpi_view import get_kpi_data_from_id


blueprint = Blueprint("anomaly_data", __name__)


@blueprint.route("/", methods=["GET"])
def list_anomaly_data():
    """List the anomaly data."""
    data = AnomalyData.query.all()
    results = [point.as_dict for point in data]
    return jsonify({"data": results})

@blueprint.route("/<int:kpi_id>/anomaly-detection", methods=["GET"])
def kpi_anomaly_detection(kpi_id):
    current_app.logger.info(f"Anomaly Detection Started for KPI ID: {kpi_id}")
    data = []
    try:
        anom_data = AnomalyData.query.filter_by(
            kpi_id=kpi_id, 
            anomaly_type="overall"
        ).order_by(AnomalyData.id.desc()).first().as_dict
        data = {
            "chart_data": anom_data["chart_data"],
            "base_anomaly_id": anom_data["id"]
        }
    except Exception as err:
        current_app.logger.info(f"Error Found: {err}")
    current_app.logger.info("Anomaly Detection Done")
    return jsonify({"data": data, "msg": ""})


@blueprint.route("/<int:kpi_id>/anomaly-drilldown", methods=["GET"])
def kpi_anomaly_drilldown(kpi_id):
    current_app.logger.info(f"Anomaly Drilldown Started for KPI ID: {kpi_id}")
    data = []
    try:
        base_anomaly_id = request.args.get("base_anomaly_id", None)
        date = request.args.get("date", None)
        if base_anomaly_id is None:
            raise ValueError(f"base_anomaly_id is not provided")
        if date is None:
            raise ValueError(f"Date is not provided")
        else:
            anom_data = AnomalyData.query.filter_by(
                kpi_id=kpi_id, 
                anomaly_type="drilldown",
                base_anomaly_id=base_anomaly_id,
                anomaly_timestamp=date
            ).order_by(AnomalyData.id).all()
            data = [i.as_dict["chart_data"] for i in anom_data]
    except Exception as err:
        current_app.logger.info(f"Error Found: {err}")
    current_app.logger.info("Anomaly Drilldown Done")
    return jsonify({"data": data, "msg": ""})


@blueprint.route("/<int:kpi_id>/anomaly-data-quality", methods=["GET"])
def kpi_anomaly_data_quality(kpi_id):
    current_app.logger.info(f"Anomaly Drilldown Started for KPI ID: {kpi_id}")
    data = []
    try:
        base_anomaly_id = request.args.get("base_anomaly_id", None)
        if base_anomaly_id is None:
            raise ValueError(f"base_anomaly_id is not provided")
        anom_data = AnomalyData.query.filter_by(
            kpi_id=kpi_id,
            base_anomaly_id=base_anomaly_id, 
            anomaly_type="data_quality"
        ).order_by(AnomalyData.id).all()
        data = [i.as_dict["chart_data"] for i in anom_data]
    except Exception as err:
        current_app.logger.info(f"Error Found: {err}")
    current_app.logger.info("Anomaly Drilldown Done")
    return jsonify({"data": data, "msg": ""})


def get_anomaly_df(kpi_info, connection_info, days_range=90):
    indentifier = ''
    if connection_info["connection_type"] == "mysql":
        indentifier = '`'
    elif connection_info["connection_type"] == "postgresql":
        indentifier = '"'

    today = datetime.today()
    num_days = days_range
    base_dt_obj = today - timedelta(days=num_days)
    base_dt = str(base_dt_obj.date())

    cur_dt = str(today.date())
    base_filter = f" where {indentifier}{kpi_info['datetime_column']}{indentifier} > '{base_dt}' and {indentifier}{kpi_info['datetime_column']}{indentifier} <= '{cur_dt}' "

    kpi_filters = kpi_info['filters']
    kpi_filters_query = " "
    if kpi_filters:
        kpi_filters_query = " "
        for key, values in kpi_filters.items():
            if values:
                # TODO: Bad Hack to remove the last comma, fix it
                values_str = str(tuple(values))
                values_str = values_str[:-2] + ')'
                kpi_filters_query += f" and {indentifier}{key}{indentifier} in {values_str}"

    base_query = f"select * from {kpi_info['table_name']} {base_filter} {kpi_filters_query} "
    base_df = get_df_from_db_uri(connection_info["db_uri"], base_query)

    return base_df
