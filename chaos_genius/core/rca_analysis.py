import re
import json
from functools import reduce
from itertools import combinations
from math import comb
from textwrap import wrap
from typing import Dict, List, Tuple

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

try:
    from IPython.display import display
except ModuleNotFoundError:
    display = print


def rca_preprocessor(
    d1: pd.DataFrame, 
    d2: pd.DataFrame
) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """Preprocesses dataframes for RCA Analysis

    Args:
        d1 (pd.DataFrame): Baseline Group
        d2 (pd.DataFrame): Focus/RCA Group

    Returns:
        Tuple[pd.DataFrame, pd.DataFrame]: Proccessed DataFrames
    """
    d1 = d1.reset_index(drop= True)
    d2 = d2.reset_index(drop= True)
    d2.index = d2.index + len(d1)
    return d1, d2


def col_name_mapper(x):
    return "_".join(x) if not "" in x else "".join(x)


def create_list_tuples(dims: List[str], n: List[int]) -> Dict[int, List[str]]:
    """Creates a dictionary of all possible combinations of dims. 

    Args:
        dims (list[str]): Columns to group
        n (list[int]): levels of grouping to perform

    Returns:
        dict[int: list[str]]: Returns dictionary with level of grouping 
            mapped to all possible groups
    """

    out = dict()
    for i in n:
        out[i] = list(map(list, combinations(dims, i)))
    return out


def compare_subgroups(
    d1: pd.DataFrame,
    d2: pd.DataFrame,
    dims: List[str],
    metrics: List[str],
    m_col_names: Dict[str, Dict[str, List[str]]],
    suffixes: List[str],
    agg: str = "mean"
) -> pd.DataFrame:
    """Compares 2 subgroups based on metrics

    Args:
        d1 (pd.DataFrame): Subgroup 1 (baseline)
        d2 (pd.DataFrame): Subgroup 2 (RCA/focus group)
        dims (list[str]): Dimensions to use
        metrics (list[str]): Metrics to compute for
        m_col_names (dict[str): Column names to use (highly specific)
        suffixes (list[str]): Suffixes for groups (highly specific)
        agg (str): Aggregation method. Defaults to "mean".

    Returns:
        pd.DataFrame: Dataframe with cols 'val', 'size' and 'impact' to 
            show impact calculations of both subgroups
    """

    agg_list = [agg] + ["count"]

    d1_out = d1.groupby(dims)
    d1_out = d1_out.agg({metric: agg_list for metric in metrics}).reset_index()
    d1_out.columns = d1_out.columns.map(col_name_mapper)
    d1_out.columns = d1_out.columns.get_level_values(0)

    d2_out = d2.groupby(dims)
    d2_out = d2_out.agg({metric: agg_list for metric in metrics}).reset_index()
    d2_out.columns = d2_out.columns.map(col_name_mapper)
    d2_out.columns = d2_out.columns.get_level_values(0)

    out = d1_out.merge(d2_out, how="outer", on=dims,
                       suffixes=suffixes).fillna(0)

    for i in range(len(metrics)):
        if agg == "mean":
            out[m_col_names["val"]["_g1"][i]] = \
                out[m_col_names["mean"]["_g1"][i]] \
                * out[m_col_names["count"]["_g1"][i]] \
                / (out[m_col_names["count"]["_g1"][i]].sum() + 1e-5)

            out[m_col_names["val"]["_g2"][i]] = \
                out[m_col_names["mean"]["_g2"][i]] \
                * out[m_col_names["count"]["_g2"][i]] \
                / (out[m_col_names["count"]["_g2"][i]].sum() + 1e-5)

        elif agg == "sum":
            out[m_col_names["val"]["_g1"][i]] = \
                out[m_col_names["sum"]["_g1"][i]] 

            out[m_col_names["val"]["_g2"][i]] = \
                out[m_col_names["sum"]["_g2"][i]] 
        
        out[m_col_names["size"]["_g1"][i]] = \
                out[m_col_names["count"]["_g1"][i]] * 100 \
                / (out[m_col_names["count"]["_g1"][i]].sum() + 1e-5)

        out[m_col_names["size"]["_g2"][i]] = \
            out[m_col_names["count"]["_g2"][i]] * 100 \
            / (out[m_col_names["count"]["_g2"][i]].sum() + 1e-5)

        out[m_col_names["impact"][i]] = \
            out[m_col_names["val"]["_g2"][i]] - \
            out[m_col_names["val"]["_g1"][i]]


    return out


def group_comparison_across_subgroups(
    d1: pd.DataFrame,
    d2: pd.DataFrame,
    dims: List[str],
    metrics: List[str],
    n: List[int],
    agg: str = "mean"
) -> pd.DataFrame:
    """Performs comparison across all subgroups.

    Args:
        d1 (pd.DataFrame): Group 1 (baseline)
        d2 (pd.DataFrame): Group 2 (RCA/focus group)
        dims (list[str]): Dimensions to use
        metrics (list[str]): Metrics to compute for
        n (list[int]): List of number of dimensions to use as a subgroup 
        agg (str): Aggregation to apply. "mean" or "sum" can be used.
        Defaults to "mean".

    Returns:
        pd.DataFrame: Dataframe which has the output
    """

    # aggregations to use
    agglist = [agg] +  ["count"]

    # create bins for any numerical dimensions
    non_cat_cols = d1.dtypes[dims][d1.dtypes[dims] != object]

    full_df = pd.concat([d1, d2])
    new_dims = dims[:]
    binned_cols = dict()

    for col in non_cat_cols.index:
        new_dims.remove(col)
        a = pd.qcut(full_df[col], 4, duplicates="drop").astype(str)
        full_df[col+"_binned"] = a
        new_dims.append(col+"_binned")
        binned_cols[col+"_binned"] = col

    d1 = full_df.loc[d1.index]
    d2 = full_df.loc[d2.index]

    dims = new_dims

    # generate all column names
    suffixes = ["_g1", "_g2"]
    m_col_names = {
        agg: {j: [i+f"_{agg}"+j for i in metrics] for j in suffixes},
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
        metrics, m_col_names, suffixes, agg= agg
    )

    for subgroup in list_tuples:
        df_impact = df_impact.append(compare_subgroups(
            d1, d2, subgroup, metrics, m_col_names, suffixes, agg= agg
        ))

    df_impact = df_impact.rename(columns= binned_cols)

    return df_impact


def get_subgroup_impacts(
    d1: pd.DataFrame,
    d2: pd.DataFrame,
    dims: List[str],
    metrics: List[str],
    agg: str = "mean",
    n: List[int] = None
) -> pd.DataFrame:
    """Gets impacts of subgroups of levels in n for d1 and d2 across 
    dims for metrics.

    Args:
        d1 (pd.DataFrame): Group 1 (Base Group)
        d2 (pd.DataFrame): Group 2 (RCA/Focus Group)
        dims (list[str]): Dimensions ot create subgroups from
        metrics (list[str]): Metrics to use
        agg (str): Metric aggregation to apply. 
        Defaults to "mean".
        n (list[int]): Level of subgroups to use. Defaults to None.

    Returns:
        pd.DataFrame: Dataframe with sizes, contributions and impact 
        values for each subgroup
    """

    if n is None:
        n = list(range(1, len(dims)+1))

    final_out = group_comparison_across_subgroups(
        d1, d2, dims, metrics, n, agg= agg
    )

    # sort by absolute impact values
    final_out[[i + "_abs_impact" for i in metrics]] = \
        final_out[[i + "_impact" for i in metrics]].abs()
    final_out = final_out.sort_values(
        [i + "_abs_impact" for i in metrics], ascending=False
    ).drop([i + "_abs_impact" for i in metrics], axis=1)

    final_out.reset_index(drop=True, inplace=True)
    return final_out


def convert_df_dims_to_query_strings(
    df: pd.DataFrame,
    dims: List[str]
) -> list:
    """Converts all given dimensions in df into query strings

    Args:
        df (pd.DataFrame): Dataframe with dims
        dims (List[str]): List of dimensions to use

    Returns:
        pd.Series: Query strings
    """
    
    def parse_dim_values_for_query_string(col: str, value: str) -> str:
        out = re.match(
            "([\(\[]+)([+-]?\d*\.?\d+), ([+-]?\d*\.?\d+)([\)\]]+)", value
        )
        if out:
            groups = out.groups()
            out_str = str(groups[1])
            out_str += " <= " if groups[0] == "[" else " < "
            out_str += f"`{col}`"
            out_str += " <= " if groups[3] == "]" else " < "
            out_str += str(groups[2])
            return out_str
        else:
            return f"`{col}`==\"{value}\""
            

    def conv(inp):
        query_string_lists = [
            parse_dim_values_for_query_string(col, val) for col, val in \
            zip(inp.index, inp.values) if val is not np.nan
        ]
        return " and ".join(query_string_lists)

    return list(
        map(lambda x: conv(x[1]), df[dims].iterrows())
    )


def calculate_group_overlap(
    df: pd.DataFrame,
    str_col: str,
    act_df: pd.DataFrame
) -> List[float]:
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

    # incorporate minimizing others
    return df[score_col].abs().sum() - df[overlap_col].abs().sum()


def get_best_combo(
    df_subgroups: pd.DataFrame,
    whole_df: pd.DataFrame,
    d1: pd.DataFrame,
    d2: pd.DataFrame,
    metric: str,
    agg: str = "mean",
    K: int = 5,
    max_subgroups_considered: int = 100,
    pop_overlap_threshold: int = 0.8,
    impact_overlap_threshold: int = 0.8,
    impact_base_threshold: int = 0.05,
    debug= False
) -> pd.DataFrame:
    """Returns best combination of subgroups for waterfall.

    Args:
        df_subgroups (pd.DataFrame): Dataframe with subgroups
        whole_df (pd.DataFrame): Dataframe which is a merge of d1 and d2
        d1 (pd.DataFrame): Group 1 (Baseline)
        d2 (pd.DataFrame): Group 2 (Focus/RCA)
        metric (str): Column name of the metric.
        agg (str, optional): Aggregation to use. Defaults to "mean".
        K (int, optional): Max subgroups in waterfall. Defaults to 5.
        max_subgroups_considered (int, optional): Max subgroups to
        consider for waterfall. Defaults to 100.
        pop_overlap_threshold (int, optional): Max subgroup overlap 
        percentage allowed. Defaults to 0.8.
        impact_overlap_threshold (int, optional): Max value of impact 
        caused by impact allowed. Defaults to 0.8.
        impact_base_threshold (int, optional): Min impact of subgroup. 
        Defaults to 0.05.
        debug (bool, optional): Whether to print debug values. 
        Defaults to False.

    Returns:
        pd.DataFrame: Dataframe with the best combination of subgroups 
        and non overlap impact values
    """

    l1 = d1[metric].count()
    l2 = d2[metric].count()

    prev_indices = set()
    current_comb = []
    current_comb_indices = []
    current_comb_filters = set()
    i = -1

    while i < len(df_subgroups) - 1 and i < max_subgroups_considered \
        and len(current_comb) <= K:

        i += 1

        curr_filter_string = df_subgroups.iloc[i]["string"]

        indices = set(whole_df.query(curr_filter_string).index)
        new_indices = indices.union(prev_indices)
        non_overlap_indices = new_indices - prev_indices

        # check if filters of subgroup are already 
        # in current combination.
        curr_filters = set(curr_filter_string.split(" and "))
        list_filter_in_current_filters = [
            True if filter_ in current_comb_filters else False \
            for filter_ in curr_filters
        ]
        curr_filters_exist_in_comb = reduce(
            lambda x, y: x or y,
            list_filter_in_current_filters
        )
        if curr_filters_exist_in_comb:
            continue

        # check if overlap of subgroup with whole combination is greater
        # than the threshold. 
        overlap_pop_perc = 1 - (len(non_overlap_indices) / len(indices))
        if overlap_pop_perc > pop_overlap_threshold:
            continue

        t_df = whole_df.loc[list(non_overlap_indices)]

        t_d1 = pd.merge(t_df, d1, how="inner")
        t_d2 = pd.merge(t_df, d2, how="inner")

        if agg == "mean":
            p1 = t_d1[metric].mean() * t_d1[metric].count() / l1
            p2 = t_d2[metric].mean() * t_d2[metric].count() / l2
        elif agg == "sum":
            p1 = t_d1[metric].sum()
            p2 = t_d2[metric].sum()
        else:
            raise ValueError(f"Currently supported values of agg are 'mean' " \
                + f"and 'sum'. The value given was {agg}.")

        p1 = 0 if np.isnan(p1) else p1
        p2 = 0 if np.isnan(p2) else p2
        non_overlap_impact = p2 - p1
        total_impact = df_subgroups.iloc[i][metric + "_impact"] + 1e-10
        overlap_impact = abs(total_impact - non_overlap_impact) / total_impact

        # check if percentage of overlapping impact of subgroup is not 
        # smaller than a threshold value
        if len(current_comb) > 0:
            max_overlap_impact_in_comb = max(
                [abs(sg[2]) for sg in current_comb]
            )

            impact_perc = abs(non_overlap_impact) / max_overlap_impact_in_comb
            if impact_perc < impact_base_threshold:
                continue
        
        # check if impact of subgroup is not smaller than a threshold
        # percentage of the highest impact subgroup
        if overlap_impact < impact_overlap_threshold:
            if debug:
                display(i, len(non_overlap_indices), p1, p2)

            current_comb.append([
                df_subgroups.iloc[i]["string"],
                df_subgroups.iloc[i][metric + "_impact"],
                non_overlap_impact,
                len(indices),
                len(non_overlap_indices),
                len(prev_indices)
            ])
            current_comb_indices.append(i)
            current_comb_filters = current_comb_filters.union(curr_filters)

            prev_indices = new_indices

        else:
            continue

    return pd.DataFrame(
        current_comb,
        index=current_comb_indices,
        columns=[
            "string", "impact_full_group", "impact_non_overlap",
            "indices in group", "non-overlap indices",
            "total unique indices in combination"
        ]
    )


def waterfall_plot_mpl(
    trans: pd.DataFrame,
    col: str,
    rot: int = 0
) -> plt.Axes:
    """Plots waterfall chart using matplotlib

    Args:
        trans (pd.DataFrame): Dataframe with waterfall data
        col (str): Column to use for values
        rot (int, optional): Rotation of labels along X axis. 
        Defaults to 0.

    Returns:
        plt.Axes: axes with waterfall plotted
    """

    blank = trans[col].cumsum().shift(1).fillna(0)

    # Get the net total number for the final element in the waterfall
    total = trans.sum()[col]
    trans.loc["net"] = total
    blank.loc["net"] = total

    # The steps graphically show the levels 
    # as well as used for label placement
    step = blank.reset_index(drop=True).repeat(3).shift(-1)
    step[1::3] = np.nan

    # When plotting the last element, we want to show the full bar,
    # Set the blank to 0
    blank.loc["net"] = 0

    #Plot and label

    new_trans = trans.copy()

    new_trans["pos"] = new_trans[col]
    new_trans["neg"] = new_trans[col]
    new_trans.loc[new_trans["pos"] < 0, "pos"] = 0
    new_trans.loc[new_trans["neg"] > 0, "neg"] = 0
    new_trans.drop(col, axis=1, inplace=True)

    my_plot = new_trans.plot(
        kind='bar', stacked=True, bottom=blank,
        legend=None, figsize=(15, 5), rot=rot,
        color={"pos": "green", "neg": "red"}
    )
    my_plot.plot(step.index, step.values, 'k')

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

    # Get the net total number for the final element in the waterfall
    total = trans.sum()[col]
    trans.loc["net"] = total
    blank.loc["net"] = total

    # The steps graphically show the levels as well 
    # as used for label placement
    step = blank.reset_index(drop=True).repeat(3).shift(-1)
    step[1::3] = np.nan

    # When plotting the last element, we want to show the full bar,
    # Set the blank to 0
    blank.loc["net"] = 0

    y_min = min([step.values[2], *blank[1:-1], +step.values[-3]])*0.95
    y_max = max(blank+trans[col]) * 1.05

    return y_min, y_max


def comb_sum(n: int, rs: List[int]) -> int:
    """Returns summation of ncr for r in rs

    Args:
        n (int): n
        rs (list[int]): list of r values

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

    re_strs = [
        r"`(.+)`\s*([=<>]{1,2})\s*[\"]*([^\"]+)[\"]*",
        r"([+-]?\d*\.?\d+)\s([<=]{1,2})\s[`]{0,1}(.*?)[`]{0,1}\s([<=]{1,2})\s([+-]?\d*\.?\d+)"
    ]

    try:
        final_out = []
        val_dict = {
            "==": "=",
            "<": "<",
            "<=": "<=",
        }
        filters = in_str.split(" and ")
        for filt in filters:
            if filt in ["start", "end"]:
                final_out.append(filt)
                continue

            for re_str in re_strs:
                out = re.match(re_str, filt)
                if out is None:
                    continue
                else:
                    out = out.groups()
                    final_out.append(" ".join([val_dict.get(i, i) for i in out]))
                    break
            else:
                print(f"{filt} did not match any re strings.")
                final_out.append(filt)
        return " & ".join(final_out)
    except Exception as e:
        print(f"Could not convert {in_str} to user string.")
        return in_str


def get_waterfall_output_data(
    subgroup_df: pd.DataFrame,
    metric: str,
    d1_agg: float,
    d2_agg: float,
    word_wrap_num: int= 15,
    plot_in_mpl: bool= False,
) -> Tuple[Tuple[float, float], pd.DataFrame]:
    """Returns y_axis limits for waterfall as well as the data for 
    plotting the waterfall

    Args:
        waterfall_df (pd.DataFrame): Input data
        metric (str): metric to use
        d1_agg (float): Aggregated value of Group 1 (Baseline)
        d2_agg (float): Aggregated value of Group 2 (Focus/RCA)
        word_wrap_num (int, optional): Wrap words when plotting in 
        matplotlib. Defaults to 15.
        plot_in_mpl (bool, optional): Show output in matplotlib. 
        Defaults to False.

    Returns:
        Tuple[Tuple[float, float], pd.DataFrame]: y_axis limits, data
    """

    a = ["start"]
    t = ["\n".join(wrap(i, word_wrap_num))
         for i in subgroup_df["string"].values.tolist()]
    a.extend(t)
    t = [d1_agg]
    t.extend(subgroup_df["impact_non_overlap"].values.tolist())

    if plot_in_mpl:
        print("plot")
        ax = waterfall_plot_mpl(pd.DataFrame(
            data={metric: t}, index=a), metric)

    y_axis_lims = get_waterfall_ylims(
        pd.DataFrame(data={metric: t}, index=a), metric)

    a = ["start"]
    a.extend(subgroup_df["string"].values.tolist() + ["end"])
    t = [d1_agg]
    t.extend(subgroup_df["impact_non_overlap"].values.tolist())
    t.append([d2_agg])
    t = t[0:1] + [sum(t[:i+1]) for i in range(1, len(t)-1)] + t[-1]
    js_df = pd.DataFrame(data={
        "value": t,
        "category": a,
        "stepValue": t
    })

    js_df["open"] = js_df["value"].shift(1, fill_value=0)

    js_df["color"] = [
        "#ff9eb7" if val <= 0 else "#72ddc3" for val in \
        [0] + subgroup_df["impact_non_overlap"].values.tolist() + [0]
    ]

    js_df.loc[[0, len(js_df)-1], ["open", "color"]] = [
        [0, "#bbb"],
        [0, "#9cc7ff"]
    ]

    js_df["displayValue"] = js_df["value"] - js_df["open"]

    if plot_in_mpl:
        print("plot")
        display(js_df)
        plt.show()

    return y_axis_lims, js_df


def get_group_metrics(
    df: pd.DataFrame,
    metric: str,
    precision: int = 3
) -> Dict:
    """Gets basic metrics for a df

    Args:
        df (pd.DataFrame): Dataframe to use
        metric (str): Metric to compute for
        precision (int, optional): Return values rounded to specific 
        decimals. Defaults to 3.

    Returns:
        Dict: Dict with relevant metrics
    """
    out_dict = {
        "mean": df[metric].mean().item(),
        "median": df[metric].median().item(),
        "count": len(df[metric]),
        "not_null_count": df[metric].count().item(),
        "sum": df[metric].sum().item()
    }
    out_dict = {i: round(j, precision) for i, j in out_dict.items()}

    return out_dict


def get_rca_group_panel_metrics(
    d1: pd.DataFrame,
    d2: pd.DataFrame,
    metric: str,
    agg: str = "mean",
    precision: int = 3
) -> Dict:
    """Gets metrics for both groups

    Args:
        d1 (pd.DataFrame): Baseline group
        d2 (pd.DataFrame): Focus/RCA group
        metric (str): Metric to compute for
        agg (str, optional): Aggregation to use. Defaults to "mean".
        precision (int, optional): Return values rounded to specific 
        decimals. Defaults to 3.

    Returns:
        Dict: Dict with impact and metrics of both groups
    """
    g1 = get_group_metrics(d1, metric, precision= precision)
    g2 = get_group_metrics(d2, metric, precision= precision)
    out_dict = {
        "impact": g2[agg] - g1[agg],
        "g1_metrics": g1,
        "g2_metrics": g2
    }
    return out_dict


def get_waterfall_and_impact_table_single_dim(
    d1: pd.DataFrame,
    d2: pd.DataFrame,
    main_dim: str,
    dims: List[str],
    metric: str,
    agg: str = "mean",
    K: int = 5,
    n: List[int] = None,
    word_wrap_num: int = 15,
    debug: bool = False,
    plot_in_mpl: bool = False,
    precision: int = 3
) -> Dict:
    """Generate data for waterfall and impact calculation of subgroups 
    for a single dimension.

    Methodology:
        Calculates all possible subgroup impacts (without overlap) and
        then searches through the list of subgroups for the best 
        combination without any overlap in its subgroups while
        having a large impact. 

    Args:
        d1 (pd.DataFrame): Group 1 (baseline)
        d2 (pd.DataFrame): Group 2 (RCA/Focus)
        main_dim (str): Single dim
        dims (list[str]): List of dimensions
        metric (str): metric to use
        agg (str, optional): Aggregation to use. Defaults to "mean".
        K (int): Max subgroups in waterfall. Defaults to 5.
        n (list[int], optional): List of number of dimensions to use 
        while grouping. Defaults to None.
        word_wrap_num (int, optional): number to use for wordwrapping 
        user readable subgroup strings. Defaults to 15.
        debug (bool, optional): Print debug data. Defaults to False.
        plot_in_mpl (bool, optional): Plot using matplotlib. 
        Defaults to False.
        precision (int, optional): Return values rounded to specific 
        decimals. Defaults to 3.

    Returns:
        dict: Dictionary with output data
    """

    if n == None:
        n = [*range(1, len(dims)+1)]

    # get sorted impacts of all subgroups
    df_subgroup_impact = get_single_dim_impact(
        d1,
        d2,
        main_dim,
        dims,
        metric,
        N= None,
        n= n,
        agg= agg
    )

    # convert dims to query_strings
    df_subgroup_impact["string"] = convert_df_dims_to_query_strings(
        df_subgroup_impact,
        dims + [main_dim]
    )

    # keep only relevant columns
    df_subgroup_impact.drop(dims, axis= 1, inplace= True)
    metric_columns = [
        f"{metric}_impact", f"{metric}_size_g1", f"{metric}_size_g2", 
        f"{metric}_val_g1", f"{metric}_val_g2", f"{metric}_{agg}_g1", 
        f"{metric}_{agg}_g2", f"{metric}_count_g1", f"{metric}_count_g2"
    ]
    df_subgroup_impact = df_subgroup_impact[
        ["string"] + metric_columns
    ]

    if debug:
        display(df_subgroup_impact)

    whole_df = pd.concat([d1, d2])

    if debug:
        display("Max indices:", len(whole_df))

    # Get subgroups for waterfall plot
    best_subgroup_combo_df = get_subgroup_impacts(
        d1,
        d2,
        [main_dim],
        [metric],
        agg = agg,
        n = [1]
    )
    best_subgroup_combo_df = best_subgroup_combo_df.reset_index(drop= True).iloc[:K]
    best_subgroup_combo_df["string"] = convert_df_dims_to_query_strings(
        best_subgroup_combo_df,
        [main_dim]
    )

    if debug:
        display(best_subgroup_combo_df)

    # filter out relevant data for waterfall
    best_subgroup_combo_df = best_subgroup_combo_df[["string", f"{metric}_impact"]]
    best_subgroup_combo_df_short = best_subgroup_combo_df.rename(columns={f"{metric}_impact": "impact_non_overlap"})
    

    act_sum = d2[metric].agg(agg) - d1[metric].agg(agg)
    our_sum = best_subgroup_combo_df_short["impact_non_overlap"].sum()

    if round(act_sum - our_sum, precision) != 0:
        best_subgroup_combo_df_short = best_subgroup_combo_df_short.append(
            {"string": "others", "impact_non_overlap": act_sum - our_sum},
            ignore_index=True
        )

    if debug:
        display(best_subgroup_combo_df_short)

    # yaxis limits and waterfall data
    y_axis_lims, waterfall_df = get_waterfall_output_data(
        best_subgroup_combo_df_short,
        metric,
        d1[metric].agg(agg),
        d2[metric].agg(agg),
        word_wrap_num,
        plot_in_mpl
    )

    df_subgroup_impact["string"] = \
        df_subgroup_impact["string"].apply(query_string_to_user_string)

    waterfall_df["category"] = \
        waterfall_df["category"].apply(query_string_to_user_string)

    best_subgroup_combo_df["string"] = \
        best_subgroup_combo_df["string"].apply(query_string_to_user_string)

    waterfall_df = waterfall_df.round(precision)
    best_subgroup_combo_df = best_subgroup_combo_df.round(precision)
    df_subgroup_impact = df_subgroup_impact.round(precision)

    out_dict = {
        "chart": {
            "chart_data": waterfall_df.to_dict("records"),
            "y_axis_lim": [round(i, precision) for i in y_axis_lims],
            "chart_table": best_subgroup_combo_df.to_dict("records")
        },
        "data_table": df_subgroup_impact.to_dict("records")
    }

    return out_dict


def get_waterfall_and_impact_table(
    d1: pd.DataFrame,
    d2: pd.DataFrame,
    dims: List[str],
    metric: str,
    K: int = 5,
    n: List[int] = None,
    agg: str = "mean",
    max_subgroups_considered: int = 100,
    pop_overlap_threshold: int = 0.8,
    impact_overlap_threshold: int = 0.8,
    impact_base_threshold: int = 0.05,
    word_wrap_num: int = 15,
    debug: bool = False,
    plot_in_mpl: bool = False,
    precision: int = 3
) -> Dict:
    """Generate data for waterfall and impact calculation of subgroups.

    Methodology:
        Calculates all possible subgroup impacts (without overlap) and
        then searches through the list of subgroups for the best 
        combination without any overlap in its subgroups while
        having a large impact. 

    Args:
        d1 (pd.DataFrame): Group 1 (baseline)
        d2 (pd.DataFrame): Group 2 (RCA/Focus)
        dims (list[str]): List of dimensions
        metric (str): metric to use
        K (int): Max subgroups in waterfall. Defaults to 5.
        n (list[int], optional): List of number of dimensions to use 
        while grouping. Defaults to None.
        agg (str, optional): Aggregation function. Defaults to "mean".
        max_subgroups_considered (int, optional): Max subgroups to
        consider for waterfall. Defaults to 100.
        pop_overlap_threshold (int, optional): Ignoring subpopulations 
        greater than this value. Defaults to 0.8.
        impact_overlap_threshold (int, optional): Ignoring impact values 
        less than this threshold. Defaults to 0.8.
        impact_base_threshold (int, optional): Impact must be greater 
        than this. Defaults to 0.05.
        word_wrap_num (int, optional): number to use for wordwrapping 
        user readable subgroup strings. Defaults to 15.
        debug (bool, optional): Print debug data. Defaults to False.
        plot_in_mpl (bool, optional): Plot using matplotlib. 
        Defaults to False.
        precision (int, optional): Return values rounded to specific 
        decimals. Defaults to 3.

    Returns:
        dict: Dictionary with output data
    """

    if n == None:
        n = [*range(1, len(dims)+1)]

    # get sorted impacts of all subgroups
    df_subgroup_impact = get_subgroup_impacts(
        d1,
        d2,
        dims,
        [metric],
        agg,
        n
    )

    # convert dims to query_strings
    df_subgroup_impact["string"] = convert_df_dims_to_query_strings(
        df_subgroup_impact,
        dims
    )

    # keep only relevant columns
    df_subgroup_impact.drop(dims, axis= 1, inplace= True)
    metric_columns = [
        f"{metric}_impact", f"{metric}_size_g1", f"{metric}_size_g2", 
        f"{metric}_val_g1", f"{metric}_val_g2", f"{metric}_{agg}_g1", 
        f"{metric}_{agg}_g2"
    ]
    df_subgroup_impact = df_subgroup_impact[
        ["string"] + metric_columns
    ]

    if debug:
        display(df_subgroup_impact)

    whole_df = pd.concat([d1, d2])

    if debug:
        display("Max indices:", len(whole_df))

    # Get best subgroups for waterfall plot
    best_subgroup_combo_df = get_best_combo(
        df_subgroup_impact,
        whole_df,
        d1, d2,
        metric,
        agg,
        K,
        max_subgroups_considered,
        pop_overlap_threshold,
        impact_overlap_threshold,
        impact_base_threshold,
        debug
    )

    if debug:
        display(best_subgroup_combo_df)

    # filter out relevant data for waterfall
    best_subgroup_combo_df_short = best_subgroup_combo_df[["string", "impact_non_overlap"]]

    act_sum = d2[metric].agg(agg) - d1[metric].agg(agg)
    our_sum = best_subgroup_combo_df_short["impact_non_overlap"].sum()
    best_subgroup_combo_df_short = best_subgroup_combo_df_short.append(
        {"string": "others", "impact_non_overlap": act_sum - our_sum},
        ignore_index=True
    )

    if debug:
        display(best_subgroup_combo_df_short)

    # yaxis limits and waterfall data
    y_axis_lims, waterfall_df = get_waterfall_output_data(
        best_subgroup_combo_df_short,
        metric,
        d1[metric].agg(agg),
        d2[metric].agg(agg),
        word_wrap_num,
        plot_in_mpl
    )

    df_subgroup_impact["string"] = \
        df_subgroup_impact["string"].apply(query_string_to_user_string)

    waterfall_df["category"] = \
        waterfall_df["category"].apply(query_string_to_user_string)

    best_subgroup_combo_df["string"] = \
        best_subgroup_combo_df["string"].apply(query_string_to_user_string)

    waterfall_df = waterfall_df.round(precision)
    best_subgroup_combo_df = best_subgroup_combo_df.round(precision)
    df_subgroup_impact = df_subgroup_impact.round(precision)

    out_dict = {
        "chart": {
            "chart_data": waterfall_df.to_dict("records"),
            "y_axis_lim": [round(i, precision) for i in y_axis_lims],
            "chart_table": best_subgroup_combo_df.to_dict("records")
        },
        "data_table": df_subgroup_impact.to_dict("records")
    }

    return out_dict


def get_single_dim_impact(
    d1: pd.DataFrame,
    d2: pd.DataFrame,
    main_dim: str,
    dims: List[str],
    metric: str,
    N: int = 5,
    n: List[int] = None,
    agg: str = "mean"
) -> pd.DataFrame:
    """Gets Impact Values for subgroups across a single dimension

    Args:
        d1 (pd.DataFrame): Group 1 (baseline)
        d2 (pd.DataFrame): Group 2 (RCA/Focus)
        main_dim (str): Main dimensions
        dims (list[str]): List of dimensions
        metric (str): metric to use
        N (int, optional): Number of rows to return. Defaults to 5.
        n (List[int], optional): Subgroups dimensions to use.
        agg (str, optional): Aggregation function. Defaults to "mean".

    Returns:
        pd.DataFrame: Dataframe with impact values
    """
    df_impact = get_subgroup_impacts(
        d1, d2, [main_dim]+dims, [metric], n= n, agg= agg
    )

    df_impact = df_impact[~df_impact[main_dim].isna()]
    df_impact = df_impact.reset_index(drop= True)

    if N is not None:
        df_impact = df_impact.iloc[:N]

    return df_impact

def get_hierarchical_table(
    d1: pd.DataFrame,
    d2: pd.DataFrame,
    main_dim: str,
    dims: List[str],
    metric: str,
    agg: str = "mean",
    max_subpopulations: int = 5,
    get_full_subpop_name: bool = True,
    precision: int = 3
) -> Dict:
    """Gets the hierarchichal table data for a dimension with its 
    subgroups.

    Args:
        d1 (pd.DataFrame): Baseline group
        d2 (pd.DataFrame): Focus/RCA group
        main_dim (str): First dimension to use
        dims (List[str]): Dimensions in order to consider for subgroups
        metric (str): Metric to compute for
        agg (str, optional): Aggregation to apply on metric. 
        Defaults to "mean".
        max_subpopulations (int, optional): Max subpopulations to 
        return. Defaults to 5.
        get_full_subpop_name (bool, optional): Use full name of group 
        or only subgroup's name. Defaults to True.
        precision (int, optional): Decimal precision of output. 
        Defaults to 3.

    Returns:
        Dict: Rows of data
    """

    all_dims = [main_dim] + dims
    df_impact = None
    
    for i in range(1, len(all_dims)+1):
        if df_impact is None:
            t_df = get_subgroup_impacts(
                d1, d2, all_dims[:i], [metric], n=[i], agg= agg
            )
            t_df["parentId"] = np.nan
            t_df["string"] = convert_df_dims_to_query_strings(t_df, all_dims[:i])
            df_impact = t_df
        else:
            prev_strings = list(zip(
                range(len(df_impact) - len(t_df), len(df_impact)),
                convert_df_dims_to_query_strings(t_df, all_dims[:i-1])
            ))
            t_df = get_subgroup_impacts(
                d1, d2, all_dims[:i], [metric], n=[i], agg= agg
            )
            
            def sorting_func(x):
                y = x.copy()
                y[f"{metric}_abs_impact"] = y[f"{metric}_impact"]
                y = y.sort_values(f"{metric}_abs_impact").drop(f"{metric}_abs_impact", axis= 1)
                return y.reset_index(drop= True).iloc[:max_subpopulations]
            
            t_df = t_df.groupby(all_dims[:i-1]).apply(sorting_func).reset_index(drop= True)
            t_df["parentId"] = None
            t_df["string"] = convert_df_dims_to_query_strings(t_df, all_dims[:i])
        
            for idx, prev_string in prev_strings:
                indexes = t_df["string"].str.contains(prev_string)
                t_df.loc[indexes, "parentId"] = idx
            t_df.dropna(subset=["parentId"], inplace= True)
            
            # for when you don't want the full string in hierarchial data
            if not get_full_subpop_name:
                t_df["string"] = convert_df_dims_to_query_strings(t_df, all_dims[i-1:i])
            
            df_impact = df_impact.append(t_df, ignore_index= True)
    
    df_impact = df_impact.reset_index().rename(columns={"index": "id"})
    df_impact = df_impact.drop(all_dims, axis= 1)
    df_impact = df_impact.round(precision)
    df_impact["string"] = df_impact["string"].apply(query_string_to_user_string)
    return df_impact.to_dict(orient= "records")

if __name__ == "__main__":

    df = pd.read_csv("bank_cleaned_preprocessed.csv")
    df["date"] = pd.to_datetime(df["date"])

    out = get_waterfall_and_impact_table(
        df.query("20210501 <= date < 20210601"),
        df.query("20210601 <= date < 20210701"),
        ["job", "education", "marital", "housing", "loan"],
        "sum_conversion",
        n=[1, 2, 3],
        debug=True,
        plot_in_mpl=True
    )

    with open("tmp2.json", "w") as f:
        f.write(json.dumps(out, indent= 4))

    out = get_single_dim_impact(
        df.query("20210501 <= date < 20210601"),
        df.query("20210601 <= date < 20210701"),
        "education",
        ["marital", "housing", "loan"],
        "sum_conversion"
    )

    out["string"] = convert_df_dims_to_query_strings(out, ["education", "marital", "housing", "loan"])
    out["string"] = out["string"].apply(query_string_to_user_string)

    out = out[["string", "sum_conversion_impact"]]

    display(out)