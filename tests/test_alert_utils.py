"""Tests utils functions pertaining to alerts."""

import pytest

from chaos_genius.alerts.utils import human_readable


@pytest.mark.parametrize(
    "value, expected",
    [
        (0.000005, "5.0µ"),
        (0.005, "5.0m"),
        (0, "0.0"),
        (5, "5.0"),
        (10.2, "10.2"),
        (1000, "1.0K"),
        (1500, "1.5K"),
        (504678, "504.678K"),
        (1000000, "1.0M"),
        (1050000, "1.05M"),
        (5678906785, "5.679B"),
        (1000000000000, "1.0T"),
        (15600000000000, "15.6T")
    ],
)
def test_human_readable_conversion(value, expected):
    """Converts value to human readable format and matches with the expected answer."""
    assert human_readable(value) == expected
