from flask import current_app
import pandas as pd

from chaos_genius.views.kpi_view import get_kpi_data_from_id
from chaos_genius.core.anomaly.controller import AnomalyDetectionController

def run_anomaly_for_kpi(kpi_id: int) -> bool:

    # TODO: Store entire df_anomaly and use sorting and filtering on
    # that for drilldowns.

    print("Printing the anomaly...")

    kpi_info = get_kpi_data_from_id(kpi_id)

    adc = AnomalyDetectionController(kpi_info)

    adc.detect()