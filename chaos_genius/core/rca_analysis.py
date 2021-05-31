import re
from typing import Tuple
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

from copy import deepcopy
from math import comb
from textwrap import wrap

import json

from chaos_genius.core.rca_utils import *

from IPython.display import display


def conv(inp):
    return " and ".join([f"`{col}`==\"{val}\"" for col, val in zip(inp.index, inp.values) if val is not np.nan])


def col_name_mapper(x):
    return "_".join(x) if not "" in x else "".join(x)


def compare_subgroups(
    d1: pd.DataFrame, 
    d2: pd.DataFrame, 
    dims: list, 
    metrics: list, 
    agg: list, 
    m_col_names: dict[str: dict[str: list]], 
    suffixes: list
) -> pd.DataFrame:
    """Compares 2 subgroups based on metrics

    Args:
        d1 (pd.DataFrame): Subgroup 1 (baseline)
        d2 (pd.DataFrame): Subgroup 2 (RCA/focus group)
        dims (list): Dimensions to use
        metrics (list): Metrics to compute for
        agg (list): [description]
        m_col_names (dict[str): Column names to use (highly specific)
        suffixes (list): Suffixes for groups (highly specific)

    Returns:
        pd.DataFrame: Dataframe with cols 'val', 'size' and 'impact' to 
            show impact calculations of both subgroups
    """
    d1_out = d1.groupby(dims)
    d1_out = d1_out.agg({metric: agg for metric in metrics}).reset_index()
    d1_out.columns = d1_out.columns.map(col_name_mapper)
    d1_out.columns = d1_out.columns.get_level_values(0)
    
    d2_out = d2.groupby(dims)
    d2_out = d2_out.agg({metric: agg for metric in metrics}).reset_index()
    d2_out.columns = d2_out.columns.map(col_name_mapper)
    d2_out.columns = d2_out.columns.get_level_values(0)

    out = d1_out.merge(d2_out, how="outer", on=dims, suffixes= suffixes).fillna(0)
    
    for i in range(len(metrics)):
        out[m_col_names["val"]["_g1"][i]] = out[m_col_names["mean"]["_g1"][i]] * out[m_col_names["count"]["_g1"][i]] / (out[m_col_names["count"]["_g1"][i]].sum() + 1e-5)
        out[m_col_names["val"]["_g2"][i]] = out[m_col_names["mean"]["_g2"][i]] * out[m_col_names["count"]["_g2"][i]] / (out[m_col_names["count"]["_g2"][i]].sum() + 1e-5)

        out[m_col_names["size"]["_g1"][i]] = out[m_col_names["count"]["_g1"][i]] * 100 / (out[m_col_names["count"]["_g1"][i]].sum() + 1e-5)
        out[m_col_names["size"]["_g2"][i]] = out[m_col_names["count"]["_g2"][i]] * 100 / (out[m_col_names["count"]["_g2"][i]].sum() + 1e-5)

        out[m_col_names["impact"][i]] = out[m_col_names["val"]["_g2"][i]] - out[m_col_names["val"]["_g1"][i]]

    return out


def group_comparison_across_subgroups(
    d1: pd.DataFrame, 
    d2: pd.DataFrame, 
    dims: list, 
    metrics: list,
    n: list
) -> pd.DataFrame:
    """Performs comparison across all subgroups.

    Args:
        d1 (pd.DataFrame): Group 1 (baseline)
        d2 (pd.DataFrame): Group 2 (RCA/focus group)
        dims (list): Dimensions to use
        metrics (list): Metrics to compute for
        n (list): List of number of dimensions to use as a subgroup 

    Returns:
        pd.DataFrame: Dataframe which has the output
    """

    # aggregations to use
    agg = ["mean", "count"]

    # create bins for any numerical dimensions
    non_cat_cols = d1.dtypes[dims][d1.dtypes[dims] != object]

    full_df = pd.concat([d1, d2])
    new_dims = dims[:]
    
    for col in non_cat_cols.index:
        new_dims.remove(col)
        a = pd.qcut(full_df[col], 4, duplicates= "drop").astype(str)
        full_df[col+"_binned"] = a
        new_dims.append(col+"_binned")

    dims = new_dims

    # generate all column names
    suffixes = ["_g1", "_g2"]
    m_col_names = {
        "mean": {j: [i+"_mean"+j for i in metrics] for j in suffixes},
        "count": {j: [i+"_count"+j for i in metrics] for j in suffixes},
        "val": {j: [i+"_val"+j for i in metrics] for j in suffixes},
        "impact": [i+"_impact" for i in metrics],
        "size": {j: [i+"_size"+j for i in metrics] for j in suffixes}
    }

    list_tuples = create_list_tuples(dims, n)
    list_tuples = \
        [i for k, items in list_tuples.items() for i in items if k in n]

    first_subgroup = list_tuples.pop(0)
    df_impact = compare_subgroups(
        d1, d2, first_subgroup, 
        metrics, agg, m_col_names, suffixes
    )

    for subgroup in list_tuples:
        df_impact = df_impact.append(compare_subgroups(
            d1, d2, subgroup, metrics, agg, m_col_names, suffixes
        ))

    return df_impact


def get_subgroup_impacts(
    d1: pd.DataFrame, 
    d2: pd.DataFrame, 
    dims: list, 
    metrics: list, 
    agg: list, 
    n: list
) -> pd.DataFrame:
    """Gets impacts of subgroups of levels in n for d1 and d2 across 
    dims for metrics.

    Args:
        d1 (pd.DataFrame): Group 1 (Base Group)
        d2 (pd.DataFrame): Group 2 (RCA/Focus Group)
        dims (list): Dimensions ot create subgroups from
        metrics (list): Metrics to use
        agg (list): Metric Aggregations
        n (list): Level of subgroups to use

    Returns:
        pd.DataFrame: Dataframe with sizes, contributions and impact 
        values for each subgroup
    """

    final_out = group_comparison_across_subgroups(
        d1, d2, dims, metrics, n
    )

    #sort by absolute impact values
    final_out[[i + "_abs_impact" for i in metrics]] = \
        final_out[[i + "_impact" for i in metrics]].abs()
    final_out = final_out.sort_values(
        [i + "_abs_impact" for i in metrics], ascending= False
    ).drop([i + "_abs_impact" for i in metrics], axis= 1)

    # convert columns to query strings
    final_out["string"] = list(map(lambda x: conv(x[1]), final_out[dims].iterrows()))
    final_out = final_out[["string"] + [j for i in [[f"{m}_impact", f"{m}_size_g1", f"{m}_size_g2", f"{m}_val_g1", f"{m}_val_g2", f"{m}_mean_g1", f"{m}_mean_g2"] for m in metrics] for j in i]]
    final_out.reset_index(drop= True, inplace= True)
    return final_out


def calculate_group_overlap(
    df: pd.DataFrame, 
    str_col: str, 
    act_df: pd.DataFrame
) -> list[float]:
    """Calculates overlap percentages in subgroups.

    Args:
        df (pd.DataFrame): Dataframe with list of subgroups
        str_col (str): column with list of subgroups
        act_df (pd.DataFrame): Dataframe to get data of subgroups from

    Returns:
        list[float]: Overlaps for each subgroup in df
    """
    overlaps = []
    for i in range(len(df)):
        queries = df[str_col].values.tolist()
        a_query = queries.pop(i)
        a = set(act_df.query(a_query).index)
        queries = " or ".join(queries)
        b = set(act_df.query(queries).index)
        overlap = 1 - (len(a.union(b) - b) / len(b))
        overlaps.append(overlap)
    return overlaps


def get_score(
    df: pd.DataFrame, 
    overlap_col: str, 
    val_col: str
) -> pd.Series:
    """Generates a score for each subgroup

    Args:
        df (pd.DataFrame): Dataframe to use for subgroups
        overlap_col (str): column name which has percentage of overlaps
        val_col (str): value of subgroup

    Returns:
        pd.Series: scores for each subgroup
    """
    t_df = df.copy()
    t_df["inv_overlap"] = 1 - t_df[overlap_col]
    t_df["abs_val"] = t_df[val_col].abs()
    t_df["score"] = t_df["inv_overlap"] * t_df["abs_val"]
    return t_df["score"]


def calc_group_score(
    df: pd.DataFrame, 
    overlap_col: str, 
    score_col: str
) -> float:
    """Calculates scores for each group of subgroups

    Args:
        df (pd.DataFrame): Dataframe with all subgroups in group
        overlap_col (str): Column name which has overlap percentages
        score_col (str): Column name which has subgroup scores

    Returns:
        float: Score for the whole group
    """
    return df[score_col].abs().sum() - df[overlap_col].abs().sum() # incorporate minimizing others


def get_best_combo(
    df: pd.DataFrame, 
    str_col: str, 
    val_col: str, 
    act_df: pd.DataFrame, 
    N: int = 200, 
    K: int = 3, 
    overlap_col: str = "overlap", 
    score_col: str = "score"
) -> list:
    """Gets indices of all the possible groups of subgroups sorted by the group scores

    Args:
        df (pd.DataFrame): Dataframe with subgroups
        str_col (str): Column name for subgroup strings
        val_col (str): Column name for subgroup values
        act_df (pd.DataFrame): Actual dataframe with subgroup data
        N (int, optional): Max number of indices to consider. 
        Defaults to 200.
        K (int, optional): Number of subgroups in a group. 
        Defaults to 3.
        overlap_col (str, optional): Column name for overlap 
        percentages. Defaults to "overlap".
        score_col (str, optional): Column name for subgroup scores. 
        Defaults to "score".

    Returns:
        list: Each element contains indices of each subgroup in group 
        and list is sorted by highest to lowest score.
    """

    group_indices = list(range(K))
    start_index = K
    
    df[overlap_col] = np.nan
    df[score_col] = np.nan
    
    gscores = []
    
    while start_index < len(df) and start_index < N:
        
        overlap = calculate_group_overlap(df.iloc[group_indices], str_col, act_df)
        df[overlap_col].iloc[group_indices] = overlap
        
        scores = get_score(df.iloc[group_indices], overlap_col, val_col)
        df[score_col].iloc[group_indices] = scores
        
        gscores.append([deepcopy(group_indices), calc_group_score(df.iloc[group_indices], overlap_col, score_col)])
        
        rem_ind = df[score_col].iloc[group_indices].idxmin()
        
        group_indices.remove(rem_ind)
        
        group_indices.append(start_index)
        
        start_index += 1
        
    gscores.sort(reverse= False, key= lambda x: x[1])
    
    return gscores


def waterfall_plot_mpl(
    trans: pd.DataFrame, 
    col: str, 
    rot: int = 0
) -> plt.Axes:
    """Plots waterfall chart using matplotlib

    Args:
        trans (pd.DataFrame): Dataframe with waterfall data
        col (str): Column to use for values
        rot (int, optional): Rotation of labels along X axis. Defaults to 0.

    Returns:
        plt.Axes: axes with waterfall plotted
    """
    
    blank = trans[col].cumsum().shift(1).fillna(0)

    #Get the net total number for the final element in the waterfall
    total = trans.sum()[col]
    trans.loc["net"]= total
    blank.loc["net"] = total

    #The steps graphically show the levels as well as used for label placement
    step = blank.reset_index(drop=True).repeat(3).shift(-1)
    step[1::3] = np.nan

    #When plotting the last element, we want to show the full bar,
    #Set the blank to 0
    blank.loc["net"] = 0

    #Plot and label
    
    new_trans = trans.copy()
    
    new_trans["pos"] = new_trans[col]
    new_trans["neg"] = new_trans[col]
    new_trans.loc[new_trans["pos"] < 0, "pos"] = 0
    new_trans.loc[new_trans["neg"] > 0, "neg"] = 0
    new_trans.drop(col, axis= 1, inplace= True)
    
    
    my_plot = new_trans.plot(
        kind='bar', stacked=True, bottom=blank, 
        legend=None, figsize=(15, 5), rot= rot,
        color= {"pos": "green", "neg": "red"}
    )
    my_plot.plot(step.index, step.values,'k')

    y_min = min([step.values[2], *blank[1:-1], +step.values[-3]])*0.95
    y_max = max(blank+trans[col]) * 1.05

    plt.ylim([y_min, y_max])
    
    return my_plot


def get_waterfall_ylims(
    trans: pd.DataFrame, 
    col: str
) -> Tuple[float, float]:
    """Returns y limits for the Y axis of a waterfall plot

    Args:
        trans (pd.DataFrame): Dataframe to use
        col (str): Column name of values

    Returns:
        Tuple[float, float]: y_min, y_max
    """
    blank = trans[col].cumsum().shift(1).fillna(0)

    #Get the net total number for the final element in the waterfall
    total = trans.sum()[col]
    trans.loc["net"]= total
    blank.loc["net"] = total

    #The steps graphically show the levels as well as used for label placement
    step = blank.reset_index(drop=True).repeat(3).shift(-1)
    step[1::3] = np.nan

    #When plotting the last element, we want to show the full bar,
    #Set the blank to 0
    blank.loc["net"] = 0

    y_min = min([step.values[2], *blank[1:-1], +step.values[-3]])*0.95
    y_max = max(blank+trans[col]) * 1.05

    return y_min, y_max


def comb_sum(n: int, rs: list) -> int:
    """Returns summation of ncr for r in rs

    Args:
        n (int): n
        rs (list): list of r values

    Returns:
        int: summation of ncr for r in rs
    """
    sum_ = 0
    for r in rs:
        sum_ += comb(n, r)
    return sum_


def query_string_to_user_string(in_str: str) -> str:
    """Converts a pandas query string to user readable string

    Args:
        in_str (str): Pandas query string

    Returns:
        str: User readable string
    """
    try:
        final_out = []
        val_dict = {
            "==": "="
        }
        filters = in_str.split(" and ")
        for filt in filters:
            out = re.search(r"`([a-zA-Z0-9\s]+)`\s*([=<>]{1,2})\s*[\"]*([a-zA-Z0-9]+)[\"]*", filt)
            out = out.groups()
            final_out.append(" ".join([val_dict.get(i, i) for i in out]))
        return " & ".join(final_out)
    except Exception as e:
        print(e)
        return in_str

# vectorized function
query_string_to_user_string_vectorized = np.vectorize(query_string_to_user_string)


def get_waterfall_and_impact_table(
    d1: pd.DataFrame, 
    d2: pd.DataFrame, 
    dims: list, 
    metric: str, 
    n: list= None,
    agg: list= ["mean", "count"], 
    pop_overlap_threshold: int= 0.8,
    impact_overlap_threshold: int= 0.8,
    impact_base_threshold: int= 0.05,
    word_wrap_num: int= 15,
    debug: bool= False,
    plot_in_mpl= False
) -> dict:
    """Generate data for waterfall and impact calculation of subgroups

    Args:
        d1 (pd.DataFrame): Group 1 (baseline)
        d2 (pd.DataFrame): Group 2 (RCA/Focus)
        dims (list): List of dimensions
        metric (str): metric to use
        n (list, optional): List of number of dimensions to use 
        while grouping. Defaults to None.
        agg (list, optional): Aggregate against. Defaults to ["mean", "count"].
        pop_overlap_threshold (int, optional): Ignoring subpopulations 
        greater than this value. Defaults to 0.8.
        impact_overlap_threshold (int, optional): Ignoring impact values 
        less than this threshold. Defaults to 0.8.
        impact_base_threshold (int, optional): Impact must be greater 
        than this. Defaults to 0.05.
        word_wrap_num (int, optional): number to use for wordwrapping 
        user readable subgroup strings. Defaults to 15.
        debug (bool, optional): Print debug data. Defaults to False.
        plot_in_mpl (bool, optional): Plot using matplotlib. Defaults to False.

    Returns:
        dict: Dictionary with output data
    """

    if n == None:
        n = [*range(1, len(dims)+1)]

    l1 = d1[metric].count()
    l2 = d2[metric].count()

    df_subgroup_impact = get_subgroup_impacts(
        d1, 
        d2,
        dims,
        [metric],
        agg,
        n
    )

    if debug:
        display(df_subgroup_impact)

    prev_indices = set()
    t_out = pd.concat([d1, d2])
    
    if debug:
        display("Max indices:", len(t_out))

    current_comb = []
    current_comb_indices = []
    current_comb_filters = set()

    i = -1

    while i < len(df_subgroup_impact) - 1 and len(current_comb) <= 5:
        i += 1

        curr_filter_string = df_subgroup_impact.iloc[i]["string"]
        curr_filters = set(curr_filter_string.split(" and "))

        indices = set(t_out.query(curr_filter_string).index)
        new_indices = indices.union(prev_indices)
        rel_indices = new_indices - prev_indices

        curr_filters_exist_in_comb = reduce(
            lambda x, y: x or y, 
            [True if filter_ in current_comb_filters else False for filter_ in curr_filters]
        )

        if curr_filters_exist_in_comb:
            continue

        overlap_pop_perc = 1 - (len(rel_indices) / len(indices))

        if overlap_pop_perc > pop_overlap_threshold:
            continue


        t_df = t_out.loc[list(rel_indices)]

        t_d1 = pd.merge(t_df, d1, how= "inner")
        t_d2 = pd.merge(t_df, d2, how= "inner")

        p1 = t_d1[metric].mean() * t_d1[metric].count() / l1
        p2 = t_d2[metric].mean() * t_d2[metric].count() / l2

        p1 = 0 if np.isnan(p1) else p1
        p2 = 0 if np.isnan(p2) else p2
        non_overlap_impact = p2 - p1
        total_impact = df_subgroup_impact.iloc[i][metric + "_impact"] + 1e-10
        overlap_impact = abs(total_impact - non_overlap_impact) / total_impact
        
        if len(current_comb) > 0:
            max_overlap_impact_in_comb = max([abs(sg[2]) for sg in current_comb])
            if abs(non_overlap_impact) / max_overlap_impact_in_comb < impact_base_threshold:
                continue

        if overlap_impact < impact_overlap_threshold:
            if debug:
                display(i, len(rel_indices), p1, p2)

            current_comb.append([
                df_subgroup_impact.iloc[i]["string"], 
                df_subgroup_impact.iloc[i][metric + "_impact"], 
                non_overlap_impact, 
                len(indices), 
                len(rel_indices), 
                len(prev_indices)
            ])
            current_comb_indices.append(i)
            current_comb_filters = current_comb_filters.union(curr_filters)

            prev_indices = new_indices

        else:
            continue

    t_out = pd.DataFrame(
        current_comb, 
        index= current_comb_indices, 
        columns= [
            "string", "impact_full_group", "impact_non_overlap", 
            "indices in group", "non-overlap indices", "total unique indices in combination"
        ]
    )

    if debug:
        display(t_out)

    t_out = t_out[["string", "impact_non_overlap"]]

    act_sum = d2[metric].mean() - d1[metric].mean()
    our_sum = t_out["impact_non_overlap"].sum()
    t_out = t_out.append(
        {"string": "\"others\"", "impact_non_overlap": act_sum - our_sum}, 
        ignore_index= True
    )
    
    if debug:
        display(t_out)

    a = ["start"]
    t = ["\n".join(wrap(i, word_wrap_num)) for i in t_out["string"].values.tolist()]
    a.extend(t)
    t = [d1[metric].mean()]
    t.extend(t_out["impact_non_overlap"].values.tolist())

    if plot_in_mpl:
        ax = waterfall_plot_mpl(pd.DataFrame(data= {metric: t}, index= a), metric)
        plt.title(f"{metric} against {dims}")

    y_axis_lims = get_waterfall_ylims(pd.DataFrame(data= {metric: t}, index= a), metric)

    a = ["start"]
    # t = ["\n".join(wrap(i, word_wrap_num)) for i in t_out["string"].values.tolist()]
    a.extend(t_out["string"].values.tolist() + ["end"])
    t = [d1[metric].mean()]
    t.extend(t_out["impact_non_overlap"].values.tolist())
    t.append([d2[metric].mean()])
    t = t[0:1] + [sum(t[:i+1]) for i in range(1, len(t)-1)] + t[-1]
    js_df = pd.DataFrame(data= {
        "value": t, 
        "category": a,
        "stepValue": t
    })

    js_df["open"] = js_df["value"].shift(1, fill_value=0)
    js_df["displayValue"] = js_df["value"] - js_df["open"]

    js_df["color"] = ["#ff9eb7" if val <= 0 else "#72ddc3" for val in [0] + t_out["impact_non_overlap"].values.tolist() + [0]]

    js_df.loc[[0, len(js_df)-1], ["open", "color"]] = [[0, "#bbb"], [0, "#9cc7ff"]]

    if plot_in_mpl:
        display(js_df)
        plt.show()


    js_df["category"] = query_string_to_user_string_vectorized(js_df["category"])
    df_subgroup_impact["user_string"] = query_string_to_user_string_vectorized(df_subgroup_impact["string"])

    js_df = js_df.round(4)
    df_subgroup_impact = df_subgroup_impact.round(4)

    out_dict = {
        "chart": {
            "chart_data": js_df.to_dict("records"),
            "y_axis_lim": [round(i, 4) for i in y_axis_lims]
        },
        "data_table": df_subgroup_impact.to_dict("records")
    }

    return out_dict


if __name__ == "__main__":

    df = pd.read_csv("bank_cleaned_preprocessed.csv")
    df["date"] = pd.to_datetime(df["date"])

    out = get_waterfall_and_impact_table(
        df.query("20210501 <= date < 20210601"),
        df.query("20210601 <= date < 20210701"),
        ["job", "education", "marital", "housing", "loan"],
        "sum_conversion",
        n = [1, 2, 3],
        debug= False,
        plot_in_mpl= False
    )

    with open("tmp2.json", "w") as f:
        f.write(out)
