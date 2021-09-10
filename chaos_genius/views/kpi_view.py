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

from chaos_genius.extensions import cache, db
from chaos_genius.databases.models.kpi_model import Kpi
from chaos_genius.databases.models.data_source_model import DataSource
from chaos_genius.core.rca import RootCauseAnalysis
from chaos_genius.connectors.base_connector import get_df_from_db_uri
from chaos_genius.databases.db_utils import chech_editable_field


blueprint = Blueprint("api_kpi", __name__)


@blueprint.route("/", methods=["GET", "POST"])
def kpi():
    """kpi list view."""
    current_app.logger.info("kpi list")
    # Handle logging in
    if request.method == 'POST':
        if request.is_json:
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
        else:
            return jsonify({"error": "The request payload is not in JSON format", "status": "failure"})

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
        kpi_info = get_kpi_data_from_id(kpi_id)
        connection_info = DataSource.get_by_id(kpi_info["data_source"])
        timeline = request.args.get("timeline")
        data = kpi_aggregation(kpi_info, connection_info.as_dict, timeline)
    except Exception as err:
        current_app.logger.info(f"Error Found: {err}")
    return jsonify({"data": data, "msg": ""})

@blueprint.route("/<int:kpi_id>/kpi-line-data", methods=["GET"])
def kpi_get_line_data(kpi_id):
    data = []
    try:
        kpi_info = get_kpi_data_from_id(kpi_id)
        connection_info = DataSource.get_by_id(kpi_info["data_source"])
        data = kpi_line_data(kpi_info, connection_info.as_dict)
    except Exception as err:
        current_app.logger.info(f"Error Found: {err}")
    return jsonify({"data": data, "msg": ""})

@blueprint.route("/<int:kpi_id>/rca-analysis", methods=["GET"])
def kpi_rca_analysis(kpi_id):
    current_app.logger.info(f"RCA Analysis Started for KPI ID: {kpi_id}")
    data = []
    try:
        kpi_info = get_kpi_data_from_id(kpi_id)
        connection_info = DataSource.get_by_id(kpi_info["data_source"])
        timeline = request.args.get("timeline")
        dimension = request.args.get("dimension", None)
        data = rca_analysis(kpi_info, connection_info.as_dict, timeline, dimension)
    except Exception as err:
        current_app.logger.info(f"Error Found: {err}")
    current_app.logger.info("RCA Analysis Done")
    return jsonify({"data": data, "msg": ""})

@blueprint.route("/<int:kpi_id>/rca-hierarchical-data", methods=["GET"])
def kpi_rca_hierarchical_data(kpi_id):
    current_app.logger.info(f"RCA Analysis Started for KPI ID: {kpi_id}")
    data = []
    try:
        kpi_info = get_kpi_data_from_id(kpi_id)
        connection_info = DataSource.get_by_id(kpi_info["data_source"])
        timeline = request.args.get("timeline")
        dimension = request.args.get("dimension", None)
        data = rca_hierarchical_data(kpi_info, connection_info.as_dict, timeline, dimension)
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
            if chech_editable_field(meta_info,'name'):
                kpi_obj.name=data.get('name')
            if chech_editable_field(meta_info,'is_certified'):
                kpi_obj.is_certified=data.get('is_certified')
            if chech_editable_field(meta_info,'data_source'):
                kpi_obj.data_source=data.get('data_source')
            if chech_editable_field(meta_info,'kpi_type'):
                kpi_obj.kpi_type=data.get('dataset_type')
            if chech_editable_field(meta_info,'kpi_query'):
                kpi_obj.kpi_query=data.get('kpi_query')
            if chech_editable_field(meta_info,'table_name'):
                kpi_obj.table_name=data.get('table_name')
            if chech_editable_field(meta_info,'metric'):
                kpi_obj.metric=data.get('metric')
            if chech_editable_field(meta_info,'aggregation'):
                kpi_obj.aggregation=data.get('aggregation')
            if chech_editable_field(meta_info,'datetime_column'):
                kpi_obj.datetime_column=data.get('datetime_column')
            if chech_editable_field(meta_info,'filters'):
                kpi_obj.filters=data.get('filters')
            if chech_editable_field(meta_info,'dimensions'):
                kpi_obj.dimensions=data.get('dimensions')  

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

@blueprint.route("/<int:kpi_id>/get-kpi-info", methods=["GET"])
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



def get_baseline_and_rca_df(kpi_info, connection_info, timeline="mom"):
    # TODO: Refactor this function to and move to the kpi service
    today = datetime.today()
    datetime_col = kpi_info['datetime_column']
    if kpi_info['is_static']:
        end_date = kpi_info.get('static_params', {}).get('end_date', {})
        if end_date:
            today = datetime.strptime(end_date, '%Y-%m-%d')

    if timeline == "mom":
        num_days = 30
    elif timeline == "wow":
        num_days = 7
    elif timeline == "dod":
        num_days = 1
    else:
        raise ValueError(f"Invalid timeline: {timeline}")

    base_dt_obj = today - timedelta(days=2*num_days)
    base_dt = str(base_dt_obj.date())
    mid_dt_obj = today - timedelta(days=num_days)
    mid_dt = str(mid_dt_obj.date())
    cur_dt = str(today.date())

    if kpi_info['kpi_type'] == 'table':
        indentifier = ''
        if connection_info["connection_type"] == "mysql":
            indentifier = '`'
        elif connection_info["connection_type"] == "postgresql":
            indentifier = '"'

        base_filter = f" where {indentifier}{datetime_col}{indentifier} > '{base_dt}' and {indentifier}{datetime_col}{indentifier} <= '{mid_dt}' "
        rca_filter = f" where {indentifier}{datetime_col}{indentifier} > '{mid_dt}' and {indentifier}{datetime_col}{indentifier}<= '{cur_dt}' "

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
        rca_query = f"select * from {kpi_info['table_name']} {rca_filter} {kpi_filters_query} "
        base_df = get_df_from_db_uri(connection_info["db_uri"], base_query)
        rca_df = get_df_from_db_uri(connection_info["db_uri"], rca_query)
    
    elif kpi_info['kpi_type'] == 'query':
        query_df = get_df_from_db_uri(connection_info["db_uri"], kpi_info['kpi_query'])
        query_df[datetime_col] = pd.to_datetime(query_df[datetime_col])
        base_df = query_df[(query_df[datetime_col] > base_dt_obj) & (query_df[datetime_col] <= mid_dt_obj)]
        rca_df = query_df[(query_df[datetime_col] > mid_dt_obj) & (query_df[datetime_col] <= today)]

    return base_df, rca_df


def process_rca_output(chart_data, kpi_info):
    rename_dict = {
        'string': "subgroup",
        f"size_g1": "g1_size",
        f"val_g1": "g1_agg",
        f"count_g1": "g1_count",
        f"size_g2": "g2_size", 
        f"val_g2": "g2_agg", 
        f"count_g2": "g2_count",
        f"impact": "impact",
        "id": "id",
        "parentId": "parentId",
    }
    df = pd.DataFrame(chart_data).rename(columns= rename_dict)
    df = df.drop(set(df.columns) - set(rename_dict.values()), axis= 1)
    df = df.fillna(np.nan).replace([np.nan], [None])
    return df.to_dict(orient= "records")


@cache.memoize(timeout=30000)
def kpi_aggregation(kpi_info, connection_info, timeline="mom"):
    try:
        base_df, rca_df = get_baseline_and_rca_df(kpi_info, connection_info, timeline)

        rca = RootCauseAnalysis(
            base_df, rca_df, 
            dims= kpi_info['dimensions'], 
            metric= kpi_info['metric'], 
            agg = kpi_info["aggregation"],
            precision = kpi_info.get("metric_precision", 3),
        )

        panel_metrics = rca.get_panel_metrics()

        final_data = {
            "panel_metrics": panel_metrics,
            "line_chart_data": [],
            "insights": []
        }

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
def kpi_line_data(kpi_info, connection_info):
    metric = kpi_info["metric"]
    dt_col = kpi_info["datetime_column"]
    agg = kpi_info["aggregation"]
    
    _, rca_df = get_baseline_and_rca_df(kpi_info, connection_info, "mom")

    rca_df = rca_df.resample("D", on= dt_col).agg({metric: agg}).reset_index()
    rca_df = rca_df.round(kpi_info.get("metric_precision", 3))

    rca_df[dt_col] = rca_df[dt_col].dt.strftime('%Y/%m/%d %H:%M:%S')

    rca_df = rca_df.rename(columns= {
        dt_col: "date", 
        metric: "value"
    })
    return rca_df.to_dict(orient="records")


@cache.memoize(timeout=30000)
def rca_analysis(kpi_info, connection_info, timeline="mom", dimension=None):
    try:
        base_df, rca_df = get_baseline_and_rca_df(kpi_info, connection_info, timeline)

        num_dim_combs_to_consider = list(range(1, min(4, len(kpi_info['dimensions']) + 1)))

        rca = RootCauseAnalysis(
            base_df, rca_df, 
            dims= kpi_info['dimensions'], 
            metric= kpi_info['metric'], 
            agg = kpi_info["aggregation"],
            num_dim_combs_to_consider = num_dim_combs_to_consider,
            precision = kpi_info.get("metric_precision", 3),
        )

        if dimension is None or dimension in kpi_info["dimensions"]:
            impact_table, impact_table_col_mapping = rca.get_impact_rows_with_columns(dimension)
            waterfall_table = rca.get_waterfall_table_rows(dimension)
            waterfall_data, y_axis_lim = rca.get_waterfall_plot_data(dimension)

            final_data = {
                "data_table": impact_table,
                "data_columns": impact_table_col_mapping,
                "chart": {
                    "chart_table": waterfall_table,
                    "chart_data": waterfall_data,
                    "y_axis_lim": y_axis_lim
                }
            }
        else:
            raise ValueError(f"Dimension: {dimension} does not exist.")

        tmp_chart_data = final_data['data_table']
        final_data['data_table'] = process_rca_output(tmp_chart_data, kpi_info)
    except Exception as err:
        # print(traceback.format_exc())
        current_app.logger.error(f"Error in RCA Analysis: {err}")
        final_data = {
            "chart": {"chart_data": [], "y_axis_lim": [], "chart_table": []}, 
            "data_table": []
        }
    return final_data


@cache.memoize(timeout=30000)
def rca_hierarchical_data(kpi_info, connection_info, timeline="mom", dimension= None):
    try:
        base_df, rca_df = get_baseline_and_rca_df(kpi_info, connection_info, timeline)

        if dimension not in kpi_info["dimensions"]:
            raise ValueError(f"{dimension} not in {kpi_info['dimensions']}")

        num_dim_combs_to_consider = list(range(1, min(4, len(kpi_info['dimensions']) + 1)))

        rca = RootCauseAnalysis(
            base_df, rca_df, 
            dims= kpi_info['dimensions'], 
            metric= kpi_info['metric'], 
            agg = kpi_info["aggregation"],
            num_dim_combs_to_consider = num_dim_combs_to_consider,
            precision = kpi_info.get("metric_precision", 3),
        )

        final_data = {
            'data_table': rca.get_hierarchical_table(dimension)
        }

        tmp_chart_data = final_data['data_table']
        final_data['data_table'] = process_rca_output(tmp_chart_data, kpi_info)
    except Exception as err:
        # print(traceback.format_exc())
        current_app.logger.error(f"Error in RCA hierarchical table generation: {err}")
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

    kpi_info = Kpi.get_by_id(n)
    if kpi_info and kpi_info.as_dict:
        return kpi_info.as_dict
    raise ValueError(f"KPI ID {n} not found in KPI_DATA")
