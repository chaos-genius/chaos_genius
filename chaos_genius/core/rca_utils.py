import time
import numpy as np
import pandas as pd
from itertools import combinations
from functools import reduce

def timeit_wrapper(func, *args, **kwargs):
    start = time.time()
    out = func(*args, **kwargs)
    return time.time()-start, out

# DIMENSIONS = ['Year', 'Month', 'APMC', 'Commodity', 'district_name', 'state_name']
# KPI_COLUMNS = ['arrivals_in_qtl', "modal_price"]
# KPI_COLUMNS = ["arrivals_in_qtl"]
# TIME_COLUMN = "date"
# TIME_FMT = "%Y-%m-%d"

# DIMENSIONS = ['locn','age','sex','inc','job']
# KPI_COLUMNS = ['sales']
# TIME_COLUMN = None
# TIME_FMT = None

DIMENSIONS = ['job', 'marital', 'education', 'housing', 'loan', 'total_calls', 'month']
KPI_COLUMNS = ['avg_duration']
TIME_COLUMN = "date"
TIME_FMT = "%Y-%m-%d"

RELEVANT_COLUMNS = [TIME_COLUMN, *DIMENSIONS, *KPI_COLUMNS] if TIME_COLUMN else [*DIMENSIONS, *KPI_COLUMNS]

METRIC_AGGREGATIONS = ["mean", "count"]

MIN_GROUP_SIZE = None
MIN_IMPACT = None
LEVEL_GROUPS = list(range(1, len(DIMENSIONS)))

# INPUT_FILE = "data/monthly_data_cmo_date_processed.csv"
# INPUT_FILE = "data/small-5.csv"
INPUT_FILE = "bank_preprocessed.csv"

def suffix(arr, string):
    return [i+string for i in arr]

def select_lt_reduce(df, cols, num):
    a = df[cols] < num
    out = a.apply(lambda x: reduce(np.logical_or,x), axis=1)
    return out

def load_data(
    inp_file: str, rel_cols: list, 
    time_col: str, time_fmt: str
) -> pd.DataFrame:
    """Load in a pandas dataframe from CSV File

    Args:
        inp_file (str): csv filename to load data from
        rel_cols (list): list of columns to extract from dataframe
        time_col (str): col which has timestamps
        time_fmt (str): format of timestamps in data

    Returns:
        pd.DataFrame: Returns loaded dataframe with parsed time and 
            only the relevant columns
    """ 
    df = pd.read_csv(inp_file)
    df = df[rel_cols]
    if time_col:
        df[time_col] = pd.to_datetime(df[time_col], format=time_fmt, exact= True)
        df.set_index(time_col, drop= True, inplace= True)
    return df

def create_list_tuples(dims: list, n: list) -> dict[int: list]:
    """Creates a dictionary of all possible combinations of dims. 

    Args:
        dims (list): Columns to group
        n (list): levels of grouping to perform

    Returns:
        dict[int: list]: Returns dictionary with level of grouping 
            mapped to all possible groups
    """ 
    out = dict()
    for i in n:
        out[i] = list(map(list, combinations(dims, i)))
    return out

def get_total_unique_metrics(
    df: pd.DataFrame, dims: list, metrics: list
) -> int:
    """Returns total unique metrics needed to be analyzed

    Args:
        df (pd.DataFrame): Dataframe to use
        dims (list): List of dimensions in dataset
        metrics (list): List of metrics in dataset

    Returns:
        int: total number of unique metrics
    """
    total_metrics = len(metrics)
    for col in dims:
        total_metrics *= len(df[col].unique())
    return total_metrics 

def gen_sub_pop(df: pd.DataFrame, dims, metrics, agg, min_group_size= None, min_impact= None):
    means = df[metrics].mean()
    counts = df[metrics].count()

    metric_col_names = {
        "mean": suffix(metrics, "_mean"),
        "count": suffix(metrics, "_count"),
        "size": suffix(metrics, "_size"),
        "impact": suffix(metrics, "_impact")
    }

    pd_aggs = {
        i+"_"+j: pd.NamedAgg(column= i, aggfunc= j) for i in metrics for j in agg
    }

    df_stats = df.groupby(dims).agg(agg)

    df_stats.columns = df_stats.columns.map('_'.join)
    df_stats.columns = df_stats.columns.get_level_values(0)
    df_stats = df_stats.reset_index()

    df_stats[metric_col_names["size"]] = \
            df_stats[metric_col_names["count"]].values / counts.values * 100

    if min_group_size:
        df_stats.drop(
            df_stats.index[select_lt_reduce(
                df_stats, metric_col_names["size"], min_group_size
            )],
            inplace= True
        )

    if df_stats.empty:
        df_stats[metric_col_names["impact"]] = None
    else:
        df_stats[metric_col_names["impact"]] = \
                (df_stats[metric_col_names["mean"]].values - means.values) \
                * df_stats[metric_col_names["size"]]

        if min_impact:
            df_stats.drop(
                df_stats.index[select_lt_reduce(
                    df_stats, metric_col_names["impact"], min_impact
                )],
                inplace= True
            )

    df_stats.drop(metric_col_names["count"]+metric_col_names["mean"], axis= 1, inplace= True)

    return df_stats

def generate_all_groups(df: pd.DataFrame, dims, metrics, agg, n: list, min_group_size= None, min_impact= None):
    list_tuples = create_list_tuples(dims, n)
    list_tuples = [i for k, items in list_tuples.items() for i in items if k in n]

    first_subgroup = list_tuples.pop(0)
    df_impact = gen_sub_pop(df, first_subgroup, metrics, agg, min_group_size, min_impact)

    for subgroup in list_tuples:
        df_impact = df_impact.append(gen_sub_pop(
            df, subgroup, metrics, agg, min_group_size, min_impact
        ))

    df_impact[[i+"_abs_impact" for i in metrics]] = \
        df_impact[[i+"_impact" for i in metrics]].abs()
    df_impact.sort_values(
        by=[i+"_abs_impact" for i in metrics], 
        ascending= False, inplace= True
    )
    df_impact = df_impact.reset_index(drop= True).round(2)
    df_impact = df_impact.drop(columns=[i+"_abs_impact" for i in metrics])
    df_impact = df_impact.rename(columns={
        k: v for k, v in zip([i+"_impact" for i in metrics], [i+"_rel_impact" for i in metrics])
    })
    return df_impact

def group_comparison(df: pd.DataFrame, g1_selector: str, g2_selector: str, dims, metrics, agg):
    
    def col_name_mapper(x):
        return "_".join(x) if not "" in x else "".join(x)

    suffixes = ["_g1", "_g2"]

    g1 = df.query(g1_selector).groupby(dims)
    g1 = g1.agg({metric: agg for metric in metrics}).reset_index()
    g1.columns = g1.columns.map(col_name_mapper)
    g1.columns = g1.columns.get_level_values(0)
    g2 = df.query(g2_selector).groupby(dims).agg({metric: agg for metric in metrics}).reset_index()
    g2.columns = g2.columns.map(col_name_mapper)
    g2.columns = g2.columns.get_level_values(0)

    out = g1.merge(g2, how="outer", on=dims, suffixes= suffixes).fillna(0)


    m_col_names = {
        "mean": {j: [i+"_mean"+j for i in metrics] for j in suffixes},
        "count": {j: [i+"_count"+j for i in metrics] for j in suffixes},
        "val": {j: [i+"_val"+j for i in metrics] for j in suffixes},
        "impact": [i+"_impact" for i in metrics]
    }

    # print(out)


    # print(out[m_col_names["mean"]["_g1"]] * out[m_col_names["count"]["_g1"]])

    for i in range(len(metrics)):
        out[m_col_names["val"]["_g1"][i]] = \
            out[m_col_names["mean"]["_g1"][i]] * out[m_col_names["count"]["_g1"][i]] \
            / (out[m_col_names["count"]["_g1"][i]].sum() + 1e-5)

        out[m_col_names["val"]["_g2"][i]] = \
            out[m_col_names["mean"]["_g2"][i]] * out[m_col_names["count"]["_g2"][i]] \
            / (out[m_col_names["count"]["_g2"][i]].sum() + 1e-5)

        out[m_col_names["impact"][i]] = \
            out[m_col_names["val"]["_g2"][i]] - out[m_col_names["val"]["_g1"][i]]

    rem_list = []
    # for suffix, list_ in m_col_names["mean"].items():
    #     rem_list += list_
    # for suffix, list_ in m_col_names["count"].items():
    #     rem_list += list_

    out.drop(rem_list, axis= 1, inplace= True)

    return out

def group_comparison_all_subgroups(
    df: pd.DataFrame, 
    g1_selector: str, 
    g2_selector: str, 
    dims: list, 
    metrics: list, 
    agg: list, 
    n: list
) -> pd.DataFrame:
    """Performs comparison across all subgroups.

    Args:
        df (pd.DataFrame): Dataframe to use
        g1_selector (str): Selector for group 1 (baseline)
        g2_selector (str): Selector for group 2 (RCA/focus group)
        dims (list): Dimensions to use
        metrics (list): Metrics to compute for
        agg (list): Aggregations to apply (currently pass only ["mean", "count"])
        n (list): List of number of dimensions to use as a subgroup 

    Returns:
        pd.DataFrame: Dataframe which has the output
    """

    non_cat_cols = df.dtypes[dims][df.dtypes[dims] != object]
    
    new_df = df.copy()
    new_dims = dims[:]
    
    for col in non_cat_cols.index:
        new_dims.remove(col)
        a = pd.qcut(df[col], 4, duplicates= "drop").astype(str)
        new_df[col+"_binned"] = a
        new_dims.append(col+"_binned")

    df = new_df
    dims = new_dims

    def col_name_mapper(x):
        return "_".join(x) if not "" in x else "".join(x)

    suffixes = ["_g1", "_g2"]

    m_col_names = {
        "mean": {j: [i+"_mean"+j for i in metrics] for j in suffixes},
        "count": {j: [i+"_count"+j for i in metrics] for j in suffixes},
        "val": {j: [i+"_val"+j for i in metrics] for j in suffixes},
        "impact": [i+"_impact" for i in metrics],
        "size": {j: [i+"_size"+j for i in metrics] for j in suffixes}
    }

    def compare(d1: pd.DataFrame, d2: pd.DataFrame, dims, metrics, agg):
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
            out[m_col_names["val"]["_g1"][i]] = \
                out[m_col_names["mean"]["_g1"][i]] * out[m_col_names["count"]["_g1"][i]] \
                / (out[m_col_names["count"]["_g1"][i]].sum() + 1e-5)

            out[m_col_names["val"]["_g2"][i]] = \
                out[m_col_names["mean"]["_g2"][i]] * out[m_col_names["count"]["_g2"][i]] \
                / (out[m_col_names["count"]["_g2"][i]].sum() + 1e-5)

            out[m_col_names["size"]["_g1"][i]] = \
                out[m_col_names["count"]["_g1"][i]] * 100 / (out[m_col_names["count"]["_g1"][i]].sum() + 1e-5)
            
            out[m_col_names["size"]["_g2"][i]] = \
                out[m_col_names["count"]["_g2"][i]] * 100 / (out[m_col_names["count"]["_g2"][i]].sum() + 1e-5)

            out[m_col_names["impact"][i]] = \
                out[m_col_names["val"]["_g2"][i]] - out[m_col_names["val"]["_g1"][i]]

        # rem_list = []
        # for suffix, list_ in m_col_names["mean"].items():
        #     rem_list += list_
        # for suffix, list_ in m_col_names["count"].items():
        #     rem_list += list_

        # out.drop(rem_list, axis= 1, inplace= True)

        return out

    d1 = df.query(g1_selector)
    d2 = df.query(g2_selector)

    list_tuples = create_list_tuples(dims, n)
    list_tuples = [i for k, items in list_tuples.items() for i in items if k in n]

    first_subgroup = list_tuples.pop(0)
    df_impact = compare(d1, d2, first_subgroup, metrics, agg)

    for subgroup in list_tuples:
        df_impact = df_impact.append(compare(
            d1, d2, subgroup, metrics, agg
        ))

    return df_impact


def main():
    df = load_data(INPUT_FILE, RELEVANT_COLUMNS, TIME_COLUMN, TIME_FMT)
    
    num_uni_metrics = get_total_unique_metrics(df, DIMENSIONS, KPI_COLUMNS)
    print("Unique metrics:", num_uni_metrics)

    start = time.time()

    out = generate_all_groups(
        df, DIMENSIONS, KPI_COLUMNS, METRIC_AGGREGATIONS,
        LEVEL_GROUPS, MIN_GROUP_SIZE, MIN_IMPACT)

    print("Time for baseline calculations:", time.time() - start)

    print("Baseline")
    print(out)

    start = time.time()

    out = group_comparison_all_subgroups(
        df, 
        '`marital` == "divorced"',
        '`marital` == "married"',
        ["total_calls", "month"],
        ["avg_duration"],
        METRIC_AGGREGATIONS,
        [2]
    )

    print("Time for group calculations:",time.time() - start)

    out.to_csv("out.csv", index= None)
    print(out)

if __name__ == "__main__":
    main()