from chaos_genius.databases.models.dashboard_model import Dashboard
from chaos_genius.databases.models.dashboard_kpi_mapper_model import DashboardKpiMapper

def get_dashboard_by_id(dashboard_id):
    return Dashboard.query.get(dashboard_id)

def get_mapper_obj_by_id(mapper_id):
    return DashboardKpiMapper.query.get(mapper_id)

def get_dashboard_list():
    dashboard_list = Dashboard.query.filter_by(active=True)
    dashboard_dict_list = []
    for dashboard in dashboard_list:
        dashboard_dict = dashboard.as_dict
        dashboard_dict["kpi_count"] = DashboardKpiMapper.filter_by(dashboard=dashboard.id).count()
        dashboard_dict_list.append(dashboard_dict)
    return dashboard_dict_list

def kpi_mapper_dict(mapper_list):
    mapper_dict_list = []
    for mapper in mapper_list:
        mapper_dict_list.append(mapper.as_dict)
    return mapper_list

def get_dashboard_dict_by_id(dashboard_id):
    dashboard_obj = Dashboard.query.get(dashboard_id)
    mapper_obj_list = DashboardKpiMapper.query.filter_by(dashboard=dashboard_obj.id)
    mapper_dict_list = kpi_mapper_dict(mapper_obj_list)
    dashboard_dict = dashboard_obj.as_dict
    dashboard_dict["kpis"] = mapper_dict_list
    return dashboard_dict

def create_dashboard(name,kpi_list):
    new_dashboard_obj = Dashboard(name=name)
    
    kpi_mapper_obj_list = []
    for kpi_id in kpi_list:
        new_mapper_obj = DashboardKpiMapper(
                            dashboard=new_dashboard_obj.id,
                            kpi=kpi_id
                        )
        kpi_mapper_obj_list.append(new_mapper_obj)

    return {"dashboard":new_dashboard_obj,"mapper_list":kpi_mapper_obj_list}





