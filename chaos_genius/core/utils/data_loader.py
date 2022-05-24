"""Provides utilties for loading data from KPIs."""

import contextlib
import logging
from datetime import date, datetime, timedelta
from typing import List, Optional

import pandas as pd
from pandas.api.types import is_datetime64_any_dtype as is_datetime
import pytz

from chaos_genius.connectors import get_sqla_db_conn
from chaos_genius.core.utils.constants import SUPPORTED_TIMEZONES
from chaos_genius.core.utils.utils import randomword
from chaos_genius.databases.models.data_source_model import DataSource
from chaos_genius.settings import TIMEZONE

_SQL_IDENTIFIERS = {
    "MySQL": "`",
    "Postgres": '"',
}

logger = logging.getLogger(__name__)


class DataLoader:
    """Data Loader Class."""

    def __init__(
        self,
        kpi_info: dict,
        end_date: Optional[date] = None,
        start_date: Optional[date] = None,
        days_before: Optional[int] = None,
        tail: Optional[int] = None,
        validation: bool = False,
    ):
        """Initialize Data Loader for KPI.

        Accepted combinations of end_date, start_date and days_before:
        - none
        - end_date
        - start_date
        - end_date, start_date
        - end_date, days_before
        - start_date, days_before

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
        :raises ValueError: Raises error if start_date, end_date and days_before not in accepted combinations
        """
        self.kpi_info = kpi_info
        self.tail = tail
        self.validation = validation

        self.end_date = end_date
        self.start_date = start_date
        self.days_before = days_before

        if self.end_date is None and self.start_date is None and self.days_before is not None:
            raise ValueError(
                "If days_before is specified, either start_date or end_date must be specified"
            )

        if self.end_date is not None and self.start_date is not None and self.days_before is not None:
            raise ValueError(
                "end_date, start_date and days_before cannot be specified at the same time"
            )

        if self.end_date is None and self.start_date is not None and self.days_before is not None:
            self.end_date = self.start_date + timedelta(days=self.days_before)

        if self.end_date is not None and self.start_date is None and self.days_before is not None:
            self.start_date = self.end_date - timedelta(days=self.days_before)

        # when we do date <= "6 Feb 2022", we get data till "6 Feb 2022 00:00:00"
        # (inclusive), but we need data till "7 Feb 2022 00:00:00" (exclusive)
        # so we add one day here and make our query date < "7 Feb 2022"
        if self.end_date is not None:
            self.end_date = self.end_date + timedelta(days=1)

        self.connection_info = DataSource.get_by_id(
            kpi_info["data_source"]
        ).as_dict
        self.dt_col = self.kpi_info["datetime_column"]
        self.identifier = _SQL_IDENTIFIERS.get(
            self.connection_info["connection_type"], ""
        )

    def _get_id_string(self, value):
        return f"{self.identifier}{value}{self.identifier}"

    def _convert_date_to_string(self, date: date, offset: str):
        # TODO: Once SUPPOERTED_TIMEZONES is deprecated,
        # we shouldn't need to take offset as a string, but rather
        # take in a pytz timezone and skip using strings.
        date = date.strftime("%Y-%m-%d")
        date += f"T00:00:00{offset}"
        if not self.kpi_info.get("timezone_aware"):
            date = (
                pd.Timestamp(datetime.strptime(date, "%Y-%m-%dT%H:%M:%S%z"))
                .tz_convert(self.connection_info["database_timezone"])
                .tz_localize(None)
                # TODO: We should also use date.isoformat() here
                .strftime("%Y-%m-%dT%H:%M:%S")
            )
        return date

    def _build_date_filter(self) -> List[str]:
        dt_col_str = self._get_id_string(self.dt_col)

        # TODO: Deprecate SUPPORTED_TIMEZONES over releases.
        # Use reporting timezone to localize start & end date
        if TIMEZONE in SUPPORTED_TIMEZONES:
            tz_offset_string = SUPPORTED_TIMEZONES[TIMEZONE][-6:]
        else:
            tz_offset_string = datetime.now(pytz.timezone(TIMEZONE)).strftime("%z")
            tz_offset_string = tz_offset_string[:3] + ":" + tz_offset_string[3:]

        filters = []
        if self.start_date is not None:
            start_date_str = self._convert_date_to_string(self.start_date, tz_offset_string)
            filters.append(f"{dt_col_str} >= '{start_date_str}'")
        if self.end_date is not None:
            end_date_str = self._convert_date_to_string(self.end_date, tz_offset_string)
            filters.append(f"{dt_col_str} < '{end_date_str}'")

        return filters

    def _get_tz_from_offset_str(self, utc_offset_str="GMT+00:00"):
        # TODO: Move to utils file
        # TODO: Write tests for this
        sign = -1 if utc_offset_str[-6] == "-" else 1
        utc_offset_mins = int(utc_offset_str[-2:]) * sign
        utc_offset_hrs = int(utc_offset_str[-5:-3]) * sign

        utc_offset = timedelta(hours=utc_offset_hrs, minutes=utc_offset_mins)

        timezones = pytz.all_timezones
        for tz_name in timezones:
            # TODO: use getattr here with a default value instead of supressing
            with contextlib.suppress(AttributeError):
                tz = pytz.timezone(tz_name)
                tz_offset = tz._transition_info[-1][0]
                if utc_offset == tz_offset:
                    return tz
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

    def _build_query(self, count=False):
        table_name = self._get_table_name()

        all_filters = []

        all_filters.extend(self._build_date_filter())

        if count:
            query = f"select count(*) from {table_name}"
        else:
            query = f"select * from {table_name}"

        if all_filters:
            query += " where "
            query += " and ".join(all_filters)

        if self.tail is not None:
            query += f" limit {self.tail}"

        return query

    def _run_query(self, query):
        db_connection = get_sqla_db_conn(data_source_info=self.connection_info)
        return db_connection.run_query(query)

    def _prepare_date_column(self, df):
        if is_datetime(df[self.dt_col]):
            # this should handle tz naive cases as all data points are in timestamp
            return

        dtypes = df[self.dt_col].apply(lambda x: type(x)).unique()

        if len(dtypes) == 1 and dtypes[0] == str:
            # strings should be parsed later
            return

        # convert to timestamp and convert to UTC
        df[self.dt_col] = pd.to_datetime(df[self.dt_col], utc=True)

    def _preprocess_df(self, df):
        df[self.dt_col] = pd.to_datetime(df[self.dt_col])

        # TODO: use the timezone_aware column in kpi table once updated
        # tz-naive timestamps get localized to their database timezone.
        if df[self.dt_col].dt.tz is None:
            df[self.dt_col] = df[self.dt_col].dt.tz_localize(
                self.connection_info["database_timezone"]
            )

        # TODO: Deprecate SUPPORTED_TIMEZONES over releases.
        # maps the abbreviations to respective tz regions
        if TIMEZONE in SUPPORTED_TIMEZONES:
            tz_to_convert_to = self._get_tz_from_offset_str(
                SUPPORTED_TIMEZONES[TIMEZONE]
            )
        else:
            tz_to_convert_to = TIMEZONE

        # convert to reporting timezone
        # and then strip tz information
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
                logger.warn(f"Returning empty dataframe for KPI {kpi_id}")
                return df
            raise ValueError("Dataframe is empty.")

        self._prepare_date_column(df)

        if not self.validation:
            self._preprocess_df(df)

            data_stats = self._get_data_stats(df)
            logger.info(
                f"Data stats for KPI {kpi_id}",
                extra={"data_stats": data_stats},
            )

        return df
