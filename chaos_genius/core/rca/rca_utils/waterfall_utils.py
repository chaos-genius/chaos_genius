"""Provides utility functions for generating waterfalls"""

from itertools import combinations
from typing import Tuple
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt


def get_best_subgroups_using_superset_algo(
    df_subgroups: pd.DataFrame,
    max_waterfall_columns: int,
    max_subgroups_considered: int,
) -> pd.DataFrame:

    current_comb = []
    current_comb_filters = []
    i = -1

    while i < len(df_subgroups) - 1 and i < max_subgroups_considered \
            and len([i[-1] for i in current_comb if i[-1] is False]) < max_waterfall_columns:

        i += 1
        ignored = False

        curr_filter_string = df_subgroups.iloc[i]["string"]
        curr_filter_split = curr_filter_string.split(" and ")
        len_curr_filters = len(curr_filter_split)

        # check if filters of subgroup are already
        # in current combination.
        curr_filters_exist_in_comb = False

        for comb_filter_string, len_comb_filter in current_comb_filters:

            if len_curr_filters == len_comb_filter:
                if curr_filter_string == comb_filter_string:
                    curr_filters_exist_in_comb = True
                    break

            elif len_curr_filters > len_comb_filter:
                curr_filter_combs = combinations(
                    curr_filter_split, len_comb_filter)
                curr_filter_combs = [" and ".join(
                    i) for i in curr_filter_combs]
                if comb_filter_string in curr_filter_combs:
                    curr_filters_exist_in_comb = True
                    break

            else:
                continue

        if curr_filters_exist_in_comb:
            ignored = True

        if not ignored:
            current_comb_filters.append((curr_filter_string, len_curr_filters))

        current_comb.append([
            df_subgroups.iloc[i]["string"],
            ignored
        ])

    return pd.DataFrame(
        current_comb,
        columns=[
            "string", "ignored"
        ]
    )


def get_waterfall_ylims(
    trans: pd.DataFrame,
    col: str
) -> Tuple[float, float]:
    """Returns y limits for the Y axis of a waterfall plot

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
    data_df: pd.DataFrame,
    col: str,
    y_lims: Tuple[float, float] = None,
    rot: int = 0
) -> plt.Axes:
    """Plots waterfall and returns a plt.Axes object.

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

    # Get the net total number for the final element in the waterfall
    # TODO: Remove this after checking
    # total = trans.sum()[col]
    # trans.loc["net"] = total
    # blank.loc["net"] = total

    # The steps graphically show the levels
    # as well as used for label placement
    step = waterfall_bottom.reset_index(drop=True).repeat(3).shift(-1)
    step[1::3] = np.nan

    # When plotting the last element, we want to show the full bar,
    # Set the blank to 0
    waterfall_bottom.loc["end"] = 0

    #Plot and label

    df_copy = data_df.copy()

    df_copy["pos"] = df_copy[col]
    df_copy["neg"] = df_copy[col]
    df_copy.loc[df_copy["pos"] < 0, "pos"] = 0
    df_copy.loc[df_copy["neg"] > 0, "neg"] = 0
    df_copy.drop(col, axis=1, inplace=True)

    my_plot = df_copy.plot(
        kind='bar', stacked=True, bottom=waterfall_bottom,
        legend=None, figsize=(15, 5), rot=rot,
        color={"pos": "green", "neg": "red"}
    )
    my_plot.plot(step.index, step.values, 'k')

    plt.ylim(y_lims)

    return my_plot
