"""Functions to get dates for various time ranges in RCA."""

import calendar
from datetime import date, timedelta
from typing import Tuple


def get_dates_for_last_30_days(
    end_date: date,
) -> Tuple[Tuple[date, date], Tuple[date, date]]:
    """Returns dates for running RCA on the last 30 days.

    The first tuple contains t-60, t-30.
    The second tuple contains t-30, t.
    """
    start_date = end_date - timedelta(days=60)
    mid_date = end_date - timedelta(days=30)

    return (start_date, mid_date), (mid_date, end_date)


def get_dates_for_last_7_days(
    end_date: date,
) -> Tuple[Tuple[date, date], Tuple[date, date]]:
    """Returns dates for running RCA on the last 7 days.

    The first tuple contains t-14, t-7.
    The second tuple contains t-7, t.
    """
    start_date = end_date - timedelta(days=14)
    mid_date = end_date - timedelta(days=7)

    return (start_date, mid_date), (mid_date, end_date)


def get_dates_for_previous_day(
    end_date: date,
) -> Tuple[Tuple[date, date], Tuple[date, date]]:
    """Returns dates for running RCA on the previous day.

    The first tuple contains t-2, t-1.
    The second tuple contains t-1, t.
    """
    start_date = end_date - timedelta(days=2)
    mid_date = end_date - timedelta(days=1)

    return (start_date, mid_date), (mid_date, end_date)


def get_dates_for_month_on_month(
    end_date: date,
) -> Tuple[Tuple[date, date], Tuple[date, date]]:
    """Returns dates for running RCA on the month on month.

    The first tuple contains start of prev month, end of prev month.
    The second tuple contains start of current month, t.
    """
    base_start_date = end_date.replace(month=end_date.month - 1, day=1)
    base_end_date = end_date.replace(day=1) - timedelta(days=1)

    rca_start_date = end_date.replace(day=1)

    return (base_start_date, base_end_date), (rca_start_date, end_date)


def get_dates_for_month_to_date(
    end_date: date,
) -> Tuple[Tuple[date, date], Tuple[date, date]]:
    """Returns dates for running RCA on the month to date.

    The first tuple contains start of prev month, date in prev month where date = t.
    The second tuple contains start of current month, t.
    """
    base_start_date = end_date.replace(month=end_date.month - 1, day=1)
    try:
        base_end_date = base_start_date.replace(day=end_date.day)
    except ValueError as e:
        if base_start_date.month == 2 and end_date.day >= 29:
            if calendar.isleap(base_start_date.year):
                base_end_date = base_start_date.replace(day=29)
            else:
                base_end_date = base_start_date.replace(day=28)
        elif end_date.day == 31 and base_start_date.month in [4, 6, 9, 11]:
            base_end_date = base_start_date.replace(day=30)
        else:
            raise e

    rca_start_date = end_date.replace(day=1)

    return (base_start_date, base_end_date), (rca_start_date, end_date)


def get_dates_for_week_on_week(
    end_date: date,
) -> Tuple[Tuple[date, date], Tuple[date, date]]:
    """Returns dates for running RCA on the week on week.

    The first tuple contains start of prev week, end of prev week.
    The second tuple contains start of current week, t.
    """
    end_date_weekday = end_date.weekday()

    base_start_date = end_date - timedelta(days=6 + end_date_weekday + 1)
    base_end_date = base_start_date + timedelta(days=6)

    rca_start_date = end_date - timedelta(days=end_date_weekday)

    return (base_start_date, base_end_date), (rca_start_date, end_date)


def get_dates_for_week_to_date(
    end_date: date,
) -> Tuple[Tuple[date, date], Tuple[date, date]]:
    """Returns dates for running RCA on the week to date.

    The first tuple contains start of prev week, date in prev week where date = t.
    The second tuple contains start of current week, t.
    """
    end_date_weekday = end_date.weekday()

    base_start_date = end_date - timedelta(days=6 + end_date_weekday + 1)
    base_end_date = base_start_date + timedelta(days=end_date_weekday)

    rca_start_date = end_date - timedelta(days=end_date_weekday)

    return (base_start_date, base_end_date), (rca_start_date, end_date)
