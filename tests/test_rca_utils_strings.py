"""Tests for RCA utilities."""

import pandas as pd

from chaos_genius.core.utils.string_helpers import (
    convert_df_dims_to_query_strings,
    convert_query_string_to_user_string,
    get_query_from_col_and_value,
    get_query_from_cols_and_values
)

# TODO: Add tests for binned values as well

def test_get_query_from_col_and_value():
    """Test function to get query string."""
    values = [
        (("a", "b"), "`a`==\"b\""),
        (("\"a\"", "\"b\""), "`\\\"a\\\"`==\"\\\"b\\\"\"")
    ]

    for (col, val), output in values:
        assert get_query_from_col_and_value(col, val) == output


def test_get_query_from_cols_and_values():
    """Test function to get query strings."""
    dimensions = ["a", "\"a\""]
    subgroups = [
        "b",
        ("c", "\"c\"")
    ]
    output = [
        "`a`==\"b\"",
        "`a`==\"c\" and `\\\"a\\\"`==\"\\\"c\\\"\""
    ]

    assert get_query_from_cols_and_values(dimensions, subgroups) == output


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
