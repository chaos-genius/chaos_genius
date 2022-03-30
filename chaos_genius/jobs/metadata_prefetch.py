import logging
from typing import cast

from celery import group
from celery.app.base import Celery

from chaos_genius.controllers.data_source_controller import get_data_source_list
from chaos_genius.controllers.data_source_metadata_controller import (
    run_metadata_prefetch,
)
from chaos_genius.extensions import celery as celery_ext
from chaos_genius.settings import METADATA_SYNC_TIME

celery = cast(Celery, celery_ext.celery)
logger = logging.getLogger(__name__)


@celery.task
def metadata_prefetch_daily_scheduler():
    """Celery task to check and trigger metadata prefetch from all active data sources."""
    data_sources = get_data_source_list()
    ds_task_groups = []
    for data_source in data_sources:
        logger.info(f"Starting metadata prefetch for Data Source: {data_source.id}")
        ds_task_groups.append(fetch_data_source_schema.s(data_source.id))
    g = group(ds_task_groups)
    res = g.apply_async()
    return res


@celery.task
def fetch_data_source_schema(data_source_id):
    """Scan schema of the data source and store that in the database.

    Args:
        data_source_id (int): Id of the data source.

    Raises:
        Exception: Raise if no data source is found.

    """
    if not data_source_id:
        raise Exception("No data source id provided")
    status = run_metadata_prefetch(data_source_id=data_source_id)
    return status
