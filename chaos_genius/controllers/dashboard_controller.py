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
        dashboard_dict["kpi_count"] = DashboardKpiMapper.filter_by(dashboard=dashboard.id, active=True).count()
        dashboard_dict_list.append(dashboard_dict)
    return dashboard_dict_list

def kpi_mapper_dict(mapper_list):
    mapper_dict_list = []
    for mapper in mapper_list:
        mapper_dict_list.append(mapper.as_dict)
    return mapper_list

def get_dashboard_dict_by_id(dashboard_id):
    dashboard_obj = Dashboard.query.get(dashboard_id)
    mapper_obj_list = DashboardKpiMapper.query.filter_by(dashboard=dashboard_obj.id, active=True)
    mapper_dict_list = kpi_mapper_dict(mapper_obj_list)
    dashboard_dict = dashboard_obj.as_dict
    dashboard_dict["kpis"] = mapper_dict_list
    return dashboard_dict

def create_dashboard(name):
    new_dashboard_obj = Dashboard(name=name)
    return new_dashboard_obj

def edit_dashboard_kpis(dashboard_id,kpi_delete_list,kpi_add_list):
    mapper_delete_list = []
    if kpi_delete_list:
        mapper_delete_list = DashboardKpiMapper.query.filter(DashboardKpiMapper.dashboard == dashboard_id,
                                                             DashboardKpiMapper.kpi.in_(kpi_delete_list)
                                                            )
    mapper_add_list = []
    for kpi_id in kpi_add_list:
        mapper_add_list.append(DashboardKpiMapper(dashboard=dashboard_id, kpi=kpi_id))

    return {"mapper_delete_list":mapper_delete_list, "mapper_add_list":mapper_add_list}


