"""Tests for RCA utilities."""

import pandas as pd

from chaos_genius.core.rca.rca_utils.string_helpers import (
    convert_df_dims_to_query_strings,
    convert_query_string_to_user_string,
)

# TODO: Add tests for binned values as well


def test_convert_df_dims_to_query_string():
    """Test function to convert df dimensions to query strings."""
    df = pd.DataFrame(
        [
            ["a", "b", "c"],
            ["d", "e", "f"],
        ],
        columns=["c1", "c2", "c3"],
        index=[0, 1],
    )

    strings = df.apply(lambda inp: convert_df_dims_to_query_strings(inp), axis=1)

    assert len(strings) == len(df)

    assert (
        strings
        == [
            '`c1`=="a" and `c2`=="b" and `c3`=="c"',
            '`c1`=="d" and `c2`=="e" and `c3`=="f"',
        ]
    ).all()


def test_convert_query_string_to_user_string():
    """Test function to convert query strings to user readable strings."""
    strings = [
        '`c1`=="a" and `c2`=="b" and `c3`=="c"',
        '`c1`=="d" and `c2`=="e" and `c3`=="f"',
    ]
    user_strings = list(map(convert_query_string_to_user_string, strings))

    assert user_strings == ["c1 = a & c2 = b & c3 = c", "c1 = d & c2 = e & c3 = f"]
