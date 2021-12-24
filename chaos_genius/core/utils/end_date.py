"""Provides utility functions for end_date."""

from datetime import date, datetime


def load_input_data_end_date(kpi_info: dict, end_date: date = None) -> date:
    """Return the end date of the KPI.

    :param kpi_info: dictionary containing information about the KPI
    :type kpi_info: dict
    :param end_date: default end date to use, defaults to None
    :type end_date: date, optional
    :return: end date for the KPI
    :rtype: date
    """
    if end_date is not None:
        return end_date

    static_params_end_date = kpi_info.get("static_params", {}).get("end_date")
    if not static_params_end_date:
        return datetime.today().date()

    try:
        return datetime.strptime(static_params_end_date, "%Y-%m-%d %H:%M:%S").date()
    except:  # noqa E722
        static_params_end_date = static_params_end_date + " 00:00:00"
        return datetime.strptime(static_params_end_date, "%Y-%m-%d %H:%M:%S").date()
