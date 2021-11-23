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
        dashboard_dict["kpi_count"] = DashboardKpiMapper.query.filter_by(dashboard=dashboard.id, active=True).count()
        dashboard_dict_list.append(dashboard_dict)
    return dashboard_dict_list

def kpi_mapper_dict(mapper_list):
    mapper_dict_list = []
    for mapper in mapper_list:
        mapper_dict=mapper.safe_dict
        del mapper_dict["dashboard"]
        mapper_dict_list.append(mapper_dict)
    return mapper_dict_list

def get_dashboard_dict_by_id(dashboard_id):
    dashboard_obj = Dashboard.query.get(dashboard_id)
    if dashboard_obj is None:
        return None
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
                                                            ).all()
    mapper_add_list = []
    for kpi_id in kpi_add_list:
        mapper_obj = DashboardKpiMapper.query.filter(
                                                        DashboardKpiMapper.dashboard == dashboard_id, 
                                                        DashboardKpiMapper.kpi == kpi_id
                                                    ).first()
        if mapper_obj is None:
            mapper_obj = DashboardKpiMapper(dashboard=dashboard_id, kpi=kpi_id)
        else:
            mapper_obj.active = True
        mapper_add_list.append(mapper_obj)

    return {"mapper_delete_list":mapper_delete_list, "mapper_add_list":mapper_add_list}

def check_kpis_in_dashboard(dashboard_id, kpi_ids):
    kpi_ids = list(set(kpi_ids))
    mapper_list = DashboardKpiMapper.query.filter(
                                                  DashboardKpiMapper.dashboard == dashboard_id,
                                                  DashboardKpiMapper.kpi.in_(kpi_ids),
                                                  DashboardKpiMapper.active == True
                                                 ).all()
    
    temp_list = []

    for val in mapper_list:
        temp_list.append(val.kpi)
    
    return set(kpi_ids).issubset(temp_list)
