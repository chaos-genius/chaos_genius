from flask import current_app

from chaos_genius.databases.models.kpi_model import Kpi
from chaos_genius.databases.models.data_source_model import DataSource
from chaos_genius.views.kpi_view import get_anomaly_df, get_kpi_data_from_id

from sandbox.core.anomaly.anomaly_monolithic_arch import compute_entire_multi_dim_anomaly
from sandbox.core.anomaly.anomaly_monolithic_arch import get_dq_json
from sandbox.core.anomaly.anomaly_monolithic_arch import DEFAULT_SENSITIVITY_THRESHOLDS


def run_anomaly_for_kpi(kpi_id: int) -> bool:
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
    kpi_seasonaity = kpi_info.get("seasonality","auto")
    kpi_freq = kpi_info.get("frequency", "D")
    

    df_anomaly = compute_entire_multi_dim_anomaly(
        base_df,
        kpi_metric,
        kpi_agg_dict,
        kpi_dimensions,
        date_column=kpi_date_col,
        algo_used=kpi_algo,
        num_deviation=None,
        num_deviation_lower=None,
        num_deviation_upper=None,
        interval_width=kpi_sensitivity,
        seasonality=kpi_seasonaity,
        frequency=kpi_freq
    )

    df_all, _ = get_dq_json(
        base_df,
        kpi_algo,
        kpi_date_col,
        kpi_metric,
        kpi_sensitivity,
        kpi_freq
    )

    print(df_anomaly)
    print(df_all)

    return True
