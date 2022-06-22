"""Provides utility functions for generating waterfalls."""

from itertools import combinations
from typing import Tuple

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd


def get_best_subgroups_using_superset_algo(
    df_subgroups: pd.DataFrame,
    max_waterfall_columns: int,
    max_subgroups_considered: int,
) -> pd.DataFrame:
    """Return best subgroups using superset algorithm.

    :param df_subgroups: dataframe with all subgroups
    :type df_subgroups: pd.DataFrame
    :param max_waterfall_columns: max number of waterfall columns
    :type max_waterfall_columns: int
    :param max_subgroups_considered: max number of columns to consider
    :type max_subgroups_considered: int
    :return: filtered dataframe with best subgroups
    :rtype: pd.DataFrame
    """
    current_comb = []
    current_comb_filters = []
    i = -1

    while (
        i < len(df_subgroups) - 1
        and i < max_subgroups_considered
        and len([i[-1] for i in current_comb if i[-1] is False]) < max_waterfall_columns
    ):

        i += 1
        curr_filter_dict = df_subgroups.iloc[i]["subgroup"]
        curr_filter_split_dict = [{k: v} for k, v in curr_filter_dict.items()]
        len_curr_filters = len(curr_filter_split_dict)

        # check if filters of subgroup are already
        # in current combination.
        curr_filters_exist_in_comb = False

        for comb_filter_dict, len_comb_filter in current_comb_filters:

            if len_curr_filters == len_comb_filter:
                if curr_filter_dict == comb_filter_dict:
                    curr_filters_exist_in_comb = True
                    break

            elif len_curr_filters > len_comb_filter:
                curr_filter_combs = list(
                    combinations(curr_filter_split_dict, len_comb_filter)
                )
                curr_filter_combs = [dict(comb[0]) for comb in curr_filter_combs]
                if comb_filter_dict in curr_filter_combs:
                    curr_filters_exist_in_comb = True
                    break

            else:
                continue

        ignored = curr_filters_exist_in_comb
        if not ignored:
            current_comb_filters.append((curr_filter_dict, len_curr_filters))

        current_comb.append([df_subgroups.iloc[i]["subgroup"], ignored])

    return pd.DataFrame(current_comb, columns=["subgroup", "ignored"])


def get_waterfall_ylims(trans: pd.DataFrame, col: str) -> Tuple[float, float]:
    """Return y limits for the Y axis of a waterfall plot.

    :param trans: Dataframe to use
    :type trans: pd.DataFrame
    :param col: Column name of values
    :type col: str
    :return: y-axis limits for waterfall
    :rtype: Tuple[float, float]
    """
    blank = trans[col].cumsum().shift(1).fillna(0).shift(-1)
    blank.iloc[-1] = trans.iloc[-1]

    y_min = min(blank) * 0.95
    y_max = max(blank) * 1.05

    return y_min, y_max


def waterfall_plot_mpl(
    data_df: pd.DataFrame, col: str, y_lims: Tuple[float, float] = None, rot: int = 0
) -> plt.Axes:
    """Plot waterfall and returns a plt.Axes object.

    :param data_df: Input Data for plotting
    :type data_df: pd.DataFrame
    :param col: Column with label strings
    :type col: str
    :param y_lims: Limits for y-axis, defaults to None
    :type y_lims: Tuple[float, float], optional
    :param rot: Degrees to rotate x-axis labels, defaults to 0
    :type rot: int, optional
    :return: Waterfall chart
    :rtype: plt.Axes
    """
    waterfall_bottom = data_df[col].cumsum().shift(1).fillna(0)

    # The steps graphically show the levels
    # as well as used for label placement
    step = waterfall_bottom.reset_index(drop=True).repeat(3).shift(-1)
    step[1::3] = np.nan

    # When plotting the last element, we want to show the full bar,
    # Set the blank to 0
    waterfall_bottom.loc["end"] = 0

    # Plot and label
    df_copy = data_df.copy()

    df_copy["pos"] = df_copy[col]
    df_copy["neg"] = df_copy[col]
    df_copy.loc[df_copy["pos"] < 0, "pos"] = 0
    df_copy.loc[df_copy["neg"] > 0, "neg"] = 0
    df_copy.drop(col, axis=1, inplace=True)

    my_plot = df_copy.plot(
        kind="bar",
        stacked=True,
        bottom=waterfall_bottom,
        legend=None,
        figsize=(15, 5),
        rot=rot,
        color={"pos": "green", "neg": "red"},
    )
    my_plot.plot(step.index, step.values, "k")

    plt.ylim(y_lims)

    return my_plot
