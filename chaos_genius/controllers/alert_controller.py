# -*- coding: utf-8 -*-
"""alert controlller."""
import datetime
from typing import Any, Dict, List, Literal, Optional, Sequence, Tuple, overload

from flask_sqlalchemy import Pagination
from sqlalchemy import delete

from chaos_genius.databases.models.alert_model import Alert
from chaos_genius.databases.models.triggered_alerts_model import (
    TriggeredAlerts,
    triggered_alerts_data_datetime,
)
from chaos_genius.extensions import db
from chaos_genius.settings import DAYS_OFFSET_FOR_ANALTYICS

ALERT_CHANNELS = {
    "email": "E-mail",
    "slack": "Slack",
}
"""A mapping of channel types and a readable name for them."""


@overload
def get_alert_list(
    frequency: Optional[str] = None,
    as_obj: Literal[False] = False,
    page_num_size: Optional[None] = None,
    extra_filters: Optional[Sequence] = None,
) -> List[Dict[str, Any]]:
    ...


@overload
def get_alert_list(
    frequency: Optional[str] = None,
    as_obj: Literal[True] = True,
    page_num_size: Optional[None] = None,
    extra_filters: Optional[Sequence] = None,
) -> List[Alert]:
    ...


# TODO: find a way to specify the type inside Pagination i.e, type of Pagination.items
@overload
def get_alert_list(
    frequency: Optional[str] = None,
    as_obj: bool = False,
    page_num_size: Tuple[int, int] = (0, 0),
    extra_filters: Optional[Sequence] = None,
) -> Pagination:
    ...


def get_alert_list(
    frequency: Optional[str] = None,
    as_obj: bool = False,
    page_num_size: Optional[Tuple[int, int]] = None,
    extra_filters: Optional[Sequence] = None,
):
    """Retrieve all alerts.

    Args:
        frequency: alert frequency to filter on. If not provided, all
            alerts are retrieved.
        as_obj: returns a list of Alert objects if True, otherwise a
            list of Dicts representing the alerts is returned.
        page_num_size: if provided, returns a Pagination object instead of the whole
            list. This is a tuple of (page, per_page). The items inside the Pagination
            object are either Alert objects or Dicts based on as_obj.
        extra_filters: SQLalchemy filters added to the query if provided.
    """
    filters = [Alert.alert_status == True]  # noqa: E712
    if frequency:
        filters.extend([Alert.alert_frequency == frequency])
    if extra_filters is not None:
        filters.extend([filter for filter in extra_filters if filter is not None])

    query = Alert.query.filter(*filters).order_by(Alert.created_at.desc())

    if page_num_size is not None:
        page, per_page = page_num_size
        alerts_paginated: Pagination = query.paginate(page=page, per_page=per_page)
        if not as_obj:
            alerts_paginated.items = [alert.as_dict for alert in alerts_paginated.items]
        return alerts_paginated
    else:
        alerts: List[Alert] = query.all()

        if not as_obj:
            alerts_dict: List[Dict[str, Any]] = [alert.as_dict for alert in alerts]
            return alerts_dict

        return alerts


def get_alert_info(alert_id: int) -> Dict[str, Any]:
    """Retrieve Alert object by ID."""
    alert = Alert.get_by_id(alert_id)

    if not alert:
        raise Exception(f"Alert with ID {alert_id} does not exist.")
    else:
        return alert.as_dict


def clear_triggered_alerts_from_offset(alert_ids: List[int]):
    """Clear all triggered alerts data from T-offset day (inclusive)."""
    db.session.execute(
        delete(TriggeredAlerts)
        .where(
            (TriggeredAlerts.alert_conf_id.in_(alert_ids))
            & (
                triggered_alerts_data_datetime()
                >= datetime.date.today()
                - datetime.timedelta(days=DAYS_OFFSET_FOR_ANALTYICS)
            ),
        )
        .execution_options(synchronize_session="fetch")
    )
    db.session.commit()


def set_last_anomaly_timestamp_to_offset(alert: Alert, time_series_frequency: str):
    """Set last_anomaly_timestamp such that the next alert runs for offset."""
    if time_series_frequency == "D":
        previous_point_offset = datetime.timedelta(days=1)
    elif time_series_frequency == "H":
        previous_point_offset = datetime.timedelta(hours=1)
    else:
        raise Exception(f"Invalid time series frequency: {time_series_frequency}")

    just_before_offset = (
        datetime.datetime.combine(datetime.date.today(), datetime.time())
        - datetime.timedelta(days=DAYS_OFFSET_FOR_ANALTYICS)
        - previous_point_offset
    )

    if alert.last_anomaly_timestamp is not None:
        alert.last_anomaly_timestamp = min(
            alert.last_anomaly_timestamp,
            just_before_offset,
        )
    else:
        alert.last_anomaly_timestamp = just_before_offset
    db.session.commit()
