"""Tests for time range generators."""

from datetime import date

from chaos_genius.core.rca.constants import TIME_RANGES_BY_KEY


def test_last_30_days():
    """Test last 30 days."""
    func = TIME_RANGES_BY_KEY["last_30_days"]["function"]

    base_start_date = date(2019, 12, 31)
    base_end_date = date(2020, 1, 30)
    rca_start_date = date(2020, 1, 31)
    rca_end_date = date(2020, 3, 1)

    output = func(rca_end_date)
    output == (
        (base_start_date, base_end_date),
        (rca_start_date, rca_end_date),
    )

    base_start_date = date(2020, 12, 31)
    base_end_date = date(2021, 1, 30)
    rca_start_date = date(2021, 1, 31)
    rca_end_date = date(2021, 3, 2)

    output = func(rca_end_date)
    output == (
        (base_start_date, base_end_date),
        (rca_start_date, rca_end_date),
    )


def test_last_7_days():
    """Test last 7 days."""
    func = TIME_RANGES_BY_KEY["last_7_days"]["function"]

    base_start_date = date(2020, 2, 15)
    base_end_date = date(2020, 2, 22)
    rca_start_date = date(2020, 2, 23)
    rca_end_date = date(2020, 3, 1)

    output = func(rca_end_date)
    output == (
        (base_start_date, base_end_date),
        (rca_start_date, rca_end_date),
    )

    base_start_date = date(2021, 2, 14)
    base_end_date = date(2021, 2, 21)
    rca_start_date = date(2020, 2, 22)
    rca_end_date = date(2021, 3, 1)

    output = func(rca_end_date)
    output == (
        (base_start_date, base_end_date),
        (rca_start_date, rca_end_date),
    )


def test_previous_day():
    """Test previous day."""
    func = TIME_RANGES_BY_KEY["previous_day"]["function"]

    start_date = date(2020, 2, 29)
    end_date = date(2020, 3, 1)

    output = func(end_date)
    assert output == ((start_date, start_date), (end_date, end_date))

    start_date = date(2021, 2, 28)
    end_date = date(2021, 3, 1)

    output = func(end_date)
    assert output == ((start_date, start_date), (end_date, end_date))


def test_month_on_month():
    """Test month on month."""
    func = TIME_RANGES_BY_KEY["month_on_month"]["function"]

    base_start_date = date(2020, 2, 1)
    base_end_date = date(2020, 2, 29)
    rca_start_date = date(2020, 3, 1)
    rca_end_date = date(2020, 3, 5)

    output = func(rca_end_date)
    assert output == (
        (base_start_date, base_end_date),
        (rca_start_date, rca_end_date),
    )

    base_start_date = date(2021, 2, 1)
    base_end_date = date(2021, 2, 28)
    rca_start_date = date(2021, 3, 1)
    rca_end_date = date(2021, 3, 5)

    output = func(rca_end_date)
    assert output == (
        (base_start_date, base_end_date),
        (rca_start_date, rca_end_date),
    )

    base_start_date = date(2020, 12, 1)
    base_end_date = date(2020, 12, 31)
    rca_start_date = date(2021, 1, 1)
    rca_end_date = date(2021, 1, 5)

    output = func(rca_end_date)
    assert output == (
        (base_start_date, base_end_date),
        (rca_start_date, rca_end_date),
    )


def test_month_to_date():
    """Test month to date."""
    func = TIME_RANGES_BY_KEY["month_to_date"]["function"]

    base_start_date = date(2020, 2, 1)
    base_end_date = date(2020, 2, 5)
    rca_start_date = date(2020, 3, 1)
    rca_end_date = date(2020, 3, 5)

    output = func(rca_end_date)
    assert output == (
        (base_start_date, base_end_date),
        (rca_start_date, rca_end_date),
    )

    base_start_date = date(2021, 2, 1)
    base_end_date = date(2021, 2, 28)
    rca_start_date = date(2021, 3, 1)
    rca_end_date = date(2021, 3, 29)

    output = func(rca_end_date)
    assert output == (
        (base_start_date, base_end_date),
        (rca_start_date, rca_end_date),
    )

    base_start_date = date(2021, 2, 1)
    base_end_date = date(2021, 2, 28)
    rca_start_date = date(2021, 3, 1)
    rca_end_date = date(2021, 3, 31)

    output = func(rca_end_date)
    assert output == (
        (base_start_date, base_end_date),
        (rca_start_date, rca_end_date),
    )

    base_start_date = date(2021, 4, 1)
    base_end_date = date(2021, 4, 30)
    rca_start_date = date(2021, 5, 1)
    rca_end_date = date(2021, 5, 31)

    output = func(rca_end_date)
    assert output == (
        (base_start_date, base_end_date),
        (rca_start_date, rca_end_date),
    )

    base_start_date = date(2020, 12, 1)
    base_end_date = date(2020, 12, 5)
    rca_start_date = date(2021, 1, 1)
    rca_end_date = date(2021, 1, 5)

    output = func(rca_end_date)
    assert output == (
        (base_start_date, base_end_date),
        (rca_start_date, rca_end_date),
    )


def test_week_on_week():
    """Test week on week."""
    func = TIME_RANGES_BY_KEY["week_on_week"]["function"]

    base_start_date = date(2020, 3, 2)
    base_end_date = date(2020, 3, 8)
    rca_start_date = date(2020, 3, 9)
    rca_end_date = date(2020, 3, 12)

    output = func(rca_end_date)
    assert output == (
        (base_start_date, base_end_date),
        (rca_start_date, rca_end_date),
    )

    base_start_date = date(2021, 3, 1)
    base_end_date = date(2021, 3, 7)
    rca_start_date = date(2021, 3, 8)
    rca_end_date = date(2021, 3, 12)

    output = func(rca_end_date)
    assert output == (
        (base_start_date, base_end_date),
        (rca_start_date, rca_end_date),
    )


def test_week_to_date():
    """Test week to date."""
    func = TIME_RANGES_BY_KEY["week_to_date"]["function"]

    base_start_date = date(2020, 2, 3)
    base_end_date = date(2020, 2, 5)
    rca_start_date = date(2020, 2, 10)
    rca_end_date = date(2020, 2, 12)

    output = func(rca_end_date)
    assert output == (
        (base_start_date, base_end_date),
        (rca_start_date, rca_end_date),
    )

    base_start_date = date(2021, 3, 1)
    base_end_date = date(2021, 3, 5)
    rca_start_date = date(2021, 3, 8)
    rca_end_date = date(2021, 3, 12)

    output = func(rca_end_date)
    assert output == (
        (base_start_date, base_end_date),
        (rca_start_date, rca_end_date),
    )


def test_quarter_on_quarter():
    """Test quarter on quarter."""
    func = TIME_RANGES_BY_KEY["quarter_on_quarter"]["function"]

    base_start_date = date(2020, 1, 1)
    base_end_date = date(2020, 3, 31)
    rca_start_date = date(2020, 4, 1)
    rca_end_date = date(2020, 4, 12)

    output = func(rca_end_date)
    assert output == (
        (base_start_date, base_end_date),
        (rca_start_date, rca_end_date),
    )

    base_start_date = date(2020, 10, 1)
    base_end_date = date(2020, 12, 31)
    rca_start_date = date(2021, 1, 1)
    rca_end_date = date(2021, 2, 12)

    output = func(rca_end_date)
    assert output == (
        (base_start_date, base_end_date),
        (rca_start_date, rca_end_date),
    )


def test_quarter_to_date():
    """Test quarter to date."""
    func = TIME_RANGES_BY_KEY["quarter_to_date"]["function"]

    base_start_date = date(2020, 1, 1)
    base_end_date = date(2020, 1, 12)
    rca_start_date = date(2020, 4, 1)
    rca_end_date = date(2020, 4, 12)

    output = func(rca_end_date)
    assert output == (
        (base_start_date, base_end_date),
        (rca_start_date, rca_end_date),
    )

    base_start_date = date(2020, 10, 1)
    base_end_date = date(2020, 11, 12)
    rca_start_date = date(2021, 1, 1)
    rca_end_date = date(2021, 2, 12)

    output = func(rca_end_date)
    assert output == (
        (base_start_date, base_end_date),
        (rca_start_date, rca_end_date),
    )

    base_start_date = date(2021, 1, 1)
    base_end_date = date(2021, 3, 31)
    rca_start_date = date(2021, 4, 1)
    rca_end_date = date(2021, 6, 30)

    output = func(rca_end_date)
    assert output == (
        (base_start_date, base_end_date),
        (rca_start_date, rca_end_date),
    )
