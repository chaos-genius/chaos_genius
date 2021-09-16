# -*- coding: utf-8 -*-
"""KPI views for creating and viewing the kpis."""
import traceback
from datetime import datetime, timedelta
from copy import deepcopy

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
import numpy as np
import pandas as pd
import random

from chaos_genius.core.rca import RootCauseAnalysis
from chaos_genius.connectors.base_connector import get_df_from_db_uri
from chaos_genius.databases.models.kpi_model import Kpi
from chaos_genius.databases.models.data_source_model import DataSource
from chaos_genius.databases.models.rca_data_model import RcaData
from chaos_genius.extensions import cache, db
from chaos_genius.databases.db_utils import chech_editable_field


blueprint = Blueprint("api_kpi", __name__)


@blueprint.route("/", methods=["GET", "POST"])
def kpi():
    """kpi list view."""
    current_app.logger.info("kpi list")
    # Handle logging in
    if request.method == 'POST':
        if not request.is_json:
            return jsonify({"error": "The request payload is not in JSON format"})

        # TODO: Add the backend validation
        data = request.get_json()
        new_kpi = Kpi(
            name=data.get('name'),
            is_certified=data.get('is_certified'),
            data_source=data.get('data_source'),
            kpi_type=data.get('dataset_type'),
            kpi_query=data.get('kpi_query'),
            table_name=data.get('table_name'),
            metric=data.get('metric'),
            aggregation=data.get('aggregation'),
            datetime_column=data.get('datetime_column'),
            filters=data.get('filters'),
            dimensions=data.get('dimensions')
        )
        new_kpi.save(commit=True)
        return jsonify({"message": f"KPI {new_kpi.name} has been created successfully.", "status": "success"})
        
    elif request.method == 'GET':
        results = db.session.query(Kpi, DataSource) \
            .join(DataSource, Kpi.data_source == DataSource.id) \
            .order_by(Kpi.created_at.desc()) \
            .all()
        kpis = []
        for row in results:
            kpi = row[0].safe_dict
            data_source = row[1].safe_dict
            data_source.update(kpi)
            # TODO: Provision to active and deactivate the KPI
            if data_source['active'] == True:
                kpis.append(data_source)
        return jsonify({"count": len(kpis), "data": kpis})


@blueprint.route("/get-dashboard-list", methods=["GET"])
def get_all_kpis():
    """returning all kpis"""

    results = Kpi.query.filter(Kpi.active == True).all()

    ret = []
    static = None
    metrics = ['name', 'metric', 'id']

    for ele in results:
        res = {}

        for key in metrics:
            res[key] = getattr(ele, key)

        try:
            kpi_info = get_kpi_data_from_id(ele.id)
            connection_info = DataSource.get_by_id(kpi_info["data_source"]).as_dict

            aggregation_type = ele.aggregation

            aggregate_data_week = kpi_aggregation(kpi_info, connection_info, timeline = 'wow')
            aggregate_data_month = kpi_aggregation(kpi_info, connection_info, timeline = 'mom')

            res['prev_week'] = aggregate_data_week['panel_metrics']['grp1_metrics'][aggregation_type]
            res['this_week'] = aggregate_data_week['panel_metrics']['grp2_metrics'][aggregation_type]
            res['week_change'] = res['this_week'] - res['prev_week']
            res['prev_month'] = aggregate_data_month['panel_metrics']['grp1_metrics'][aggregation_type]
            res['this_month'] = aggregate_data_month['panel_metrics']['grp2_metrics'][aggregation_type]
            res['month_change'] = res['this_month'] - res['prev_month']

        except:

            res['prev_week'] = 0
            res['this_week'] = 0
            res['week_change'] = 0
            res['prev_month'] = 0
            res['this_month'] = 0
            res['month_change'] = 0

        res['weekly_anomaly_count'] = random.randint(1, 20) #TODO
        res['monthly_anomaly_count'] = random.randint(20, 40) #TODO
        res['graph_data'] = kpi_line_data(kpi_info, connection_info) if static is None else static #TODO
        static = res['graph_data'] if static is None else static #TODO

        ret.append(res)

    return jsonify({"data": ret})


@blueprint.route("/<int:kpi_id>/disable", methods=["GET"])
def disable_kpi(kpi_id):
    status, message = "", ""
    try:
        kpi_obj = Kpi.get_by_id(kpi_id)
        if kpi_obj:
            kpi_obj.active = False
            kpi_obj.save(commit=True)
            status = "success"
        else:
            message = "KPI not found"
            status = "failure"
    except Exception as err:
        status = "failure"
        current_app.logger.info(f"Error in disabling the KPI: {err}")
    return jsonify({"message": message, "status": status})


@blueprint.route("/<int:kpi_id>/get-dimensions", methods=["GET"])
@cache.memoize(timeout=30000)
def kpi_get_dimensions(kpi_id):
    dimensions = []
    try:
        kpi_info = get_kpi_data_from_id(kpi_id)
        dimensions = kpi_info["dimensions"]
    except Exception as err:
        current_app.logger.info(f"Error Found: {err}")
    return jsonify({"dimensions": dimensions, "msg": ""})


@blueprint.route("/<int:kpi_id>/kpi-aggregations", methods=["GET"])
def kpi_get_aggregation(kpi_id):
    data = []
    try:
        timeline = request.args.get("timeline")
        data = kpi_aggregation(kpi_id, timeline)
    except Exception as err:
        current_app.logger.info(f"Error Found: {err}")
    return jsonify({"data": data, "msg": ""})


@blueprint.route("/<int:kpi_id>/kpi-line-data", methods=["GET"])
def kpi_get_line_data(kpi_id):
    data = []
    try:
        data = kpi_line_data(kpi_id)
    except Exception as err:
        current_app.logger.info(f"Error Found: {err}")
    return jsonify({"data": data, "msg": ""})


@blueprint.route("/<int:kpi_id>/rca-analysis", methods=["GET"])
def kpi_rca_analysis(kpi_id):
    current_app.logger.info(f"RCA Analysis Started for KPI ID: {kpi_id}")
    data = []
    try:
        timeline = request.args.get("timeline")
        dimension = request.args.get("dimension", None)
        data = rca_analysis(kpi_id, timeline, dimension)
    except Exception as err:
        current_app.logger.info(f"Error Found: {err}")
    current_app.logger.info("RCA Analysis Done")
    return jsonify({"data": data, "msg": ""})


@blueprint.route("/<int:kpi_id>/rca-hierarchical-data", methods=["GET"])
def kpi_rca_hierarchical_data(kpi_id):
    current_app.logger.info(f"RCA Analysis Started for KPI ID: {kpi_id}")
    data = []
    try:
        timeline = request.args.get("timeline")
        dimension = request.args.get("dimension", None)
        data = rca_hierarchical_data(kpi_id, timeline, dimension)
    except Exception as err:
        current_app.logger.info(f"Error Found: {err}")
    current_app.logger.info("RCA Analysis Done")
    return jsonify({"data": data, "msg": ""})

@blueprint.route("/meta-info", methods=["GET"])
def kpi_meta_info():
    """kpi meta info view."""
    current_app.logger.info("kpi meta info")
    return jsonify({"data": Kpi.meta_info()})

@blueprint.route("/<int:kpi_id>/update", methods=["PUT"])
def edit_kpi(kpi_id):
    """edit kpi details."""
    status, message = "", ""
    try:
        kpi_obj = Kpi.get_by_id(kpi_id)
        data = request.get_json()
        meta_info = Kpi.meta_info()
        if kpi_obj and kpi_obj.active == True:
            for key, value in data.items():
                if chech_editable_field(meta_info, key):
                    setattr(kpi_obj, key, value)

            kpi_obj.save(commit=True)
            status = "success"
        else:
            message = "KPI not found or disabled"
            status = "failure"
    except Exception as err:
        status = "failure"
        current_app.logger.info(f"Error in updating the KPI: {err}")
        message = str(err)
    return jsonify({"message": message, "status": status})

@blueprint.route("/<int:kpi_id>", methods=["GET"])
def get_kpi_info(kpi_id):
    """get Kpi details."""
    status, message = "", ""
    data = None
    try:
        kpi_obj = get_kpi_data_from_id(kpi_id)
        data = kpi_obj
        status = "success" 
    except Exception as err:
        status = "failure"
        message = str(err)
        current_app.logger.info(f"Error in fetching the KPI: {err}")
    return jsonify({"message": message, "status": status, "data":data})



@cache.memoize(timeout=30000)
def kpi_aggregation(kpi_id, timeline="mom"):
    try:
        end_date = get_end_date(kpi_id)

        final_data = RcaData.query.filter(
            (RcaData.kpi_id == kpi_id)
            & (RcaData.data_type == "agg")
            & (RcaData.timeline == timeline)
            & (RcaData.end_date == end_date)
        ).first().data

    except Exception as err:
        # print(traceback.format_exc())
        current_app.logger.error(f"Error in RCA Analysis: {err}")
        final_data = {
            "panel_metrics": [],
            "line_chart_data": [],
            "insights": []
        }
    return final_data


@cache.memoize(timeout=30000)
def kpi_line_data(kpi_id):
    try:
        end_date = get_end_date(kpi_id)

        final_data = RcaData.query.filter(
            (RcaData.kpi_id == kpi_id)
            & (RcaData.data_type == "line")
            & (RcaData.end_date == end_date)
        ).first().data

    except Exception as err:
        # print(traceback.format_exc())
        current_app.logger.error(f"Error in RCA Analysis: {err}")
        final_data = {}
    return final_data


@cache.memoize(timeout=30000)
def rca_analysis(kpi_id, timeline="mom", dimension=None):
    try:
        end_date = get_end_date(kpi_id)

        final_data = RcaData.query.filter(
            (RcaData.kpi_id == kpi_id)
            & (RcaData.data_type == "rca")
            & (RcaData.timeline == timeline)
            & (RcaData.end_date == end_date)
            & (RcaData.dimension == dimension)
        ).first().data
    except Exception as err:
        # print(traceback.format_exc())
        current_app.logger.error(f"Error in RCA Analysis: {err}")
        final_data = {
            "chart": {"chart_data": [], "y_axis_lim": [], "chart_table": []},
            "data_table": []
        }
    return final_data


@cache.memoize(timeout=30000)
def rca_hierarchical_data(kpi_id, connection_info, timeline="mom", dimension=None):
    try:
        end_date = get_end_date(kpi_id)

        final_data = RcaData.query.filter(
            (RcaData.kpi_id == kpi_id)
            & (RcaData.data_type == "htable")
            & (RcaData.timeline == timeline)
            & (RcaData.end_date == end_date)
            & (RcaData.dimension == dimension)
        ).first().data
    except Exception as err:
        # print(traceback.format_exc())
        current_app.logger.error(
            f"Error in RCA hierarchical table generation: {err}")
        final_data = {
            "data_table": []
        }
    return final_data

def get_kpi_data_from_id(n: int) -> dict:
    """Returns the corresponding KPI data for the given KPI ID 
    from KPI_DATA.

    :param n: ID of KPI
    :type n: int

    :raises: ValueError

    :returns: KPI data
    :rtype: dict
    """
    # TODO: Move to utils module

    kpi_info = Kpi.get_by_id(n)
    if kpi_info and kpi_info.as_dict:
        return kpi_info.as_dict
    raise ValueError(f"KPI ID {n} not found in KPI_DATA")


def get_end_date(kpi_id):
    kpi_info = get_kpi_data_from_id(kpi_id)
    end_date = None

    if kpi_info['is_static']:
        end_date = kpi_info["static_params"].get("end_date")
    
    if end_date is None:
        return datetime.today().date()
    else:
        return datetime.strptime(end_date, "%Y-%m-%d").date()
