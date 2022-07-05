"""Util functions for core components of Chaos Genius."""

import random
import string
from typing import Dict

import pandas as pd


def randomword(length: int) -> str:
    """Return a random word of specified length."""
    letters = string.ascii_lowercase
    return "".join(random.choice(letters) for _ in range(length))


def get_subgroup_from_df(df: pd.DataFrame, d: Dict[str, str]) -> pd.DataFrame:
    """Return the rows of a dataframe that match the given dictionary.

    dict must be of the form {column_name1: value1, column_name2: value2, ...}
    """
    return df[(df.loc[:, d.keys()] == d.values()).all(axis=1)]


def get_user_string_from_subgroup_dict(subgroup_dict: Dict[str, str]) -> str:
    """Return a user readable string from a subgroup dictionary.

    :param subgroup_dict: Dictionary of the form {col1: value1, col2: value2, ...}
    :type subgroup_dict: Dict[str, str]
    :return: User readable string
    :rtype: str
    """
    user_string = "".join(f"{key} = {value} & " for key, value in subgroup_dict.items())
    return user_string[:-3]
