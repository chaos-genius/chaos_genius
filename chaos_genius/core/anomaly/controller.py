"""Provides AnomalyDetectionController to compute Anomaly Detection."""

import logging
from datetime import date, datetime, timedelta
from typing import Optional

import pandas as pd

from chaos_genius.controllers.task_monitor import checkpoint_failure, checkpoint_success
from chaos_genius.core.anomaly.constants import RESAMPLE_FREQUENCY
from chaos_genius.core.anomaly.processor import ProcessAnomalyDetection
from chaos_genius.core.anomaly.utils import (
    fill_data,
    get_dq_missing_data,
    get_last_date_in_db,
)
from chaos_genius.core.utils.data_loader import DataLoader
from chaos_genius.core.utils.end_date import load_input_data_end_date
from chaos_genius.databases.models.anomaly_data_model import AnomalyDataOutput, db
from chaos_genius.databases.models.data_source_model import DataSource
from chaos_genius.databases.models.kpi_model import Kpi
from chaos_genius.settings import (
    MAX_ANOMALY_SLACK_DAYS,
    MAX_FILTER_SUBGROUPS_ANOMALY,
    MAX_SUBDIM_CARDINALITY,
    MIN_DATA_IN_SUBGROUP,
    MULTIDIM_ANALYSIS_FOR_ANOMALY,
    HOURS_OFFSET_FOR_ANALTYICS,
)

logger = logging.getLogger(__name__)

DEBUG_MAX_SUBGROUPS = 10


class AnomalyDetectionController(object):
    """Controller class for performing Anomaly Detection."""

    def __init__(
        self,
        kpi_info: dict,
        end_date: date = None,
        save_model: bool = False,
        debug: bool = False,
        task_id: Optional[int] = None,
    ):
        """Initialize the controller.

        :param kpi_info: dictionary with information on the kpi
        :type kpi_info: dict
        :param end_date: end date to perform anomaly detection for, defaults to
        None
        :type end_date: date, optional
        :param save_model: whether to save the model or not, defaults to False
        :type save_model: bool, optional
        :param task_id: used to log checkpoints. Set to None to disable logging
        of checkpoints.
        :type task_id: int, optional
        """
        logger.info(f"Anomaly Controller initializing with KPI:{kpi_info['id']}")
        self.kpi_info = kpi_info

        # TODO: Add these in kpi_info
        self.kpi_info["freq"] = self.kpi_info.get("freq", "D")

        self.save_model = save_model

        self.end_date = load_input_data_end_date(kpi_info, end_date)

        self.debug = self.kpi_info["anomaly_params"].get("debug", False)
        if self.debug == "True":
            self.debug = True
        if self.debug == "False":
            self.debug = False
        self.slack = MAX_ANOMALY_SLACK_DAYS

        if self.kpi_info["anomaly_params"]["frequency"] == "H":
            period = int(self.kpi_info["anomaly_params"]["anomaly_period"])
            period *= 24
            self.kpi_info["anomaly_params"]["anomaly_period"] = period

        self._task_id = task_id

        # TODO: Make this connection type agnostic.
        conn_type = DataSource.get_by_id(
            kpi_info["data_source"]
        ).as_dict["connection_type"]
        self._preaggregated = conn_type == "Druid"
        self._preaggregated_count_col = "count"

        logger.info(f"Anomaly controller initialized for KPI ID: {kpi_info['id']}")

    def _load_anomaly_data(self) -> pd.DataFrame:
        """Load KPI data, preprocess it and return it for anomaly detection.

        :return: Dataframe with all of KPI's data for the last
        N days/hours
        :rtype: pd.DataFrame
        """
        last_date = self._get_last_date_in_db("overall")
        period = self.kpi_info["anomaly_params"]["anomaly_period"]

        # Convert period back to days for hourly data
        if self.kpi_info["anomaly_params"]["frequency"] == "H":
            period /= 24

        start_date = last_date - timedelta(days=period) if last_date else None

        return DataLoader(
            self.kpi_info,
            end_date=self.end_date,
            start_date=start_date,
            days_before=period,
        ).get_data()

    def _get_last_date_in_db(self, series: str, subgroup: str = None) -> datetime:
        """Return the last date for which we have data for the given series.

        :param series: Type of series
        :type series: str
        :param subgroup: Subtype of series
        :type subgroup: str
        :return: Last date for which we have data for the given series
        :rtype: datetime
        """
        return get_last_date_in_db(self.kpi_info["id"], series, subgroup)

    def _create_hourly_input_data(self, input_data: pd.DataFrame) -> pd.DataFrame:
        """Return input data until the last complete hour minus the hourly_offset.

        :param input_data: Loaded input dataframe
        :type input_data: pd.DataFrame
        :return: Dataframe for hourly anomaly
        :rtype: pd.DataFrame
        """
        last_datetime = input_data[self.kpi_info["datetime_column"]].max()

        # If last_datetime=2022-02-03 04:45:50 & offset=0, then end_date_str=2022-02-03 04:00:00
        end_date_str = last_datetime.floor(freq='H') - timedelta(hours=HOURS_OFFSET_FOR_ANALTYICS)

        # If end_date_str=2022-02-03 04:00:00 then we have complete data until 4PM (not inclusive)
        # Fetch all data <  2022-02-03 04:00:00 i.e. end_date_str
        input_data = input_data[input_data[self.kpi_info["datetime_column"]] < end_date_str]

        self.end_date = input_data[self.kpi_info["datetime_column"]].max()
        return input_data

    def _detect_anomaly(
        self,
        model_name: str,
        input_data: pd.DataFrame,
        last_date: datetime,
        series: str,
        subgroup: str,
        freq,
    ) -> pd.DataFrame:
        """Detect anomalies in the given data.

        :param model_name: name of the model used for anomaly detection
        :type model_name: str
        :param input_data: Dataframe with metric's data
        :type input_data: pd.DataFrame
        :param last_date: Last date for which we have output data
        :type last_date: datetime
        :return: Dataframe with anomaly data
        :rtype: pd.DataFrame
        """
        input_data = input_data.reset_index().rename(
            columns={
                self.kpi_info["datetime_column"]: "dt",
                self.kpi_info["metric"]: "y",
            }
        )

        sensitivity = self.kpi_info["anomaly_params"].get("sensitivity", "medium")

        return ProcessAnomalyDetection(
            model_name,
            input_data,
            last_date,
            self.kpi_info["anomaly_params"]["anomaly_period"],
            self.kpi_info["table_name"],
            freq,
            sensitivity,
            self.slack,
            series,
            subgroup,
            self.kpi_info.get("model_kwargs", {}),
        ).predict()

    def _save_anomaly_output(
        self, anomaly_output: pd.DataFrame, series: str, subgroup: str = None
    ) -> None:
        """Save anomaly output to the DB.

        :param anomaly_output: Dataframe with anomaly data
        :type anomaly_output: pd.DataFrame
        :param series: Type of series
        :type series: str
        :param subgroup: Subgroup of the KPI
        :type subgroup: str
        """
        if self.debug:
            print("SAVING", series, subgroup, len(anomaly_output))

        anomaly_output = anomaly_output.rename(
            columns={"dt": "data_datetime", "anomaly": "is_anomaly"}
        )
        anomaly_output["kpi_id"] = self.kpi_info["id"]
        anomaly_output["anomaly_type"] = series
        anomaly_output["series_type"] = subgroup
        anomaly_output["created_at"] = datetime.now()

        anomaly_output.to_sql(
            AnomalyDataOutput.__tablename__,
            db.engine,
            if_exists="append",
            chunksize=AnomalyDataOutput.__chunksize__
        )

    def _querify(self, col_names, raw_combinations):
        query_list = []
        for comb in raw_combinations:
            if type(comb) == str:
                unjoined_query = [f'`{col_names[0]}` == "{comb}"']
            elif type(comb) == tuple:
                unjoined_query = [
                    f'`{col_names[i]}` == "{comb[i]}"' for i in range(len(comb))
                ]
            query_string = " and ".join(unjoined_query)
            query_list.append(query_string)
        return query_list

    def _get_dimension_combinations(self, dimension_list):

        if MULTIDIM_ANALYSIS_FOR_ANOMALY:
            # return subgroup combination of style AxBxC
            return [dimension_list]
        else:
            # return subgroup combination of style A, B, C
            return list(map(lambda x: [x], dimension_list))

        # TODO: Uncomment when offering all levels of dimension grouping
        # s = list(dimension_list)
        # dim_comb = chain.from_iterable(
        #   combinations(s, r) for r in range(1,len(s)+1)
        # )

    def _get_subgroup_list(self, input_data: pd.DataFrame) -> list:
        """Return list of subgroups for which to run anomaly detection.

        :return: List of subgroups
        :rtype: list
        """
        valid_subdims = []
        for dim in self.kpi_info["dimensions"]:
            if len(input_data[dim].unique()) >= MAX_SUBDIM_CARDINALITY:
                logger.warn(
                    f"skipping {dim}, cardinality over {MAX_SUBDIM_CARDINALITY}"
                )
            elif input_data[dim].dtype != "object":
                logger.warn(f"skipping {dim}, non-string value found")
            else:
                valid_subdims.append(dim)

        group_list = []
        dim_comb = self._get_dimension_combinations(valid_subdims)
        for dim_list in dim_comb:
            grouped_dims = input_data.groupby(dim_list)
            subgroup_raw = list(grouped_dims.groups.keys())
            subgroup_querified = self._querify(dim_list, subgroup_raw)
            group_list.extend(subgroup_querified)
        return group_list

    def _filter_subgroups(self, subgroups: list, input_data: pd.DataFrame) -> list:
        """Filter out irrelevant subgroups.

        :param subgroups: List of subgroups
        :type subgroups: list
        :return: List of subgroups
        :rtype: list
        """
        if self._preaggregated:
            grouped_input_data = input_data.groupby(
                self.kpi_info["dimensions"]
            ).agg({self._preaggregated_count_col: "sum"}).rename(
                columns={self._preaggregated_count_col: self.kpi_info["metric"]}
            )
        else:
            grouped_input_data = input_data.groupby(
                self.kpi_info["dimensions"]
            ).agg({self.kpi_info["metric"]: "count"})

        filtered_subgroups = []

        for subgroup in subgroups:
            try:
                filter_data_len = grouped_input_data.query(subgroup)[
                    self.kpi_info["metric"]
                ].sum()
                if filter_data_len >= MIN_DATA_IN_SUBGROUP:
                    filtered_subgroups.append((subgroup, filter_data_len))
            except IndexError:
                pass

        filtered_subgroups.sort(key=lambda x: x[1], reverse=True)

        return [x[0] for x in filtered_subgroups[:MAX_FILTER_SUBGROUPS_ANOMALY]]

    def _run_anomaly_for_series(
        self, input_data: pd.DataFrame, series: str, subgroup: str = None
    ) -> None:
        """Run anomaly detection for the given series.

        :param series: Type of series
        :type series: str
        :param subgroup: Subgroup of the KPI
        :type subgroup: str
        """
        is_overall = series == "overall"

        try:
            dt_col = self.kpi_info["datetime_column"]
            metric_col = self.kpi_info["metric"]
            freq = self.kpi_info["anomaly_params"]["frequency"]
            agg = self.kpi_info["aggregation"]
            period = self.kpi_info["anomaly_params"]["anomaly_period"]

            series_data = None

            logger.info(f"Getting last date in db for {series}-{subgroup}.")
            last_date = self._get_last_date_in_db(series, subgroup)
            logger.info(f"Last date in db for {series}-{subgroup} is {last_date}")

            logger.info(f"Formatting input data for {series}-{subgroup}")

            relevant_cols = [dt_col, metric_col, self._preaggregated_count_col] if self._preaggregated else [dt_col, metric_col]
            if series == "dq":
                temp_input_data = input_data[relevant_cols]
                temp_input_data = fill_data(
                    temp_input_data,
                    dt_col,
                    metric_col,
                    last_date,
                    period,
                    self.end_date,
                    freq,
                    self._preaggregated_count_col if self._preaggregated else None,
                )

                if subgroup == "missing":
                    series_data = get_dq_missing_data(
                        temp_input_data,
                        dt_col,
                        metric_col,
                        RESAMPLE_FREQUENCY[freq],
                        self._preaggregated_count_col if self._preaggregated else None
                    )

                else:
                    if self._preaggregated and subgroup == "count":
                        series_data = (
                            temp_input_data.set_index(dt_col)
                            .resample(RESAMPLE_FREQUENCY[freq])
                            .agg({self._preaggregated_count_col: "sum"})
                            .rename(columns={
                                self._preaggregated_count_col: metric_col
                            })
                        )
                    else:
                        series_data = (
                            temp_input_data.set_index(dt_col)
                            .resample(RESAMPLE_FREQUENCY[freq])
                            .agg({metric_col: subgroup})
                        )

            elif series == "subdim":
                temp_input_data = input_data.query(subgroup)[relevant_cols]
                temp_input_data = fill_data(
                    temp_input_data,
                    dt_col,
                    metric_col,
                    last_date,
                    period,
                    self.end_date,
                    freq,
                    self._preaggregated_count_col if self._preaggregated else None,
                )

                if self._preaggregated:
                    if agg == "count":
                        series_data = (
                            temp_input_data.set_index(dt_col)
                            .resample(RESAMPLE_FREQUENCY[freq])
                            .agg({self._preaggregated_count_col: "sum"})
                            .rename(columns={
                                self._preaggregated_count_col: metric_col
                            })
                        )
                    elif agg == "sum":
                        series_data = (
                            temp_input_data.set_index(dt_col)
                            .resample(RESAMPLE_FREQUENCY[freq])
                            .agg({metric_col: "sum"})
                        )
                    else:
                        raise ValueError(
                            f"Unsupported aggregation {agg} for preaggregated data."
                        )
                else:
                    series_data = (
                        temp_input_data.set_index(dt_col)
                        .resample(RESAMPLE_FREQUENCY[freq])
                        .agg({metric_col: agg})
                    )

            elif series == "overall":
                temp_input_data = input_data[relevant_cols]
                temp_input_data = fill_data(
                    temp_input_data,
                    dt_col,
                    metric_col,
                    last_date,
                    period,
                    self.end_date,
                    freq,
                    self._preaggregated_count_col if self._preaggregated else None,
                )

                if self._preaggregated:
                    if agg == "count":
                        series_data = (
                            temp_input_data.set_index(dt_col)
                            .resample(RESAMPLE_FREQUENCY[freq])
                            .agg({self._preaggregated_count_col: "sum"})
                            .rename(columns={
                                self._preaggregated_count_col: metric_col
                            })
                        )
                    elif agg == "sum":
                        series_data = (
                            temp_input_data.set_index(dt_col)
                            .resample(RESAMPLE_FREQUENCY[freq])
                            .agg({metric_col: "sum"})
                        )
                    else:
                        raise ValueError(
                            f"Unsupported aggregation {agg} for preaggregated data."
                        )
                else:
                    series_data = (
                        temp_input_data.set_index(dt_col)
                        .resample(RESAMPLE_FREQUENCY[freq])
                        .agg({metric_col: agg})
                    )

            else:
                raise ValueError(f"series {series} not in ['dq', 'subdim', 'overall']")

            model_name = self.kpi_info["anomaly_params"]["model_name"]

            # TODO: fix missing dates/values issue more robustly
            series_data[metric_col] = series_data[metric_col].fillna(0)
            
            # Fix end_date for hourly anomaly alerts
            if self.kpi_info["scheduler_params"]["scheduler_frequency"] == "H":
                self.end_date = self.end_date.floor(freq='H')
                logger.info(f"End Date for Hourly Input Dataframe for KPI {self.end_date}")

        except Exception as e:
            self._checkpoint_failure("Overall KPI - Preprocessor", e, is_overall)
            raise e
        else:
            self._checkpoint_success("Overall KPI - Preprocessor", is_overall)

        try:
            logger.info(f"Running anomaly detection for {series}-{subgroup}")
            overall_anomaly_output = self._detect_anomaly(
                model_name, series_data, last_date, series, subgroup, freq
            )
        except Exception as e:
            self._checkpoint_failure("Overall KPI - Anomaly Detector", e, is_overall)
            raise e
        else:
            self._checkpoint_success("Overall KPI - Anomaly Detector", is_overall)

        try:
            logger.info(f"Saving Anomaly output for {series}-{subgroup}")
            self._save_anomaly_output(overall_anomaly_output, series, subgroup)
        except Exception as e:
            self._checkpoint_failure("Overall KPI - Result Ingestor", e, is_overall)
            raise e
        else:
            self._checkpoint_success("Overall KPI - Result Ingestor", is_overall)

    def _detect_subdimensions(self, input_data: pd.DataFrame) -> None:
        """Perform anomaly detection for subdimensions.

        :param input_data: Dataframe with all of the relevant KPI data
        :type input_data: pd.DataFrame
        """
        try:
            logger.info("Generating subgroups.")
            subgroups = self._get_subgroup_list(input_data)
            logger.info(f"Generated {len(subgroups)} subgroups.")

            # FIXME: Fix filtering logic
            filtered_subgroups = self._filter_subgroups(subgroups, input_data)
            logger.info(f"Filtered {len(filtered_subgroups)} subgroups.")

            logger.info(
                f"Subgroup filtering complted for KPI ID: {self.kpi_info['id']}",
                extra={
                    "generated": len(subgroups),
                    "filtered_in": len(filtered_subgroups),
                },
            )

            if self.debug:
                filtered_subgroups = filtered_subgroups[:DEBUG_MAX_SUBGROUPS]

        except Exception as e:
            self._checkpoint_failure("Subdimensions - Subdimension Generator", e)
            raise e
        else:
            self._checkpoint_success("Subdimensions - Subdimension Generator")

        try:
            logger.info("Running anomaly for filtered subgroups.")
            for subgroup in filtered_subgroups:
                try:
                    self._run_anomaly_for_series(input_data, "subdim", subgroup)
                except Exception:  # noqa: B902
                    logger.exception(f"Exception occured for: subdim - {subgroup}")
        except Exception as e:
            self._checkpoint_failure("Subdimensions - Anomaly Detector", e)
            raise e
        else:
            self._checkpoint_success("Subdimensions - Anomaly Detector")

    def _detect_data_quality(self, input_data: pd.DataFrame) -> None:
        """Perform anomaly detection for data quality metrics.

        :param input_data: Dataframe with all of the relevant KPI data
        :type input_data: pd.DataFrame
        """
        try:
            agg = self.kpi_info["aggregation"]

            if self._preaggregated:
                dq_list = ["count"]
            else:
                dq_list = ["max", "count", "mean"] if agg != "mean" else ["max", "count"]
            is_categorical_metric = (
                1 if input_data[self.kpi_info["metric"]].dtypes == "object" else 0
            )
            if agg == "count" and is_categorical_metric:
                dq_list = []
        except Exception as e:
            self._checkpoint_failure("Data Quality - Preprocessor", e)
            raise e
        else:
            self._checkpoint_success("Data Quality - Preprocessor")

        try:
            logger.info("Running anomaly for data quality subgroups.")
            for dq in dq_list:
                try:
                    self._run_anomaly_for_series(input_data, "dq", dq)
                except Exception:  # noqa: B902
                    logger.exception(f"Exception occured for: data quality - {dq}")
        except Exception as e:
            self._checkpoint_failure("Data Quality - Anomaly Detector", e)
            raise e
        else:
            self._checkpoint_success("Data Quality - Anomaly Detector")

    def _checkpoint_success(self, checkpoint: str, flag=True):
        if flag:
            if self._task_id is not None:
                checkpoint_success(
                    self._task_id, self.kpi_info["id"], "Anomaly", checkpoint
                )
            logger.info(
                "(Task: %s, KPI: %d)" " Anomaly - %s - Success",
                str(self._task_id),
                self.kpi_info["id"],
                checkpoint,
            )

    def _checkpoint_failure(self, checkpoint: str, e: Exception, flag=True):
        if flag:
            if self._task_id is not None:
                checkpoint_failure(
                    self._task_id,
                    self.kpi_info["id"],
                    "Anomaly",
                    checkpoint,
                    e,
                )
            logger.exception(
                "(Task: %s, KPI: %d) " "Anomaly - %s - Exception occured.",
                str(self._task_id),
                self.kpi_info["id"],
                checkpoint,
                exc_info=e,
            )

    @staticmethod
    def _to_run_overall(kpi_info: dict):
        run_optional = kpi_info.get("anomaly_params", {}).get("run_optional", None)

        return run_optional is None or run_optional["overall"] is True

    @staticmethod
    def _to_run_subdim(kpi_info: dict):
        run_optional = kpi_info.get("anomaly_params", {}).get("run_optional", None)
        return run_optional is None or run_optional["subdim"] is True

    @staticmethod
    def _to_run_data_quality(kpi_info: dict):
        run_optional = kpi_info.get("anomaly_params", {}).get("run_optional", None)

        return run_optional is None or run_optional["data_quality"] is True

    def detect(self) -> None:
        """Perform the anomaly detection for given KPI."""
        kpi_id = self.kpi_info["id"]

        logger.info(f"Performing anomaly detection for KPI ID: {kpi_id}")

        model_name = self.kpi_info["anomaly_params"]["model_name"]
        logger.debug(f"Anomaly Model is {model_name}")

        logger.info(f"Loading Input Data for KPI {kpi_id}")
        try:
            input_data = self._load_anomaly_data()
        except Exception as e:
            self._checkpoint_failure("Data Loader", e)
            raise e
        else:
            self._checkpoint_success("Data Loader")

        if self.kpi_info["scheduler_params"]["scheduler_frequency"] == "H":
            logger.info(f"Creating Hourly Input Dataframe for KPI {kpi_id}")
            input_data = self._create_hourly_input_data(input_data)
            logger.info(f"Last Data Point for Hourly Input Dataframe for KPI {self.end_date}")

        logger.info(f"Loaded {len(input_data)} rows of input data.")

        if self._to_run_overall(self.kpi_info):
            logger.info(f"Running anomaly for overall KPI {kpi_id}")
            self._run_anomaly_for_series(input_data, "overall")

        if self._to_run_subdim(self.kpi_info):
            logger.info(f"Running anomaly for subdims KPI {kpi_id}")
            self._detect_subdimensions(input_data)

        if self._to_run_data_quality(self.kpi_info):
            logger.info(f"Running anomaly for dq KPI {kpi_id}")
            self._detect_data_quality(input_data)

    @staticmethod
    def total_tasks(kpi: Kpi):
        """Return the total number of sub-tasks for given KPI.

        Args:
            kpi (Kpi): Kpi object to get no. of sub-tasks for.
        """
        kpi_info = kpi.as_dict

        # start, end, alert trigger, data loader
        num = 4
        if AnomalyDetectionController._to_run_overall(kpi_info):
            num += 3
        if AnomalyDetectionController._to_run_subdim(kpi_info):
            num += 2
        if AnomalyDetectionController._to_run_data_quality(kpi_info):
            num += 2

        return num
