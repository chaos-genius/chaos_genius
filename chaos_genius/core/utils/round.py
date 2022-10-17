"""Provides utility functions for rounding numbers."""

from typing import Union

import numpy as np
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


def round_column_in_df(df: pd.DataFrame, col: str):
    """Round given column in dataframe based on its size.

    This is vectorized and does not use `apply`.
    """
    col_filled = df[col].fillna(0)
    col_abs = col_filled.abs()

    df[col] = np.where(
        # if value is not null
        df[col].notna(),
        np.where(
            # if value < 1, round to 3 decimals
            col_abs < 1,
            col_filled.round(3),
            np.where(
                # if value between 1 and 100, round to 2
                (col_abs >= 1) & (col_abs < 100),
                col_filled.round(2),
                np.where(
                    # if value between 100 and 10000, round to 1
                    (col_abs >= 100) & (col_abs < 10000),
                    col_filled.round(1),
                    # if value > 10000, round to integer
                    col_filled.round(),
                ),
            ),
        ),
        None,
    )
