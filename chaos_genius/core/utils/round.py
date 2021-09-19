"""Provides utility functions for rounding numbers."""

from typing import Union

import pandas as pd


def round_number(n: float) -> Union[int, float]:
    """Round a number based on its size."""
    abs_n = abs(n)
    if abs_n >= 10000:
        return round(n)
    elif abs_n >= 100:
        return round(n, 1)
    elif abs_n >= 1:
        return round(n, 2)
    else:
        return round(n, 3)


def round_series(series: pd.Series) -> pd.Series:
    """Round a pandas' series based on its size."""
    if series.dtype != object:
        return series.apply(lambda x: round_number(x))
    else:
        return series


def round_df(df: pd.DataFrame) -> pd.DataFrame:
    """Round a pandas' dataframe based on its size."""
    new_df = df.copy()
    for col in new_df.columns:
        new_df[col] = round_series(new_df[col])
    return new_df
