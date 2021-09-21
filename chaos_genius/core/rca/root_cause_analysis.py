"""Provides RootCauseAnalysis class for computing RCA."""

import warnings
from collections import OrderedDict
from itertools import combinations
from math import isclose
from textwrap import wrap
from typing import Dict, List, Tuple

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

from chaos_genius.core.utils.round import round_df, round_number

from .rca_utils.string_helpers import (convert_df_dims_to_query_strings,
                                       convert_query_string_to_user_string)
from .rca_utils.waterfall_utils import (get_best_subgroups_using_superset_algo,
                                        get_waterfall_ylims,
                                        waterfall_plot_mpl)

try:
    from IPython.display import display
except ModuleNotFoundError:
    display = print


SUPPORTED_AGGREGATIONS = ["mean", "sum", "count"]
EPSILON = 1e-8


class RootCauseAnalysis:
    def __init__(
        self,
        grp1_df: pd.DataFrame,
        grp2_df: pd.DataFrame,
        dims: List[str],
        metric: str,
        num_dim_combs: List[int] = None,
        agg: str = "mean",
        debug: bool = False,
        precision: int = 3,
    ) -> None:

        self._grp1_df = grp1_df
        self._grp2_df = grp2_df
        self._preprocess_rca_dfs()
        self._full_df = pd.concat([self._grp1_df, self._grp2_df])

        self._check_columns(dims)
        self._dims = dims

        self._check_columns(metric)
        self._metric = metric
        self._metric_is_cat = self._full_df[metric].dtype == object

        if agg not in SUPPORTED_AGGREGATIONS:
            raise ValueError(f"Aggregation {agg} is not supported.")
        self._agg = agg

        if num_dim_combs is None:
            num_dim_combs = list(range(1, len(dims) + 1))
        else:
            if (
                max(num_dim_combs) > len(self._dims)
                or min(num_dim_combs) < 1
            ):
                raise ValueError(f"n {num_dim_combs} is out of range.")
            if len(set(num_dim_combs)) != len(num_dim_combs):
                raise ValueError(f"n {num_dim_combs} has duplicates.")
            if len(num_dim_combs) > 4:
                warnings.warn(
                    "Passing more than 4 values for n will take a while."
                )
        self._num_dim_combs_to_consider = num_dim_combs

        self._debug = debug
        self._precision = precision

        self._impact_table = None
        self._waterfall_table = None

        self._max_waterfall_columns = 5
        self._max_subgroups_considered = 100

    def _initialize_impact_table(self):
        self._create_binned_columns()
        dim_combs_list = self._generate_all_dim_combinations()

        impacts = []
        for dim_comb in dim_combs_list:
            dim_comb_impact = self._compare_subgroups(dim_comb)
            impacts.append(dim_comb_impact)
        impact_table = pd.concat(impacts)

        # sort by absolute impact values
        impact_table = impact_table.sort_values(
            by="impact",
            ascending=False,
            key=lambda x: x.abs(),
            ignore_index=True
        )

        # add query string
        impact_table.loc[:, "string"] = impact_table[self._dims].apply(
            lambda inp: convert_df_dims_to_query_strings(inp),
            axis=1
        )

        # keeping only relevant features
        # impact_table.drop(self._dims, axis= 1, inplace= True)
        metric_columns = [
            "impact",
            "val_g1",
            "val_g2",
            "size_g1",
            "size_g2",
            "count_g1",
            "count_g2",
        ]
        impact_table = impact_table[["string"] + self._dims + metric_columns]

        return impact_table

    def _get_single_dim_impact_table(self, single_dim):

        if self._impact_table is None:
            self._impact_table = self._initialize_impact_table()

        impact_table = self._impact_table.copy()
        other_dims = set(self._dims)
        other_dims.remove(single_dim)
        impact_table = impact_table[
            (~impact_table[single_dim].isna())
            & (impact_table[other_dims].isna().sum(axis=1) == len(other_dims))
        ]

        impact_table = impact_table.reset_index(drop=True)

        return impact_table

    def _initialize_waterfall_table(self, single_dim=None):

        if self._impact_table is None:
            self._impact_table = self._initialize_impact_table()

        # get impact values
        if single_dim is not None:
            impact_table = self._get_single_dim_impact_table(single_dim)
        else:
            impact_table = self._impact_table.copy()

        # getting subgroups for waterfall
        best_subgroups = get_best_subgroups_using_superset_algo(
            impact_table,
            self._max_waterfall_columns,
            self._max_subgroups_considered
        )
        best_subgroups = best_subgroups[best_subgroups["ignored"] == False]  # noqa E712
        best_subgroups = best_subgroups.merge(
            impact_table[["string", "impact"]], how="inner", on="string"
        )
        best_subgroups["impact_non_overlap"] = best_subgroups["impact"]
        best_subgroups.rename(
            columns={"impact": "impact_full_group"}, inplace=True)
        best_subgroups[["indices_in_group", "non_overlap_indices"]] = 0

        # calculate overlap values
        best_subgroups = self._get_overlap_values_for_waterfall(best_subgroups)

        return best_subgroups

    def _preprocess_rca_dfs(self):
        """Preprocess dataframes for RCA Analysis."""
        self._grp1_df = self._grp1_df.reset_index(drop=True)
        self._grp2_df = self._grp2_df.reset_index(drop=True)
        self._grp2_df.index = self._grp2_df.index + len(self._grp1_df)

    def _check_columns(self, cols):
        if isinstance(cols, str):
            cols = [cols]
        for col in cols:
            if col not in self._full_df.columns:
                raise ValueError(f"Column {col} not in data.")

    def _create_binned_columns(self):
        non_cat_cols = self._full_df.dtypes[self._dims][
            self._full_df.dtypes[self._dims] != object
        ]

        for col in non_cat_cols.index:
            binned_values = pd.qcut(
                self._full_df[col], 4, duplicates="drop").astype(str)
            self._full_df[col] = binned_values

        self._grp1_df = self._full_df.loc[self._grp1_df.index]
        self._grp2_df = self._full_df.loc[self._grp2_df.index]

    def _generate_all_dim_combinations(self) -> List[List[str]]:
        """Create a dictionary of all possible combinations of dims.

        Returns:
            List[List[str]]: Returns a list of all possible subgroups
        """
        list_subgroups = []
        for i in self._num_dim_combs_to_consider:
            list_subgroups_of_level = list(map(
                list, combinations(self._dims, i)))
            list_subgroups.extend(list_subgroups_of_level)
        return list_subgroups

    def _calculate_subgroup_values(self, data, suffix):
        agg_name = self._agg + suffix
        count_name = "count" + suffix
        if self._agg == "mean":
            value_numerator = data[agg_name] * data[count_name]
            value_denominator = data[count_name].sum() + EPSILON
            value = value_numerator / value_denominator
        elif self._agg in ["sum", "count"]:
            value = data[agg_name]
        else:
            raise ValueError(f"Aggregation {self._agg} is not defined.")

        size = data[count_name] * 100 / (data[count_name].sum() + EPSILON)

        return value, size

    def _compare_subgroups(self, dim_comb: List[str]) -> pd.DataFrame:
        agg_list = [self._agg, "count"] if self._agg != "count" else ["count"]

        grp1_df = (
            self._grp1_df.groupby(dim_comb)[self._metric]
            .agg(agg_list).reset_index()
        )
        grp2_df = (
            self._grp2_df.groupby(dim_comb)[self._metric]
            .agg(agg_list).reset_index()
        )

        combined_df = grp1_df.merge(
            grp2_df, how="outer", on=dim_comb, suffixes=["_g1", "_g2"]
        ).fillna(0)

        for i, suffix in enumerate(["_g1", "_g2"]):
            agg_name = self._agg + suffix
            count_name = "count" + suffix

            if self._agg == "mean":
                value_numerator = combined_df[agg_name] \
                    * combined_df[count_name]
                value_denominator = combined_df[count_name].sum() + EPSILON
                value = value_numerator / value_denominator
            elif self._agg in ["sum", "count"]:
                value = combined_df[agg_name]
            else:
                raise ValueError(f"Aggregation {self._agg} is not defined.")

            combined_df["val" + suffix] = value
            combined_df["size" + suffix] = combined_df[count_name] * 100
            if i == 0:
                combined_df["size" + suffix] /= len(self._grp1_df) + EPSILON
            elif i == 1:
                combined_df["size" + suffix] /= len(self._grp2_df) + EPSILON

        combined_df["val_g1"], combined_df["size_g1"] \
            = self._calculate_subgroup_values(
                combined_df, "_g1"
            )
        combined_df["val_g2"], combined_df["size_g2"] \
            = self._calculate_subgroup_values(
                combined_df, "_g2"
            )

        combined_df["impact"] = combined_df["val_g2"] - combined_df["val_g1"]

        return combined_df

    def _get_overlap_values_for_waterfall(
        self,
        subgroups_df: pd.DataFrame,
    ):
        subgroups_df_output = subgroups_df.copy()
        len_d1 = self._grp1_df[self._metric].count()
        len_d2 = self._grp2_df[self._metric].count()

        for subgroup in subgroups_df_output["string"]:
            all_indices = set()

            # others are all subgroups minus the current subgroup
            other_subgroups = subgroups_df_output["string"].values.tolist()
            other_subgroups.remove(subgroup)
            other_combinations = {
                i: combinations(other_subgroups, i)
                for i in range(1, len(subgroups_df_output))
            }

            d1_idxs = set(self._grp1_df.query(subgroup).index)
            d2_idxs = set(self._grp2_df.query(subgroup).index)

            overlap_indices_count = 0

            for i in range(1, len(subgroups_df_output)):
                for combo in other_combinations[i]:
                    query = " and ".join(combo)
                    d1_combo = set(self._grp1_df.query(query).index)
                    d2_combo = set(self._grp2_df.query(query).index)
                    overlap_points_d1 = d1_idxs.intersection(d1_combo) \
                        - all_indices
                    overlap_points_d2 = d2_idxs.intersection(d2_combo) \
                        - all_indices

                    overlap_indices_count += len(overlap_points_d1) + len(
                        overlap_points_d2
                    )

                    t_d1 = self._grp1_df.loc[overlap_points_d1]
                    t_d2 = self._grp2_df.loc[overlap_points_d2]
                    if self._agg == "mean":
                        grp1_val = (
                            t_d1[self._metric].mean()
                            * t_d1[self._metric].count()
                            / len_d1
                        )
                        grp2_val = (
                            t_d2[self._metric].mean()
                            * t_d2[self._metric].count()
                            / len_d2
                        )
                    elif self._agg == "sum":
                        grp1_val = t_d1[self._metric].sum()
                        grp2_val = t_d2[self._metric].sum()
                    elif self._agg == "count":
                        grp1_val = t_d1[self._metric].count()
                        grp2_val = t_d2[self._metric].count()

                    overlap_impact = grp2_val - grp1_val
                    if np.isnan(overlap_impact):
                        overlap_impact = 0
                    curr_loc = subgroups_df_output[
                        subgroups_df_output["string"] == subgroup
                    ].index[0]

                    subgroups_df_output.loc[
                        curr_loc, "impact_non_overlap"
                    ] = subgroups_df_output.loc[
                        curr_loc, "impact_non_overlap"] - (
                        overlap_impact * len(combo) / (len(combo) + 1)
                    )

                    all_indices = all_indices.union(overlap_points_d1).union(
                        overlap_points_d2
                    )

            subgroups_df_output.loc[curr_loc, "indices_in_group"] \
                = len(d1_idxs) + len(d2_idxs)

            subgroups_df_output.loc[curr_loc, "non_overlap_indices"] = (
                len(d1_idxs) + len(d2_idxs) - overlap_indices_count
            )

        return subgroups_df_output

    def _get_waterfall_output_data(
        self,
        df_subgroups: pd.DataFrame,
        word_wrap_num: int,
        plot_in_mpl: bool,
    ) -> Tuple[Tuple[float, float], pd.DataFrame]:

        d1_agg = self._grp1_df[self._metric].agg(self._agg)
        d2_agg = self._grp2_df[self._metric].agg(self._agg)
        impact = d2_agg - d1_agg
        non_overlap_impact = df_subgroups["impact_non_overlap"].sum()

        waterfall_df = df_subgroups[["string", "impact_non_overlap"]].copy()
        others_impact = impact - non_overlap_impact
        # only if impact of others is not close to 0, we add it
        if not isclose(others_impact, 0, rel_tol=0.0001, abs_tol=EPSILON):
            waterfall_df = waterfall_df.append(
                {"string": "others", "impact_non_overlap": others_impact},
                ignore_index=True,
            )

        col_names_for_mpl = [
            "start",
            *[
                "\n".join(wrap(i, word_wrap_num))
                for i in waterfall_df["string"].values.tolist()
            ],
        ]
        col_values = [
            d1_agg,
            *waterfall_df["impact_non_overlap"].values.tolist()
        ]
        col_names_for_mpl.append("end")
        col_values.append(d2_agg)

        y_axis_lims = get_waterfall_ylims(
            pd.DataFrame(
                data={self._metric: col_values},
                index=col_names_for_mpl
            ),
            self._metric,
        )

        if plot_in_mpl:
            print("plot")
            waterfall_plot_mpl(
                pd.DataFrame(
                    data={self._metric: col_values},
                    index=col_names_for_mpl
                ),
                self._metric,
                y_axis_lims,
            )
            plt.show()

        # Calculate steps for each subgroup
        col_values = (
            col_values[0:1]
            + [sum(col_values[: i + 1]) for i in range(1, len(col_values) - 1)]
            + col_values[-1:]
        )

        js_df = pd.DataFrame(
            data={
                "value": col_values,
                "category": ["start"]
                + waterfall_df["string"].values.tolist()
                + ["end"],
                "stepValue": col_values,
            }
        )

        js_df["open"] = js_df["value"].shift(1, fill_value=0)

        js_df["color"] = [
            "#FA5252" if val <= 0 else "#05A677"
            for val in [0]
            + waterfall_df["impact_non_overlap"].values.tolist() + [0]
        ]

        js_df.loc[[0, len(js_df) - 1], ["open", "color"]] = [
            [0, "#778CA3"],
            [0, "#778CA3"],
        ]

        js_df["displayValue"] = js_df["value"] - js_df["open"]

        return y_axis_lims, js_df

    def _get_best_subgroups_waterfall(
        self,
        single_dim,
        max_waterfall_columns,
        max_subgroups_considered,
    ):
        recalc = False
        if (
            max_waterfall_columns is not None
            and max_waterfall_columns != self._max_waterfall_columns
        ):

            recalc = True
            self._max_waterfall_columns = max_waterfall_columns

        if (
            max_subgroups_considered is not None
            and max_subgroups_considered != self._max_subgroups_considered
        ):

            recalc = True
            self._max_subgroups_considered = max_subgroups_considered

        if single_dim is None:
            if self._waterfall_table is None or recalc:
                self._waterfall_table = self._initialize_waterfall_table(
                    single_dim)
            best_subgroups = self._waterfall_table.copy()
        else:
            best_subgroups = self._initialize_waterfall_table(single_dim)

        best_subgroups.drop("ignored", axis=1, inplace=True)

        return best_subgroups

    def get_panel_metrics(self) -> "OrderedDict[str, List[float]]":
        panel_metrics = []
        for data in [self._grp1_df, self._grp2_df]:
            len_data = len(data[self._metric])
            out_dict = OrderedDict()
            try:
                # numerical data
                if not self._metric_is_cat:
                    out_dict = OrderedDict(
                        {
                            "mean": data[self._metric].mean().item(),
                            "min": data[self._metric].min().item(),
                            "median": data[self._metric].median().item(),
                            "max": data[self._metric].max().item(),
                            "sum": data[self._metric].sum().item(),
                            "count": len_data,
                            "null_count": len_data
                            - data[self._metric].count().item(),
                        }
                    )
                # categorical data
                else:
                    out_dict = OrderedDict(
                        {
                            "count": len_data,
                            "null_count": len_data
                            - data[self._metric].count().item(),
                        }
                    )
                out_dict.move_to_end(self._agg, last=False)
            except Exception:  # noqa: B902
                pass
            panel_metrics.append(out_dict)

        d1_metrics, d2_metrics = panel_metrics

        panel_metrics = {
            "grp1_metrics": {
                k: round_number(v) for k, v in d1_metrics.items()},
            "grp2_metrics": {
                k: round_number(v) for k, v in d2_metrics.items()},
            "impact": OrderedDict(),
        }

        for metric in panel_metrics["grp1_metrics"].keys():
            metric_impact = d2_metrics[metric] - d1_metrics[metric]
            panel_metrics["impact"][metric] = round_number(metric_impact)

        return panel_metrics

    def get_impact_rows(self, single_dim=None) -> List[Dict[str, object]]:

        if self._impact_table is None:
            self._impact_table = self._initialize_impact_table()

        impact_table = self._impact_table.copy()

        if single_dim is not None:
            impact_table = impact_table[~impact_table[single_dim].isna()]
            impact_table = impact_table.reset_index(drop=True)

        impact_table.drop(self._dims, axis=1, inplace=True)

        impact_table["string"] = impact_table["string"].apply(
            convert_query_string_to_user_string
        )

        return round_df(impact_table).to_dict("records")

    def get_impact_rows_with_columns(
        self, single_dim=None
    ) -> Tuple[List[Dict[str, object]], List[Dict[str, str]]]:
        impact_table = self.get_impact_rows(single_dim)
        mapping = [
            ("subgroup", "Subgroup Name"),
            ("g1_count", "Prev Month Count"),
            ("g1_size", "Prev Month Size"),
            ("g2_count", "Current Month Count"),
            ("g2_size", "Current Month Size"),
            ("impact", "Impact"),
        ]
        if self._agg != "count":
            # insert before g1_count
            mapping.insert(1, ("g1_agg", "Prev Month Agg"))
            # insert before g2_count (but add 1 because of previous insertion)
            mapping.insert(3, ("g2_agg", "Current Month Agg"))

        mapping = [{"title": v, "field": k} for k, v in mapping]

        return impact_table, mapping

    def get_waterfall_table_rows(
        self,
        single_dim=None,
        max_waterfall_columns: int = None,  # defaults to 5 or last value
        max_subgroups_considered: int = None,  # defaults to 100 or last value
    ) -> Dict:

        best_subgroups = self._get_best_subgroups_waterfall(
            single_dim, max_waterfall_columns, max_subgroups_considered
        )

        best_subgroups["string"] = best_subgroups["string"].apply(
            convert_query_string_to_user_string
        )

        return round_df(best_subgroups).to_dict("records")

    def get_waterfall_plot_data(
        self,
        single_dim=None,
        plot_in_mpl: bool = False,
        word_wrap_num: int = 15,
        max_waterfall_columns: int = None,  # defaults to 5 or last value
        max_subgroups_considered: int = None,  # defaults to 100 or last value
    ) -> Tuple[Dict, List[float]]:

        best_subgroups = self._get_best_subgroups_waterfall(
            single_dim, max_waterfall_columns, max_subgroups_considered
        )

        # get waterfall chart data
        y_axis_lims, waterfall_df = self._get_waterfall_output_data(
            best_subgroups, word_wrap_num, plot_in_mpl
        )

        # convert query strings to user strings
        waterfall_df["category"] = waterfall_df["category"].apply(
            convert_query_string_to_user_string
        )

        return (
            round_df(waterfall_df).to_dict("records"),
            [round_number(i) for i in y_axis_lims],
        )

    def get_hierarchical_table(
        self,
        single_dim: str,
        max_depth: int = 3,
        max_children: int = 5,
        max_parents: int = 5,
    ) -> Dict:

        other_dims = self._dims[:]
        other_dims.remove(single_dim)

        impact_table = self._initialize_impact_table()
        impact_table["parentId"] = None
        # impact_table["id"] = impact_table.index
        impact_table["depth"] = None

        output_table = self._get_single_dim_impact_table(single_dim)

        output_table = output_table.iloc[:max_parents]

        output_table["depth"] = 1

        for depth in range(1, max_depth):
            parents = output_table[output_table["depth"] == depth]
            for index, row in parents.iterrows():
                string = row["string"]
                filters = string.split(" and ")
                children = impact_table
                for filter_string in filters:
                    children = children[
                        children["string"].str.contains(
                            filter_string, regex=False)
                    ]
                children = children[
                    children[other_dims].isna().sum(axis=1)
                    == len(other_dims) - depth
                ]
                children = children.iloc[:max_children]
                children["depth"] = depth + 1
                children["parentId"] = index
                output_table = output_table.append(children, ignore_index=True)

        output_table.drop(self._dims, axis=1, inplace=True)

        output_table = output_table.reset_index().rename(
            columns={"index": "id"})

        output_table["string"] = output_table["string"].apply(
            convert_query_string_to_user_string
        )

        return round_df(output_table).to_dict("records")
