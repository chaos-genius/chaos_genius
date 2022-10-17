"""Provides processor class which computes anomaly detection."""
import datetime
import logging
from typing import Dict, Tuple, Union

import numpy as np
import pandas as pd

from chaos_genius.core.anomaly.constants import FREQUENCY_DELTA
from chaos_genius.core.anomaly.models import MODEL_MAPPER, AnomalyModel
from chaos_genius.core.anomaly.utils import bound_between, get_timedelta

logger = logging.getLogger(__name__)

ZSCORE_UPPER_BOUND = 3


class ProcessAnomalyDetection:
    """Processor class for computing anomaly detection."""

    def __init__(
        self,
        model_name: str,
        data: pd.DataFrame,
        last_date: datetime.datetime,
        period: int,
        table_name: str,
        freq: str,
        sensitivity: str,
        slack: int,
        series: str,
        subgroup: str = None,
        deviation_from_mean_dict: Dict = {},
        model_kwargs={},
    ):
        """Initialize the processor.

        :param model_name: model to use
        :type model_name: str
        :param data: dataframe to run anomaly detection on
        :type data: pd.DataFrame
        :param last_date: last date for which anomaly was run
        :type last_date: datetime.datetime
        :param period: period of data points to train model on
        :type period: int
        :param table_name: table name of data
        :type table_name: str
        :param freq: frequency of data
        :type freq: str
        :param sensitivity: sensitivity to use for anomaly bounds
        :type sensitivity: str
        :param slack: slack in days for computing anomaly
        :type slack: int
        :param series: series name
        :type series: str
        :param subgroup: subgroup identifier, defaults to None
        :type subgroup: str, optional
        :param deviation_from_mean_dict: anomaly timestamps and their respective
            deviation from mean values for overall time series.
        :type deviation_from_mean_dict: Dict[datetime, float], defaults to empty dict
        :param model_kwargs: parameters to initialize the model with, defaults to {}
        :type model_kwargs: dict, optional
        """
        self.model_name = model_name
        self.input_data = data
        self.last_date = last_date
        self.period = period
        self.table_name = table_name
        self.series = series
        self.subgroup = subgroup
        self.model_path = self._gen_model_save_path()
        self.model_kwargs = model_kwargs
        self.freq = freq
        self.sensitivity = sensitivity
        self.slack = slack
        self.deviation_from_mean_dict = deviation_from_mean_dict

    def predict(self) -> Union[Tuple[pd.DataFrame, Dict], pd.DataFrame]:
        """Run the prediction for anomalies.

        :return: dataframe with detected anomaly_timestamp,
            dictionary of anomaly timestamps with deviation from mean values
        :rtype: Union[(pd.DataFrame, Dict), pd.DataFrame]
        """
        model = self._get_model()

        logger.debug(
            f"Running prediction and metrics for {self.series}-{self.subgroup}"
        )
        anomaly_df = self._predict(model)

        self._save_model(model)

        if self.series == "overall":
            return anomaly_df, self.deviation_from_mean_dict

        return anomaly_df

    def _predict(self, model: AnomalyModel) -> pd.DataFrame:
        """Run the prediction for anomalies.

        :param model: Model used for anomaly detection
        :type model: AnomalyModel
        :return: dataframe with detected anomaly_timestamp and metrics
        :rtype: pd.DataFrame
        """
        input_data = self.input_data

        pred_series_schema = {
            "dt": np.datetime64,
            "y": float,
            "yhat": float,
            "yhat_lower": float,
            "yhat_upper": float,
            "anomaly": int,
            "severity": float,
            "impact": float,
        }
        pred_series = pd.DataFrame(columns=pred_series_schema.keys()).astype(
            pred_series_schema
        )

        input_last_date = input_data["dt"].iloc[-1]
        input_first_date = input_data["dt"].iloc[0]
        max_period = get_timedelta(self.freq, self.period)

        logger.info(
            f"Prediction data stats for {self.series}-{self.subgroup}",
            extra={
                "period": self.period,
                "inp_len": len(input_data),
                "slack": self.slack,
                "start_date": input_first_date,
                "end_date": input_last_date,
                "last_date": self.last_date,
            },
        )

        if self.last_date is None:
            # pass complete input data frame in here as pred_df
            if self.period - len(input_data) <= self.slack:

                prediction = model.predict(
                    input_data,
                    self.sensitivity,
                    self.freq,
                    pred_df=input_data,
                )
                prediction["y"] = input_data["y"]

                pred_series = self._calculate_metrics(
                    prediction, prediction["y"].mean(), prediction["y"].std()
                )
            else:
                logger.warning(f"Insufficient slack for {self.series}-{self.subgroup}")

        else:
            date_to_predict = self.last_date + datetime.timedelta(
                **FREQUENCY_DELTA[self.freq]
            )
            while date_to_predict <= input_last_date:
                curr_period = date_to_predict - input_first_date

                if curr_period >= max_period:
                    df = input_data[
                        (input_data["dt"] >= date_to_predict - max_period)
                        & (input_data["dt"] <= date_to_predict)
                    ]

                    prediction = model.predict(
                        df.iloc[:-1], self.sensitivity, self.freq
                    )
                    prediction["y"] = df["y"].to_list()

                    prediction = prediction.iloc[[-1]]

                    pred_series = pd.concat(
                        [
                            pred_series,
                            self._calculate_metrics(
                                prediction,
                                df.iloc[:-1]["y"].mean(),
                                df.iloc[:-1]["y"].std(),
                            )
                        ],
                        ignore_index=True,
                    )

                date_to_predict += datetime.timedelta(**FREQUENCY_DELTA[self.freq])

        return pred_series

    def _calculate_metrics(
        self, prediction_df: pd.DataFrame, mean: float, std_dev: float
    ) -> pd.DataFrame:
        """Calculate metrics (sevrity and impact) for the anomaly data.

        :param prediction_df: dataframe with predictions
        :type prediction_df: pd.DataFrame
        :param mean: average of the anomaly data
        :type mean: float
        :param std_dev: standard deviation of the anomaly data
        :type std_dev: float
        :return: dataframe with detected anomalies and metrics
        :rtype: pd.DataFrame
        """
        prediction_df = self._detect_anomalies(prediction_df)

        prediction_df["severity"], prediction_df["impact"] = 0.0, 0.0
        if std_dev == 0:
            return prediction_df

        prediction_df = self._compute_deviations(prediction_df, mean)

        prediction_df["zscore"] = prediction_df.apply(
            lambda x: self._compute_zscore(x, std_dev), axis=1
        )

        prediction_df["severity"] = prediction_df["zscore"].apply(
            lambda zscore: self._compute_severity(zscore)
        )

        if self.series == "subdim":
            prediction_df = self._compute_impact(prediction_df)

        prediction_df = prediction_df.drop(["zscore", "deviation_from_mean"], axis=1)

        return prediction_df

    def _detect_anomalies(self, pred_series: pd.DataFrame) -> pd.DataFrame:
        """Detect anomalous values in timeseries.

        :param pred_series: dataframe with predictions
        :type pred_series: pd.DataFrame
        :return: dataframe with detected anomalies
        :rtype: pd.DataFrame
        """
        pred_series["anomaly"] = 0
        high_sel = pred_series["y"] > pred_series["yhat_upper"]
        low_sel = pred_series["y"] < pred_series["yhat_lower"]
        # anomaly = 1, if value > upper bound of CI
        pred_series.loc[high_sel, "anomaly"] = 1
        # anomaly = -1, if value < lower bound of CI
        pred_series.loc[low_sel, "anomaly"] = -1

        return pred_series

    def _compute_deviations(
        self, prediction_df: pd.DataFrame, mean: float
    ) -> pd.DataFrame:
        """Calculate deviation of values from average of the data.

        :param prediction_df: dataframe with predictions and detected anomalies
        :type prediction_df: pd.DataFrame
        :param mean: average of the anomaly data
        :type mean: float
        :return: dataframe with deviation from mean values
        :rtype: pd.DataFrame
        """
        prediction_df["deviation_from_mean"] = prediction_df["y"] - mean

        if self.series == "overall":
            self.deviation_from_mean_dict.update(
                dict(
                    prediction_df.loc[prediction_df["anomaly"] != 0][
                        ["dt", "deviation_from_mean"]
                    ].values
                )
            )

        return prediction_df

    def _compute_zscore(self, row: pd.DataFrame, std_dev: float) -> float:
        """Calculate zscore for anomalous data.

        :param row: single row of anomaly dataframe
        :type row: pd.DataFrame
        :param std_dev: standard deviation of the anomaly data
        :type std_dev: float
        :return: zscore of the anomaly row data
        :rtype: float
        """
        if row["anomaly"] == 0:
            # No anomaly. Severity is 0
            return 0
        elif row["anomaly"] == 1:
            # Check num deviations from upper bound of CI
            zscore = (row["y"] - row["yhat_upper"]) / std_dev
        elif row["anomaly"] == -1:
            # Check num deviations from lower bound of CI
            zscore = (row["yhat_lower"] - row["y"]) / std_dev

        return zscore

    def _compute_severity(self, zscore: float) -> float:
        """Calculate severity given zscore.

        :param zscore: zscore of the anomaly data
        :type zscore: float
        :return: severity of the anomaly data
        :rtype: float
        """
        # Map zscore of 0-3 to 0-100
        severity = zscore * 100 / ZSCORE_UPPER_BOUND

        # Bound between min and max score
        # If above 100, we return 100; If below -100, we return -100
        return bound_between(0, severity, 100)

    def _compute_impact(self, prediction_df: pd.DataFrame) -> pd.DataFrame:
        """Calculate impact for sub-dimensional anomaly data.

        :param prediction_df: dataframe with predictions
        :type prediction_df: pd.DataFrame
        :return: dataframe with impact score
        :rtype: pd.DataFrame
        """
        for anomaly_date, deviation_from_mean in self.deviation_from_mean_dict.items():
            if deviation_from_mean == 0:
                continue

            prediction_df.loc[prediction_df["dt"] == anomaly_date, "impact"] = (
                (prediction_df["deviation_from_mean"] / deviation_from_mean)
                * prediction_df["zscore"]
            ).abs()

        return prediction_df

    def _get_model(self) -> AnomalyModel:
        """Return Anomaly Detection Model.

        :return: anomaly model
        :rtype: AnomalyModel
        """
        model = MODEL_MAPPER[self.model_name]
        try:
            return model.load(self.model_path, model_kwargs=self.model_kwargs)
        except NotImplementedError:
            return model(model_kwargs=self.model_kwargs)

    def _save_model(self, model: AnomalyModel) -> None:
        """Save Anomaly Detection Model.

        :param model: Anomaly Detection model to be saved
        :type model: AnomalyModel
        """
        try:
            model.save(self.model_path)
        except NotImplementedError:
            pass

    def _gen_model_save_path(self):
        if self.series == "overall":
            return f"./{self.table_name}/{self.subgroup}.mdl"
        else:
            return f"./{self.table_name}/{self.subgroup}_{self.series}.mdl"
