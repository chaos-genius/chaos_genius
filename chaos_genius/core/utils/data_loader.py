"""Provides utilties for loading data from KPIs."""

from datetime import date, datetime, timedelta
import logging
import random
import string
import pytz

import pandas as pd
from chaos_genius.connectors import get_sqla_db_conn
from chaos_genius.databases.models.data_source_model import DataSource
from chaos_genius.settings import TIMEZONE
from chaos_genius.core.utils.constants import SUPPORTED_TIMEZONES
from chaos_genius.core.utils.utils import randomword


_SQL_IDENTIFIERS = {
    "MySQL": "`",
    "Postgres": '"',
}

logger = logging.getLogger(__name__)


class DataLoader:
    def __init__(
        self,
        kpi_info: dict,
        end_date: date = None,
        start_date: date = None,
        days_before: int = None,
        tail: int = None,
        validation: bool = False,
    ):
        """Initialize Data Loader for KPI.

        If end_date is none, end_date is set to current datetime.
        If start_date is none, days_before is used to determine start_date.
        You must specify either start_date or days_before.

        :param kpi_info: kpi info to load data for
        :type kpi_info: dict
        :param end_date: end data to load data for
        :type end_date: str, optional
        :param start_date: start date to load data for
        :type start_date: str, optional
        :param days_before: number of days before to load data for
        :type days_before: int, optional
        :param tail: limit data loaded to this number of rows, defaults to None
        :type tail: int, optional
        :param validation: if validation is True, we do not perform preprocessing
        :type validation: bool, optional
        :raises ValueError: Raises error if both start_date and days_before are
        not specified
        """
        self.kpi_info = kpi_info
        self.tail = tail
        self.validation = validation

        if end_date is None:
            end_date = datetime.today().date()

        if start_date is None and days_before is not None:
            start_date = end_date - timedelta(days=days_before)

        self.start_date = start_date
        # when we do date <= "6 Feb 2022", we get data till "6 Feb 2022 00:00:00"
        # (inclusive), but we need data till "7 Feb 2022 00:00:00" (exclusive)
        # so we add one day here and make our query date < "7 Feb 2022"
        self.end_date = end_date + timedelta(days=1)

        self.connection_info = DataSource.get_by_id(
            kpi_info["data_source"]
        ).as_dict
        self.dt_col = self.kpi_info["datetime_column"]
        self.identifier = _SQL_IDENTIFIERS.get(
            self.connection_info["connection_type"], ""
        )

    def _get_id_string(self, value):
        return f"{self.identifier}{value}{self.identifier}"

    def _build_date_filter(self):
        dt_col_str = self._get_id_string(self.dt_col)

        start_date_str = self.start_date.strftime("%Y-%m-%d")
        end_date_str = self.end_date.strftime("%Y-%m-%d")

        # TODO: Write tests for tz aware date strings
        # if we have tz aware data, we need to add tz info to data
        if self.kpi_info.get("timezone_aware"):
            tz_offset_string = SUPPORTED_TIMEZONES[TIMEZONE][-6:]
            tz_offset_string = f"T00:00:00{tz_offset_string}"
            start_date_str += tz_offset_string
            end_date_str += tz_offset_string

        start_query = f"{dt_col_str} >= '{start_date_str}'"
        end_query = f"{dt_col_str} < '{end_date_str}'"

        return f" where {start_query} and {end_query} "

    def _get_tz_from_offset_str(self, utc_offset_str="GMT+00:00"):
        # TODO: Move to utils file
        # TODO: Write tests for this
        sign = -1 if utc_offset_str[-6] == "-" else 1
        utc_offset_mins = int(utc_offset_str[-2:]) * sign
        utc_offset_hrs = int(utc_offset_str[-5:-3]) * sign

        utc_offset = timedelta(hours=utc_offset_hrs, minutes=utc_offset_mins)

        timezones = pytz.all_timezones
        for tz_name in timezones:
            try:
                tz = pytz.timezone(tz_name)
                tz_offset = tz._transition_info[-1][0]
                if utc_offset == tz_offset:
                    return tz
            except AttributeError:
                pass
        raise ValueError(f"No timezone found for offset {utc_offset_str}")

    def _get_table_name(self):
        if self.kpi_info["kpi_type"] != "table":
            return f"({self.kpi_info['kpi_query']}) as {self._get_id_string(randomword(10))}"
        table_name = self._get_id_string(self.kpi_info["table_name"])
        schema_name = self.kpi_info.get("schema_name", None)
        if schema_name:
            schema_name = self._get_id_string(schema_name)
            return f"{schema_name}.{table_name}"
        return table_name

    def _get_filters_for_query(self):
        query = ""
        kpi_filters = self.kpi_info.get("filters")
        if kpi_filters:
            kpi_filters_query = " "
            for key, values in kpi_filters.items():
                if values:
                    # TODO: Bad Hack to remove the last comma, fix it
                    values_str = str(tuple(values))
                    values_str = values_str[:-2] + ")"
                    kpi_filters_query += (
                        f" and {self._get_id_string(key)} in {values_str}"
                    )
            kpi_filters_query += " "
            query += kpi_filters_query
        return query.strip()

    def _build_query(self, count=False):
        table_name = self._get_table_name()

        date_filter = (
            self._build_date_filter().strip()
            if self.start_date is not None
            else ""
        )

        if count:
            query = f"select count(*) from {table_name} {date_filter}"
        else:
            query = f"select * from {table_name} {date_filter}"

        filters_for_query = self._get_filters_for_query()
        if date_filter == "" and filters_for_query != "":
            query += " where "

        query += filters_for_query

        if self.tail is not None:
            query += f" limit {self.tail}"

        return query

    def _run_query(self, query):
        db_connection = get_sqla_db_conn(data_source_info=self.connection_info)
        return db_connection.run_query(query)

    def _preprocess_df(self, df):
        df[self.dt_col] = pd.to_datetime(df[self.dt_col])

        if self.kpi_info.get("timezone_aware"):
            # if tz aware data, convert to given timezone
            # and then strip tz information
            tz_to_convert_to = self._get_tz_from_offset_str(
                SUPPORTED_TIMEZONES[TIMEZONE]
            )
            df[self.dt_col] = (
                df[self.dt_col]
                .dt.tz_convert(tz_to_convert_to)
                .dt.tz_localize(None)
            )

    def get_count(self) -> int:
        """Return count of rows in KPI data."""
        query = self._build_query(count=True)
        logger.info(
            f"Created query for KPI {self.kpi_info['id']}",
            extra={"data_query": query},
        )
        df = self._run_query(query)
        return df.iloc[0, 0]

    def _get_data_stats(self, df: pd.DataFrame) -> None:
        return {
            "total_rows": len(df),
            "data_start_date": df[self.dt_col].min(),
            "data_end_date": df[self.dt_col].max(),
            "dims": [
                {"name": dim, "card": len(df[dim].unique())}
                for dim in self.kpi_info["dimensions"]
            ],
        }

    def get_data(self, return_empty=False) -> pd.DataFrame:
        """Return dataframe with KPI data.

        If return_empty is false, it will raise an error if no data is found.
        If return_empty is true, it will return an empty dataframe.
        """
        kpi_id = self.kpi_info["id"]

        query = self._build_query()
        logger.info(
            f"Created query for KPI {kpi_id}", extra={"data_query": query}
        )

        df = self._run_query(query)

        if len(df) == 0:
            if return_empty:
                logger.warn(
                    "Returning empty dataframe for KPI {}".format(kpi_id)
                )
                return df
            raise ValueError("Dataframe is empty.")

        if not self.validation:
            self._preprocess_df(df)

            data_stats = self._get_data_stats(df)
            logger.info(
                f"Data stats for KPI {kpi_id}",
                extra={"data_stats": data_stats},
            )

        return df
