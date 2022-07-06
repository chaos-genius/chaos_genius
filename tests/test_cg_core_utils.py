"""Tests for util functions in chaos_genius.core.utils.utils module."""

import pandas as pd

from chaos_genius.core.utils.utils import (
    get_subgroup_from_df,
    get_user_string_from_subgroup_dict,
)


def test_get_subgroup_from_df():
    """Tests for `get_subgroup_from_df`."""
    df = pd.DataFrame(
        columns=["sg1", "sg2", "m1"],
        data=[
            ["A1", "B1", 1],
            ["A1", "B2", 2],
            ["A2", "B2", 3],
            ["A2", "B1", 4],
            ["A1", "B1", 5],
            ["A1", "B2", 6],
            ["A2", "B2", 7],
            ["A2", "B1", 8],
        ]
    )

    subgroup = {"sg1": "A1"}
    actual_df_subgroup = df[df["sg1"] == "A1"]
    test_df_subgroup = get_subgroup_from_df(df, subgroup)
    assert (actual_df_subgroup == test_df_subgroup).all().all()

    subgroup = {"sg1": "A1", "sg2": "B2"}
    actual_df_subgroup = df[(df["sg1"] == "A1") & (df["sg2"] == "B2")]
    test_df_subgroup = get_subgroup_from_df(df, subgroup)
    assert (actual_df_subgroup == test_df_subgroup).all().all()


def test_get_user_string_from_subgroup_dict():
    """Tests for `get_user_string_from_subgroup_dict`."""
    subgroup = {"sg1": "A1"}
    assert "sg1 = A1" == get_user_string_from_subgroup_dict(subgroup)

    subgroup = {"sg1": "A1", "sg2": "B2"}
    assert "sg1 = A1 & sg2 = B2" == get_user_string_from_subgroup_dict(subgroup)
