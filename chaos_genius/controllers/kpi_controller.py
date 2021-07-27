from flask import current_app
import pandas as pd

from chaos_genius.databases.models.anomaly_data_model import AnomalyData
from chaos_genius.databases.models.data_source_model import DataSource
from chaos_genius.views.kpi_view import get_kpi_data_from_id
from chaos_genius.views.anomaly_data_view import get_anomaly_df

from sandbox.core.anomaly.anomaly_monolithic_arch import anomaly_detection
from sandbox.core.anomaly.anomaly_monolithic_arch import get_dq_json
from sandbox.core.anomaly.anomaly_monolithic_arch import DEFAULT_SENSITIVITY_THRESHOLDS


def run_anomaly_for_kpi(kpi_id: int) -> bool:

    # TODO: Store entire df_anomaly and use sorting and filtering on
    # that for drilldowns.

    print("Printing the anomaly...")

    kpi_info = get_kpi_data_from_id(kpi_id)
    connection_info = DataSource.get_by_id(kpi_info["data_source"])
    print(connection_info.as_dict)

    base_df = get_anomaly_df(kpi_info, connection_info.as_dict)

    kpi_metric = kpi_info["metric"]
    kpi_agg_dict = {kpi_info["metric"]: kpi_info["aggregation"]}
    kpi_dimensions = kpi_info["dimensions"]
    kpi_date_col = kpi_info["datetime_column"]
    kpi_algo = kpi_info.get("anomaly_algo", "prophet")
    kpi_sensitivity = DEFAULT_SENSITIVITY_THRESHOLDS[
        kpi_info.get("sensitivity", "Medium")
    ]
    kpi_seasonality = kpi_info.get("seasonality","auto")
    kpi_freq = kpi_info.get("frequency", "D")


    # Calculate overall anomaly
    print("Calculating overall anomaly")
    overall_anom_graph = anomaly_detection(
        base_df,
        None,
        None,
        kpi_metric,
        kpi_agg_dict,
        kpi_dimensions,
        date_column_name=kpi_date_col,
        algo_used=kpi_algo,
        interval_width=kpi_sensitivity,
        frequency=kpi_freq
    )
    print("Finished.")

    # find severity score
    overall_severity = overall_anom_graph[0]["severity"]
    overall_anom_score = overall_severity[-1][1]

    # Add to dbd
    overall_anom_data = AnomalyData(
        kpi_id = kpi_id,
        anomaly_type = "overall",
        chart_data = overall_anom_graph[0],
        severity_score = overall_anom_score
    )
    overall_anom_data.save(commit= True)

    # Get base id
    base_id = overall_anom_data.id

    # find anomalous points
    anom_points = [i[0] for i in overall_severity if i[1] > 0]

    # Calculate drilldowns on anomalous points
    for anom_point in anom_points:

        # Calculate graphs for anomalous points
        print("Calculating DD anomaly")
        dd_anom_graph = anomaly_detection(
            base_df,
            None,
            None,
            kpi_metric,
            kpi_agg_dict,
            kpi_dimensions,
            date_column_name=kpi_date_col,
            algo_used=kpi_algo,
            interval_width=kpi_sensitivity,
            frequency=kpi_freq,
            anomaly_date= pd.to_datetime(anom_point, unit= "ms")
        )
        print("Finished")

        for series in dd_anom_graph:

            # if series is for overall_kpi, skip it
            if series['sub_dimension'] == "overall_kpi":
                continue

            # find severity score
            dd_anom_score = series["severity"][-1][1]

            series_dim_list = series["sub_dimension"]
            series_dim_list = series_dim_list if isinstance(series_dim_list, list) else [series_dim_list]

            # Add to db
            dd_anom_data = AnomalyData(
                kpi_id = kpi_id,
                anomaly_type = "drilldown",
                base_anomaly_id = base_id,
                drilldown_dimensions = series_dim_list,
                chart_data = series,
                severity_score = dd_anom_score,
                anomaly_timestamp = anom_point
            )
            dd_anom_data.save(commit=True)

    # Calculate DQ graphs
    print("Calculating overall anomaly")
    _, dq_graphs = get_dq_json(
        base_df,
        kpi_algo,
        kpi_date_col,
        kpi_metric,
        kpi_sensitivity,
        kpi_freq
    )
    print("Finished.")

    for series in dq_graphs:

        # find severity score
        dq_anom_score = series["severity"][-1][1]

        series_dim_list = series["sub_dimension"]
        series_dim_list = series_dim_list if isinstance(series_dim_list, list) else [series_dim_list]

        # Add to db
        dd_anom_data = AnomalyData(
            kpi_id = kpi_id,
            anomaly_type = "data_quality",
            base_anomaly_id = base_id,
            drilldown_dimensions = series_dim_list,
            chart_data = series,
            severity_score = dq_anom_score,
            anomaly_timestamp = anom_point
        )
        dd_anom_data.save(commit=True)

    return True
