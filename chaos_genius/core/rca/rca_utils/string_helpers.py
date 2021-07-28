"""Provides helper functions for string manipulations related to root cause analysis."""

import re
import numpy as np
from typing import Dict

# TODO: Update docstrings to sphinx format


def _parse_single_col_for_query_string(col: str, value: str, binned: bool) -> str:
    # matches expressions like [-0.01, 0.001) representing limits for
    # binned numbers
    binned_number_match = re.match(
        r"([\(\[]+)([+-]?\d*\.?\d+), ([+-]?\d*\.?\d+)([\)\]]+)", value
    )
    if binned_number_match and binned:
        groups = binned_number_match.groups()
        query_string = str(groups[1])
        query_string += " <= " if groups[0] == "[" else " < "
        query_string += f"`{col}`"
        query_string += " <= " if groups[3] == "]" else " < "
        query_string += str(groups[2])
    else:
        query_string = f"`{col}`==\"{value}\""
    return query_string


def convert_df_dims_to_query_strings(inp, binned_cols: Dict) -> str:
    """Converts all given dimensions in df into query strings

    Args:
        inp (pd.DataFrame): Row of dataframe with dims

    Returns:
        str: Query strings
    """

    query_string_lists = []
    for col, val in zip(inp.index, inp.values):
        if val is not np.nan:
            if col in binned_cols:
                query_string_lists.append(_parse_single_col_for_query_string(col, val, binned=True))
            else:
                query_string_lists.append(_parse_single_col_for_query_string(col, val, binned=False))
    return " and ".join(query_string_lists)


def convert_query_string_to_user_string(in_str: str) -> str:
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
                    final_out.append(
                        " ".join([val_dict.get(i, i) for i in out]))
                    break
            else:
                print(f"{filt} did not match any re strings.")
                final_out.append(filt)
        return " & ".join(final_out)
    except Exception:
        print(f"Could not convert {in_str} to user string.")
        return in_str
