from chaos_genius.extensions import celery as celery_ext
from chaos_genius.extensions import db
from celery import group
# from chaos_genius.databases.models.data_source_model import DataSource
# from chaos_genius.databases.models.kpi_model import Kpi
# from chaos_genius.databases.models.config_setting_model import ConfigSetting
# from chaos_genius.alerts.slack import trigger_overall_kpi_stats

celery = celery_ext.celery

@celery.task
def add_together(a, b):
    print(a+b)
    print("It works...xD")
    # return a + b

@celery.task
def anomaly_single_kpi(kpi_id, end_date= None):
    status  = run_anomaly_for_kpi(kpi_id, end_date)
    if status:
        print(f"Completed the anomaly for KPI ID: {kpi}.")
    else:
        print(f"Anomaly failed for the for KPI ID: {kpi}.")
        
    return status 


@celery.task        
def anomaly_kpi():
    kpis = Kpi.query.all().distinct('kpi_id')     
    task_group = []
    for kpi in kpis:
        task_group.append(anomaly_single_kpi.s(kpi))
    g = group(task_group)
    g.apply_async()
    return g.join()

        


