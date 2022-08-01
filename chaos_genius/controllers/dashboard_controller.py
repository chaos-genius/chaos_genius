from collections import defaultdict
from typing import (
    Any,
    Callable,
    DefaultDict,
    Dict,
    List,
    Literal,
    Optional,
    Tuple,
    Union,
    overload,
)

from chaos_genius.databases.models.dashboard_model import Dashboard
from chaos_genius.databases.models.dashboard_kpi_mapper_model import DashboardKpiMapper
from chaos_genius.extensions import db

# TODO: Refactor these functions

DEFAULT_SORT_BY = "number_of_kpis"
SORTER_MAPPING: Dict[str, Tuple[Callable[[Dict[str, Any]], Any], bool]] = {
    "number_of_kpis": (lambda dboard: len(dboard.get("kpis", [])), True),
    "alphabetical": (lambda dboard: dboard["name"], False),
    "recently_modified": (lambda dboard: dboard["last_modified"], True),
}
"""A mapping between names of sorters and (key fn for sorting, whether to reverse sort).

`reverse=True` means descending order.

The key function is used and not a column identifier (to be passed to `order_by`)
because some sorting such as `number_of_kpis` cannot be directly done in DB without
doing some JOINs and adding extra columns to the query. Since the number of dashboards
can be assumed to be relatively low, doing it in python is good enough.
"""


def get_dashboard_by_id(dashboard_id):
    return Dashboard.query.filter(
        Dashboard.id == dashboard_id,
        Dashboard.active == True
    ).first()


def get_dashboard_list_by_ids(dashboard_list=None):
    filters = [Dashboard.active == True]
    if dashboard_list is not None:
        filters.append(Dashboard.id.in_(dashboard_list))
    return Dashboard.query.filter(*filters).order_by(Dashboard.last_modified.desc()).all()


def get_mapper_obj_by_id(mapper_id):
    return DashboardKpiMapper.query.filter(
        DashboardKpiMapper.id == mapper_id, DashboardKpiMapper.active == True
    ).first()


def get_mapper_obj_by_dashboard_ids(dashboard_list):
    return DashboardKpiMapper.query.filter(
        DashboardKpiMapper.dashboard.in_(dashboard_list),
        DashboardKpiMapper.active == True
    ).all()


def get_mapper_obj_by_kpi_ids(kpi_list):
    return DashboardKpiMapper.query.filter(
        DashboardKpiMapper.kpi.in_(kpi_list),
        DashboardKpiMapper.active == True
    ).all()


def get_dashboard_list(
    sort_by: str = DEFAULT_SORT_BY,
    dashboard_ids: Optional[List[int]] = None
) -> List[Dict[str, Any]]:
    """Retrieve all dashboards with the IDs of KPIs it contains.

    Arguments:
        sort_by: the key to sort by. Assumed to be present in `SORTER_MAPPING`. Will
            fail if it's not in the mapping.
        dashboard_ids: if given, only these dashboards will be retrieved.
    """
    dashboard_list = get_dashboard_list_by_ids(dashboard_ids)
    dashboard_dict_list: List[Dict[str, Any]] = []

    for dashboard in dashboard_list:
        dashboard_dict = dashboard.as_dict
        mapper_list = get_mapper_obj_by_dashboard_ids([dashboard.id])
        dashboard_dict["kpis"] = [mapper.kpi for mapper in mapper_list]
        dashboard_dict_list.append(dashboard_dict)

    sort_key, reverse = SORTER_MAPPING[sort_by]
    dashboard_dict_list.sort(key=sort_key, reverse=reverse)

    return dashboard_dict_list


def kpi_mapper_dict(mapper_list):
    mapper_dict_list = []
    for mapper in mapper_list:
        mapper_dict = mapper.safe_dict
        del mapper_dict["dashboard"]
        mapper_dict_list.append(mapper_dict)
    return mapper_dict_list


def get_dashboard_dict_by_id(dashboard_id):
    dashboard_obj = Dashboard.query.filter(
        Dashboard.id == dashboard_id,
        Dashboard.active == True
    ).first()
    if dashboard_obj is None:
        return None
    mapper_obj_list = get_mapper_obj_by_dashboard_ids([dashboard_obj.id])
    # mapper_dict_list = kpi_mapper_dict(mapper_obj_list)
    dashboard_dict = dashboard_obj.as_dict
    dashboard_dict["kpis"] = [mapper.kpi for mapper in mapper_obj_list]
    return dashboard_dict


def create_dashboard(name):
    new_dashboard_obj = Dashboard(name=name)
    return new_dashboard_obj


def edit_dashboard_kpis(dashboard_id, kpi_list):
    mapper_obj_list = get_mapper_obj_by_dashboard_ids([dashboard_id])
    mapper_kpi_list = [mapper.kpi for mapper in mapper_obj_list]

    mapper_kpi_del_list = []
    for mapper_obj in mapper_obj_list:
        if mapper_obj.kpi not in kpi_list:
            mapper_obj.active = False
            mapper_obj.save(commit=True)
            mapper_kpi_del_list.append(mapper_obj.kpi)

    kpi_add_list = [kpi for kpi in kpi_list if kpi not in mapper_kpi_list]
    mapper_obj_list = create_dashboard_kpi_mapper([dashboard_id], kpi_add_list)
    mapper_kpi_add_list = [mapper.kpi for mapper in mapper_obj_list]
    return {
        "mapper_kpi_del_list": mapper_kpi_del_list,
        "mapper_kpi_add_list": mapper_kpi_add_list,
    }


def create_dashboard_kpi_mapper(dashboard_list, kpi_list):
    mapper_list = []
    for dashboard_id in dashboard_list:
        for kpi_id in kpi_list:
            mapper_obj = DashboardKpiMapper.query.filter(
                DashboardKpiMapper.dashboard == dashboard_id,
                DashboardKpiMapper.kpi == kpi_id,
            ).first()
            if mapper_obj is None:
                mapper_obj = DashboardKpiMapper(dashboard=dashboard_id, kpi=kpi_id)
            else:
                mapper_obj.active = True
            mapper_obj.save(commit=True)
            mapper_list.append(mapper_obj)
    return mapper_list


def check_kpis_in_dashboard(dashboard_id, kpi_ids):
    kpi_ids = list(set(kpi_ids))
    mapper_list = DashboardKpiMapper.query.filter(
        DashboardKpiMapper.dashboard == dashboard_id,
        DashboardKpiMapper.kpi.in_(kpi_ids),
        DashboardKpiMapper.active == True,
    ).all()

    temp_list = []

    for val in mapper_list:
        temp_list.append(val.kpi)

    return set(kpi_ids).issubset(temp_list)


def edit_kpi_dashboards(kpi_id, dashboard_id_list):
    mapper_obj_list = DashboardKpiMapper.query.filter(DashboardKpiMapper.kpi == kpi_id).all()
    all_active_dashboard_ids = set([mapper.dashboard for mapper in mapper_obj_list if mapper.active==True])
    all_dashboard_ids = set([mapper.dashboard for mapper in mapper_obj_list])
    add_dashboard_ids = set([dashboard_id for dashboard_id in dashboard_id_list
                             if dashboard_id not in all_dashboard_ids])
    enable_dashboard_ids = set([dashboard_id for dashboard_id in dashboard_id_list
                                  if dashboard_id not in all_active_dashboard_ids and dashboard_id in all_dashboard_ids])
    delete_dashboard_ids = set([dashboard_id for dashboard_id in all_active_dashboard_ids
                                if dashboard_id not in dashboard_id_list])

    for mapper_obj in mapper_obj_list:
        if mapper_obj.dashboard in delete_dashboard_ids:
            mapper_obj.active = False
            mapper_obj.save(commit=True)
        elif mapper_obj.dashboard in enable_dashboard_ids:
            mapper_obj.active = True
            mapper_obj.save(commit=True)

    for add_dashboard_id in add_dashboard_ids:
        mapper_obj = DashboardKpiMapper(dashboard=add_dashboard_id, kpi=kpi_id)
        mapper_obj.save(commit=True)

    return {
        "add_mapper_list": list(add_dashboard_ids) + list(enable_dashboard_ids),
        "delete_mapper_list": list(delete_dashboard_ids)
    }


def disable_mapper_for_kpi_ids(kpi_list):
    mapper_obj = get_mapper_obj_by_kpi_ids(kpi_list)
    for mapper in mapper_obj:
        mapper.active = False
        mapper.save(commit=True)
    return True


def enable_mapper_for_kpi_ids(kpi_list):
    mapper_obj = DashboardKpiMapper.query.filter(
        DashboardKpiMapper.kpi.in_(kpi_list)
    ).all()
    for mapper in mapper_obj:
        mapper.active = True
        mapper.save(commit=True)
    return True


@overload
def kpi_dashboard_mapper_dict(
    kpi_ids: List[int],
    as_dict: Literal[False] = False
) -> Dict[int, List[Dashboard]]:
    ...


@overload
def kpi_dashboard_mapper_dict(
    kpi_ids: List[int],
    as_dict: Literal[True] = True
) -> Dict[int, List[Dict[str, Any]]]:
    ...


def kpi_dashboard_mapper_dict(
    kpi_ids: List[int],
    as_dict: bool = False
) -> Union[Dict[int, List[Dashboard]], Dict[int, List[Dict[str, Any]]]]:
    """Retrieves the mapping between KPI IDs and dashboards as a dict."""
    result = (
        db.session.query(DashboardKpiMapper, Dashboard)
        .filter(
            DashboardKpiMapper.kpi.in_(kpi_ids),
            DashboardKpiMapper.active == True,  # noqa: E712
            Dashboard.id == DashboardKpiMapper.dashboard
        )
        .all()
    )

    mappers = [res[0] for res in result]
    dashboards = [res[1] for res in result]

    kpi_dashboard_id_mapper: DefaultDict[int, List[int]] = defaultdict(list)
    for mapper in mappers:
        kpi_dashboard_id_mapper[mapper.kpi].append(mapper.dashboard)

    dashboards_dict: Union[Dict[int, Dict[str, Any]], Dict[int, Dashboard]]
    if not as_dict:
        dashboards_dict = {
            dashboard.id: dashboard for dashboard in dashboards
        }
    else:
        dashboards_dict = {
            dashboard.id: dashboard.as_dict for dashboard in dashboards
        }

    return {
        kpi_id: [dashboards_dict[dashboard_id] for dashboard_id in dashboard_ids]
        for kpi_id, dashboard_ids in kpi_dashboard_id_mapper.items()
    }


def all_dashboard_names() -> Dict[int, str]:
    """Return a list of names of all active dashboards."""
    return {
        row[0]: row[1]
        for row in db.session.query(Dashboard.id, Dashboard.name)
        .filter(Dashboard.active == True)  # noqa: E712
        .order_by(Dashboard.name)
        .all()
    }
