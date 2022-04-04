from sqlalchemy import delete

from chaos_genius.databases.models.anomaly_data_model import AnomalyDataOutput
from chaos_genius.databases.models.rca_data_model import RcaData
from chaos_genius.extensions import db


def delete_rca_output_for_kpi(kpi_id: int):
    """Delete RCA output for a prticular KPI"""
    delete_kpi_query = delete(RcaData).where(RcaData.kpi_id == kpi_id)
    db.session.execute(delete_kpi_query)
    db.session.commit()
    # retrun True

def delete_anomaly_output_for_kpi(kpi_id: int):
    """Delete Anomaly output for a particular KPI"""
    delete_kpi_query = delete(AnomalyDataOutput).where(AnomalyDataOutput.kpi_id == kpi_id)
    db.session.execute(delete_kpi_query)
    db.session.commit()


def find_percentage_change(curr_val, prev_val):

    if prev_val == 0:
        return "--"

    change = curr_val - prev_val
    percentage_change = (change / prev_val) * 100
    return str(round_number(percentage_change))


def get_anomaly_count(kpi_id, timeline):

    curr_date = datetime.now().date()
    (_, _), (sd, _) = TIME_RANGES_BY_KEY[timeline]["function"](curr_date)

    # TODO: Add the series type filter
    anomaly_data = AnomalyDataOutput.query.filter(
        AnomalyDataOutput.kpi_id == kpi_id,
        AnomalyDataOutput.anomaly_type == "overall",
        AnomalyDataOutput.is_anomaly == 1,
        AnomalyDataOutput.data_datetime >= sd,
    ).all()

    return len(anomaly_data)