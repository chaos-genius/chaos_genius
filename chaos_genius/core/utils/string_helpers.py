"""Provides helper functions for string manipulations related to RCA."""

import re

import numpy as np
import pandas as pd

# TODO: Update docstrings to sphinx format


def _parse_single_col_for_query_string(col: str, value: str) -> str:
    return f'`{col}`=="{value}"'


def convert_df_dims_to_query_strings(inp: pd.DataFrame) -> str:
    """Convert all given dimensions in df into query strings.

    :param inp: Row of dataframe with dims
    :type inp: pd.DataFrame
    :return: converted query string
    :rtype: str
    """
    query_string_lists = []
    for col in inp.index.sort_values():
        val = inp[col]
        if val is not np.nan:
            query_string_lists.append(_parse_single_col_for_query_string(col, val))
    return " and ".join(query_string_lists)


def convert_query_string_to_user_string(in_str: str) -> str:
    """Convert a pandas query string to user readable string.

    :param in_str: Pandas query string
    :type in_str: str
    :return: User readable string
    :rtype: str
    """
    re_strs = [
        r"`(.+)`\s*([=<>]{1,2})\s*[\"]*([^\"]+)[\"]*",
        r"([+-]?\d*\.?\d+)\s([<=]{1,2})\s[`]{0,1}(.*?)[`]{0,1}\s"
        r"([<=]{1,2})\s([+-]?\d*\.?\d+)",
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
                out = out.groups()
                final_out.append(" ".join(val_dict.get(i, i) for i in out))
                break
            else:
                print(f"{filt} did not match any re strings.")
                final_out.append(filt)
        return " & ".join(final_out)
    except Exception:  # noqa: B902
        print(f"Could not convert {in_str} to user string.")
        return in_str
