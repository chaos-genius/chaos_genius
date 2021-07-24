from flask import current_app
from chaos_genius.databases.models.kpi_model import Kpi
from chaos_genius.databases.models.data_source_model import DataSource


def run_anomaly_for_kpi(kpi):
    print("Printing the anomaly...")

    connection_info = DataSource.get_by_id(2)
    print(connection_info.as_dict)

    return True
