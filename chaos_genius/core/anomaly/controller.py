"""Provides AnomalyDetectionController to compute Anomaly Detection."""

from datetime import datetime

import pandas as pd

from chaos_genius.core.anomaly.constants import RESAMPLE_FREQUENCY
from chaos_genius.core.anomaly.processor import ProcessAnomalyDetection
from chaos_genius.core.anomaly.utils import (fill_data, get_anomaly_df,
                                             get_dq_missing_data,
                                             get_last_date_in_db)
from chaos_genius.databases.models.anomaly_data_model import (
    AnomalyDataOutput, db)
from chaos_genius.databases.models.data_source_model import DataSource

FILTER_MAX_SUBGROUPS = 100

DEBUG_MAX_SUBGROUPS = 10


class AnomalyDetectionController(object):
    """Controller class for performing Anomaly Detection."""

    def __init__(
        self,
        kpi_info: dict,
        end_date: datetime = None,
        save_model: bool = False,
        debug: bool = False
    ):
        """Initialize the controller.

        :param kpi_info: dictionary with information on the kpi
        :type kpi_info: dict
        :param end_date: end date to perform anomaly detection for, defaults to
        None
        :type end_date: datetime, optional
        :param save_model: whether to save the model or not, defaults to False
        :type save_model: bool, optional
        :param debug: enable debugging outputs, defaults to False
        :type debug: bool, optional
        """
        self.kpi_info = kpi_info

        # TODO: Add these in kpi_info
        self.kpi_info["freq"] = self.kpi_info.get("freq", "D")

        self.save_model = save_model
        self.end_date = end_date
        self.debug = self.kpi_info["anomaly_params"].get("debug", False)
        if self.debug == "True":
            self.debug = True
        if self.debug == "False":
            self.debug = False
        self.slack = self.kpi_info["anomaly_params"].get("slack", 3)

    def _load_anomaly_data(self) -> pd.DataFrame:
        """Load KPI data, preprocess it and return it for anomaly detection.

        :return: Dataframe with all of KPI's data for the last
        N days/hours
        :rtype: pd.DataFrame
        """
        conn = DataSource.get_by_id(self.kpi_info["data_source"])

        # If end_date is passed to self, use that
        # Otherwise check if kpi_info has end_date
        # If that also fails, use today as end_date
        end_date = None
        if self.end_date is None:
            if self.kpi_info["is_static"]:
                end_date = self.kpi_info.get(
                    "static_params", {}).get("end_date")
                if end_date is not None:
                    end_date = datetime.strptime(end_date, "%Y-%m-%d %H:%M:%S")

            if end_date is None:
                end_date = datetime.now()
        else:
            end_date = self.end_date

        last_date_in_db = self._get_last_date_in_db("overall")

        df = get_anomaly_df(
            self.kpi_info,
            conn.as_dict,
            last_date_in_db,
            end_date,
            self.kpi_info["anomaly_params"]["period"],
        )

        dt_col = self.kpi_info["datetime_column"]

        df[dt_col] = pd.to_datetime(df[dt_col])

        return df

    def _get_last_date_in_db(
        self,
        series: str,
        subgroup: str = None
    ) -> datetime:
        """Return the last date for which we have data for the given series.

        :param series: Type of series
        :type series: str
        :param subgroup: Subtype of series
        :type subgroup: str
        :return: Last date for which we have data for the given series
        :rtype: datetime
        """
        return get_last_date_in_db(self.kpi_info["id"], series, subgroup)

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

        sensitivity = self.kpi_info["anomaly_params"].get(
            "sensitivity", "medium")

        return ProcessAnomalyDetection(
            model_name,
            input_data,
            last_date,
            self.kpi_info["anomaly_params"]["period"],
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

        anomaly_output.to_sql(
            AnomalyDataOutput.__tablename__, db.engine, if_exists="append"
        )

    def _get_subgroup_list(self, input_data: pd.DataFrame) -> list:
        """Return list of subgroups for which to run anomaly detection.

        :return: List of subgroups
        :rtype: list
        """
        valid_subdims = []
        for dim in self.kpi_info["dimensions"]:
            if len(input_data[dim].unique()) >= 100:
                print(f"{dim} has a cardinality over 100 skipping {dim}")
            else:
                valid_subdims.append(dim)

        results = []

        def querify(x):
            q = [f'`{y[0]}`=="{y[1]}"' for y in x]
            return " and ".join(q)

        def func(curr_values: list, curr_col_no: int, length_of_segment):

            if curr_col_no >= len(valid_subdims):
                if len(curr_values) == length_of_segment:
                    results.append(querify(curr_values))
                return -1

            if len(curr_values) == length_of_segment:
                results.append(querify(curr_values))
                return -1

            func(curr_values, curr_col_no + 1, length_of_segment)

            unique_valid_subdims = list(
                input_data.loc[:, valid_subdims[curr_col_no]].unique())

            for val in unique_valid_subdims:
                func(
                    curr_values + [(valid_subdims[curr_col_no], val)],
                    curr_col_no + 1,
                    length_of_segment,
                )

        for i in range(1, len(valid_subdims) + 1):
            func([], 0, i)

        return results

    def _filter_subgroups(
        self,
        subgroups: list,
        input_data: pd.DataFrame
    ) -> list:
        """Filter out irrelevant subgroups.

        :param subgroups: List of subgroups
        :type subgroups: list
        :return: List of subgroups
        :rtype: list
        """
        grouped_input_data = input_data.groupby(
            self.kpi_info["dimensions"]).agg(
                {self.kpi_info["metric"]: "count"})

        filtered_subgroups = []

        for subgroup in subgroups:
            try:
                filter_data_len = grouped_input_data.query(subgroup)[
                    self.kpi_info["metric"]
                ].sum()
                period = self.kpi_info["anomaly_params"]["period"]
                if filter_data_len >= period:
                    filtered_subgroups.append((subgroup, filter_data_len))
            except IndexError:
                pass

        filtered_subgroups.sort(key=lambda x: x[1], reverse=True)

        return [x[0] for x in filtered_subgroups[:FILTER_MAX_SUBGROUPS]]

    def _run_anomaly_for_series(
        self, input_data: pd.DataFrame, series: str, subgroup: str = None
    ) -> None:
        """Run anomaly detection for the given series.

        :param series: Type of series
        :type series: str
        :param subgroup: Subgroup of the KPI
        :type subgroup: str
        """
        dt_col = self.kpi_info["datetime_column"]
        metric_col = self.kpi_info["metric"]
        freq = self.kpi_info["anomaly_params"]["ts_frequency"]
        agg = self.kpi_info["aggregation"]
        period = self.kpi_info["anomaly_params"]["period"]

        series_data = None

        last_date = self._get_last_date_in_db(series, subgroup)
        # if last_date is None:
        #     if "Tuesday" in subgroup:
        #         print(f"None subg: {series}, {subgroup}")

        if series == "dq":
            temp_input_data = input_data[[dt_col, metric_col]]
            temp_input_data = fill_data(
                temp_input_data,
                dt_col,
                metric_col,
                last_date,
                period,
                self.end_date,
                freq,
            )

            if subgroup == "missing":
                series_data = get_dq_missing_data(
                    temp_input_data,
                    dt_col,
                    metric_col,
                    RESAMPLE_FREQUENCY[freq]
                )

            else:
                series_data = (
                    temp_input_data.set_index(dt_col)
                    .resample(RESAMPLE_FREQUENCY[freq])
                    .agg({metric_col: subgroup})
                )

        elif series == "subdim":
            temp_input_data = input_data.query(subgroup)[[dt_col, metric_col]]
            temp_input_data = fill_data(
                temp_input_data,
                dt_col,
                metric_col,
                last_date,
                period,
                self.end_date,
                freq,
            )

            series_data = (
                temp_input_data.set_index(dt_col)
                .resample(RESAMPLE_FREQUENCY[freq])
                .agg({metric_col: agg})
            )

        elif series == "overall":
            temp_input_data = input_data[[dt_col, metric_col]]
            temp_input_data = fill_data(
                temp_input_data,
                dt_col,
                metric_col,
                last_date,
                period,
                self.end_date,
                freq,
            )

            series_data = (
                temp_input_data.set_index(dt_col)
                .resample(RESAMPLE_FREQUENCY[freq])
                .agg({metric_col: agg})
            )

        else:
            raise ValueError(
                f"series {series} not in ['dq', 'subdim', 'overall']")

        model_name = self.kpi_info["anomaly_params"]["model_name"]

        overall_anomaly_output = self._detect_anomaly(
            model_name, series_data, last_date, series, subgroup, freq
        )

        self._save_anomaly_output(overall_anomaly_output, series, subgroup)

    def detect(self) -> None:
        """Perform the anomaly detection for given KPI."""
        # TODO: Docstring
        if self.debug:
            print(self.kpi_info["anomaly_params"]["model_name"])

        input_data = self._load_anomaly_data()

        if self.debug:
            print("overall")

        self._run_anomaly_for_series(input_data, "overall")

        subgroups = self._get_subgroup_list(input_data)

        if self.debug:
            print(f"Generated {len(subgroups)} subgroups")

        # FIXME: Fix filtering logic
        filtered_subgroups = self._filter_subgroups(subgroups, input_data)

        if self.debug:
            print(f"Filtered {len(filtered_subgroups)} subgroups")

        if self.debug:
            filtered_subgroups = filtered_subgroups[:DEBUG_MAX_SUBGROUPS]

        for subgroup in filtered_subgroups:
            if self.debug:
                print(subgroup)

            try:
                self._run_anomaly_for_series(input_data, "subdim", subgroup)
            except Exception as e:  # noqa: B902
                print(e)

        agg = self.kpi_info["aggregation"]
        dq_list = ["max", "count", "mean"] \
            if agg != "mean" else ["max", "count"]
        for dq in dq_list:
            if self.debug:
                print(dq)

            try:
                self._run_anomaly_for_series(input_data, "dq", dq)
            except Exception as e:  # noqa: B902
                print(e)
