"""Provides utilties for loading data for Root Cause Analysis."""

from datetime import datetime, timedelta
from typing import Tuple

import pandas as pd
from chaos_genius.core.rca.constants import TIMELINE_NUM_DAYS_MAP
from chaos_genius.core.utils.data_loader import DataLoader


def rca_load_data(
    kpi_info: dict,
    end_date: datetime,
    timeline: str = "mom",
    tail: int = None,
) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """Load data for performing RCA.

    :param kpi_info: kpi info to load data for, defaults to "mom"
    :type kpi_info: dict, optional
    :param end_date: end date to load data for, defaults to "mom"
    :type end_date: datetime, optional
    :param timeline: timeline to load data for, defaults to "mom"
    :type timeline: str, optional
    :param tail: limit data loaded to this number of rows, defaults to None
    :type tail: int, optional
    :return: tuple with baseline data and rca data for
    :rtype: Tuple[pd.DataFrame, pd.DataFrame]
    """

    dt_col = kpi_info["datetime_column"]

    end_dt_obj = datetime.today() if end_date is None \
        else end_date
    num_days = TIMELINE_NUM_DAYS_MAP[timeline]

    base_dt_obj = end_dt_obj - timedelta(days=2 * num_days)
    mid_dt_obj = end_dt_obj - timedelta(days=num_days)

    base_dt = str(base_dt_obj.date())
    end_dt = str(end_dt_obj.date())

    df = DataLoader(
        kpi_info, end_date=end_dt, start_date=base_dt, tail=tail).get_data()

    base_df = df[df[dt_col] <= mid_dt_obj]
    rca_df = df[df[dt_col] > mid_dt_obj]

    return base_df, rca_df
