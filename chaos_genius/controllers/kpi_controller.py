import traceback
from datetime import datetime

from flask import current_app
import pandas as pd

from chaos_genius.views.kpi_view import get_kpi_data_from_id
from chaos_genius.core.anomaly.controller import AnomalyDetectionController
from chaos_genius.core.rca.rca_controller import RootCauseAnalysisController


def run_anomaly_for_kpi(kpi_id: int, end_date: datetime = None) -> bool:

    print("Printing the anomaly...")

    try:

        kpi_info = get_kpi_data_from_id(kpi_id)

        adc = AnomalyDetectionController(kpi_info, end_date)

        adc.detect()

    except Exception as e:
        traceback.print_exc()
        return False

    return True


def run_rca_for_kpi(kpi_id: int, end_date: datetime = None) -> bool:

    try:
        kpi_info = get_kpi_data_from_id(kpi_id)

        rca_controller = RootCauseAnalysisController(kpi_info, end_date)
        
        rca_controller.compute()

    except Exception as e:
        traceback.print_exc()
        return False

    return True
