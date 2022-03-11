"""Provides a controller class for performing RCA."""

import json
import logging
from datetime import date, datetime
from typing import Optional, Tuple

import numpy as np
import pandas as pd
from numpyencoder import NumpyEncoder

from chaos_genius.controllers.task_monitor import checkpoint_failure, checkpoint_success
from chaos_genius.core.rca.constants import (
    LINE_DATA_TIMESTAMP_FORMAT,
    TIME_RANGES_BY_KEY,
)
from chaos_genius.core.rca.root_cause_analysis import RootCauseAnalysis
from chaos_genius.core.utils.data_loader import DataLoader
from chaos_genius.core.utils.end_date import load_input_data_end_date
from chaos_genius.core.utils.round import round_series
from chaos_genius.databases.models.data_source_model import DataSource
from chaos_genius.databases.models.rca_data_model import RcaData, db
from chaos_genius.settings import (
    DEEPDRILLS_ENABLED_TIME_RANGES,
    DEEPDRILLS_HTABLE_MAX_CHILDREN,
    DEEPDRILLS_HTABLE_MAX_DEPTH,
    DEEPDRILLS_HTABLE_MAX_PARENTS,
)

logger = logging.getLogger(__name__)


class RootCauseAnalysisController:
    """RCA Controller class. Used to perform RCA analysis with Celery."""

    def __init__(
        self,
        kpi_info: dict,
        end_date: date = None,
        task_id: Optional[int] = None,
    ):
        """Initialize the controller.

        :param kpi_info: KPI information as a dictionary
        :type kpi_info: dict
        :param end_date: end date for analysis, defaults to None
        :type end_date: date, optional
        :param task_id: used to log checkpoints for task. Set to None to
            disable checkpoints.
        :type task_id: int, optional
        """
        logger.info(f"RCA Controller initialized with KPI: {kpi_info['id']}")
        self.kpi_info = kpi_info

        # TODO: Make this connection type agnostic.
        conn_type = DataSource.get_by_id(
            kpi_info["data_source"]
        ).as_dict["connection_type"]
        self._preaggregated = conn_type == "Druid"
        self._preaggregated_count_col = "count"

        self.end_date = load_input_data_end_date(kpi_info, end_date)
        logger.info(f"RCA Controller end date: {self.end_date}")

        self.metric = kpi_info["metric"]
        self.dimensions = kpi_info["dimensions"]
        self.dt_col = kpi_info["datetime_column"]
        self.agg = kpi_info["aggregation"]

        self.num_dim_combs = list(
            range(1, min(4, len(kpi_info["dimensions"]) + 1))
        )

        self._task_id = task_id

    def _load_data(
        self, timeline: str = "last_30_days"
    ) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """Load data for performing RCA.

        :param timeline: timeline to load data for, defaults to "last_30_days"
        :type timeline: str, optional
        :return: tuple with baseline data and rca data for
        :rtype: Tuple[pd.DataFrame, pd.DataFrame]
        """
        # TODO: Write data loader which can cache data and pull from cache
        (prev_start_date, prev_end_date), (
            curr_start_date,
            curr_end_date,
        ) = TIME_RANGES_BY_KEY[timeline]["function"](self.end_date)

        base_df = DataLoader(
            self.kpi_info,
            end_date=prev_end_date,
            start_date=prev_start_date,
        ).get_data(return_empty=True)

        rca_df = DataLoader(
            self.kpi_info,
            end_date=curr_end_date,
            start_date=curr_start_date,
        ).get_data(return_empty=True)

        if base_df.empty and rca_df.empty:
            raise ValueError(
                f"No data to perform RCA on for timeline: {timeline}."
            )

        if rca_df.empty:
            rca_df = pd.DataFrame(data=[], columns=base_df.columns)
        elif base_df.empty:
            base_df = pd.DataFrame(data=[], columns=rca_df.columns)

        logger.info(f"Loaded {len(base_df)}, {len(rca_df)} rows of data")
        return base_df, rca_df

    def _output_to_row(
        self,
        data_type: str,
        data: dict,
        timeline: str = "last_30_days",
        dimension: str = None,
    ) -> dict:
        """Output RCA data to a standardized dictionary.

        :param data_type: type of data, can be one of line, agg, rca, or htable
        :type data_type: str
        :param data: rca data to store
        :type data: dict
        :param timeline: timeline used for calculation, defaults to "last_30_days"
        :type timeline: str, optional
        :param dimension: dimension on which data is computed, defaults to None
        :type dimension: str, optional
        :return: standardized dictionary
        :rtype: dict
        """
        return {
            "kpi_id": self.kpi_info["id"],
            "end_date": self.end_date,
            "data_type": data_type,
            "timeline": timeline,
            "dimension": dimension,
            "data": json.dumps(data, cls=NumpyEncoder),
        }

    def _get_line_data(self, days: int = 60) -> dict:
        """Get line data for KPI.

        :param days: number of days to get data for, defaults to 60
        :type days: int, optional
        :return: dictionary with line data
        :rtype: dict
        """
        rca_df = DataLoader(
            self.kpi_info,
            end_date=self.end_date,
            days_before=days,
        ).get_data()

        if self._preaggregated:
            if self.agg == "count":
                agg_dict = {self._preaggregated_count_col: "sum"}
                col_name = self._preaggregated_count_col
            elif self.agg == "sum":
                agg_dict = {self.metric: "sum"}
                col_name = self.metric
            else:
                raise ValueError(
                    f"Unsupported aggregation: {self.agg} for preaggregated data."
                )
        else:
            agg_dict = {self.metric: self.agg}
            col_name = self.metric

        rca_df = (
            rca_df.resample("D", on=self.dt_col)
            .agg(agg_dict)
            .fillna(0)
            .reset_index()
        )

        rca_df[self.dt_col] = rca_df[self.dt_col].dt.strftime(
            LINE_DATA_TIMESTAMP_FORMAT
        )

        rca_df = rca_df.rename(
            columns={self.dt_col: "date", col_name: "value"}
        )
        rca_df["value"] = round_series(rca_df["value"])

        logger.debug(f"Line data has {len(rca_df)} rows.")

        return rca_df.to_dict(orient="records")

    def _load_rca_obj(self, timeline: str) -> RootCauseAnalysis:
        """Create RootCauseAnalysis object for KPI.

        :param timeline: timeline to use
        :type timeline: str
        :return: RootCauseAnalysis object
        :rtype: RootCauseAnalysis
        """
        base_df, rca_df = self._load_data(timeline)
        return RootCauseAnalysis(
            base_df,
            rca_df,
            dims=self.dimensions,
            metric=self.metric,
            agg=self.agg,
            num_dim_combs=self.num_dim_combs,
            preaggregated=self._preaggregated,
            preaggregated_count_col=self._preaggregated_count_col,
        )

    def _get_aggregation(self, rca: RootCauseAnalysis) -> dict:
        """Get aggregations for KPI.

        :param rca: RootCauseAnalysis object to use
        :type rca: RootCauseAnalysis
        :return: dictionary with aggregations for KPI
        :rtype: dict
        """

        return rca.get_panel_metrics()

    def _process_rca_output(self, impact_table: dict) -> dict:
        """Process output of RCA for UI friendly output.

        :param impact_table: RCA data
        :type impact_table: dict
        :return: UI friendly dictionary
        :rtype: dict
        """
        rename_dict = {
            "string": "subgroup",
            "size_g1": "g1_size",
            "val_g1": "g1_agg",
            "count_g1": "g1_count",
            "size_g2": "g2_size",
            "val_g2": "g2_agg",
            "count_g2": "g2_count",
            "impact": "impact",
            "id": "id",
            "parentId": "parentId",
        }
        df = pd.DataFrame(impact_table).rename(columns=rename_dict)
        df = df.drop(set(df.columns) - set(rename_dict.values()), axis=1)
        df = df.fillna(np.nan).replace([np.nan], [None])
        return df.to_dict(orient="records")

    def _get_rca(
        self,
        rca: RootCauseAnalysis,
        dimension: str = None,
        timeline: str = "last_30_days",
    ) -> dict:
        """Get RCA output for specific dimension.

        :param rca: RootCauseAnalysis object
        :type rca: RootCauseAnalysis
        :param dimension: dimension to compute for, defaults to None
        :type dimension: str, optional
        :param timeline: dimension to compute for, defaults to "last_30_days"
        :type timeline: str, optional
        :return: rca dictionary
        :rtype: dict
        """
        impact_table = rca.get_impact_rows(dimension)
        impact_table_col_map = rca.get_impact_column_map(timeline)

        impact_table = self._process_rca_output(impact_table)

        waterfall_table = rca.get_waterfall_table_rows(dimension)
        waterfall_data, y_axis_lim = rca.get_waterfall_plot_data(dimension)

        return {
            "data_table": impact_table,
            "data_columns": impact_table_col_map,
            "chart": {
                "chart_table": waterfall_table,
                "chart_data": waterfall_data,
                "y_axis_lim": y_axis_lim,
            },
        }

    def _get_htable(
        self,
        rca: RootCauseAnalysis,
        dimension: str,
        timeline: str = "last_30_days",
    ) -> dict:
        """Get hierarchical table output for specific dimension.

        :param rca: RootCauseAnalysis object
        :type rca: RootCauseAnalysis
        :param dimension: dimension to compute for
        :type dimension: str
        :param timeline: dimension to compute for, defaults to "last_30_days"
        :type timeline: str, optional
        :return: hierarchical table data
        :rtype: dict
        """
        htable = rca.get_hierarchical_table(
            dimension,
            max_depth=DEEPDRILLS_HTABLE_MAX_DEPTH,
            max_children=DEEPDRILLS_HTABLE_MAX_CHILDREN,
            max_parents=DEEPDRILLS_HTABLE_MAX_PARENTS,
        )
        impact_table_col_map = rca.get_impact_column_map(timeline)
        return {
            "data_table": self._process_rca_output(htable),
            "data_columns": impact_table_col_map,
        }

    def _checkpoint_success(self, checkpoint: str):
        if self._task_id is not None:
            checkpoint_success(
                self._task_id,
                self.kpi_info["id"],
                "DeepDrills",
                checkpoint,
            )
        logger.info(
            "(Task: %s, KPI: %d)" " DeepDrills - %s - Success",
            str(self._task_id),
            self.kpi_info["id"],
            checkpoint,
        )

    def _checkpoint_failure(self, checkpoint: str, e: Exception):
        if self._task_id is not None:
            checkpoint_failure(
                self._task_id,
                self.kpi_info["id"],
                "DeepDrills",
                checkpoint,
                e,
            )
        logger.exception(
            "(Task: %s, KPI: %d) " "DeepDrills - %s - Exception occured.",
            str(self._task_id),
            self.kpi_info["id"],
            checkpoint,
            exc_info=e,
        )

    def compute(self):
        """Compute RCA for KPI and store results."""
        kpi_id = self.kpi_info["id"]
        output = []

        logger.info("Getting Line Data for KPI.")
        try:
            line_data = self._get_line_data()
            output.append(self._output_to_row("line", line_data))
            self._checkpoint_success("Time Series Generation")
        except Exception as e:
            self._checkpoint_failure("Time Series Generation", e)
            raise e
        logger.info("Line Data for KPI completed.")

        for timeline in DEEPDRILLS_ENABLED_TIME_RANGES:
            logger.info(f"Running RCA for timeline: {timeline}.")
            try:
                rca = self._load_rca_obj(timeline)
                self._checkpoint_success(f"{timeline} Data Loader")
            except Exception as e:
                rca = None
                logger.error(
                    f"Error loading RCA for timeline [{timeline}]: {e}"
                )
                self._checkpoint_failure(f"{timeline} Data Loader", e)

            if rca is None:
                continue

            logger.info("RCA object created.")

            try:
                logger.info("Computing aggregations.")
                agg_data = self._get_aggregation(rca)
                output.append(self._output_to_row("agg", agg_data, timeline))
                self._checkpoint_success(f"{timeline} Card Metrics")

            except Exception as e:
                logger.error(
                    f"Error in agg for {timeline}. Skipping timeline.",
                    exc_info=1,
                )
                self._checkpoint_failure(f"{timeline} Card Metrics", e)
                continue

            # Do not calculate further if no dimensions are present
            if not self.kpi_info.get("dimensions"):
                logger.info(
                    f"No dimensions in KPI ID: {kpi_id}. Skipping DeepDrills."
                )
                self._checkpoint_success(f"{timeline} DeepDrills Calculation")
                continue

            try:
                if self._preaggregated:
                    dims = self.kpi_info["dimensions"]
                else:
                    dims = [None] + self.dimensions
                for dim in dims:
                    logger.info(f"Computing RCA for dimension: {dim}")
                    try:
                        rca_data = self._get_rca(rca, dim, timeline)
                        output.append(
                            self._output_to_row("rca", rca_data, timeline, dim)
                        )
                    except Exception as e:  # noqa E722
                        logger.error(
                            f"Error in RCA for {timeline, dim}", exc_info=1
                        )
                        raise e

                    if dim is not None:
                        logger.info(
                            f"Computing Hierarchical table for dimension: {dim}"
                        )
                        try:
                            htable_data = self._get_htable(rca, dim, timeline)
                            output.append(
                                self._output_to_row(
                                    "htable", htable_data, timeline, dim
                                )
                            )
                        except Exception as e:  # noqa E722
                            logger.error(
                                f"Error in htable for {timeline, dim}",
                                exc_info=1,
                            )
                            raise e

                self._checkpoint_success(f"{timeline} DeepDrills Calculation")
            except Exception as e:
                logger.error(
                    f"Error in DeepDrills Calculation for {timeline}",
                    exc_info=1,
                )
                self._checkpoint_failure(
                    f"{timeline} DeepDrills Calculation", e
                )

        # don't store if there is only the line data
        if len(output) < 2:
            return None

        try:
            logger.info(f"Storing output for KPI {kpi_id}")
            output = pd.DataFrame(output)
            output["created_at"] = datetime.now()
            output.to_sql(
                RcaData.__tablename__,
                db.engine,
                if_exists="append",
                index=False,
                chunksize=RcaData.__chunksize__
            )
            self._checkpoint_success("Output Storage")
        except Exception as e:  # noqa E722
            logger.error("Error in storing output.", exc_info=e)
            self._checkpoint_failure("Output Storage", e)
            raise e
