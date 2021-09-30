"""Provides processor class which computes anomaly detection."""
import datetime

import pandas as pd

from chaos_genius.core.anomaly.constants import FREQUENCY_DELTA, MODEL_MAPPER
from chaos_genius.core.anomaly.models import AnomalyModel
from chaos_genius.core.anomaly.utils import bound_between, get_timedelta

ZSCORE_UPPER_BOUND = 2.5


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
        :param model_kwargs: parameters to initialize the model with, defaults
        to {}
        :type model_kwargs: dict, optional
        """
        self.model_name = model_name
        self.input_data = data
        self.last_date = last_date
        self.period = period
        self.table_name = (table_name,)
        self.series = (series,)
        self.subgroup = subgroup
        self.model_path = self._gen_model_save_path()
        self.model_kwargs = model_kwargs
        self.freq = freq
        self.sensitivity = sensitivity
        self.slack = slack

    def predict(self) -> pd.DataFrame:
        """Run the prediction for anomalies.

        :return: dataframe with detected anomaly_timestamp
        :rtype: pd.DataFrame
        """
        model = self._get_model()

        pred_series = self._predict(model)

        anomaly_df = self._detect_severity(self._detect_anomalies(pred_series))

        self._save_model(model)

        return anomaly_df

    def _predict(self, model: AnomalyModel):

        # TODO: Write docstrings for entire class

        input_data = self.input_data

        pred_series = pd.DataFrame(
            columns=["dt", "y", "yhat_lower", "yhat_upper"])

        input_last_date = input_data["dt"].iloc[-1]
        input_first_date = input_data["dt"].iloc[0]
        max_period = get_timedelta(self.freq, self.period)

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
                pred_series = prediction

        else:

            while self.last_date <= input_last_date:
                curr_period = self.last_date - input_first_date

                if curr_period >= max_period:
                    df = input_data[
                        (input_data["dt"] >= self.last_date - max_period)
                        & (input_data["dt"] <= self.last_date)
                    ]

                    prediction = model.predict(
                        df.iloc[:-1], self.sensitivity, self.freq
                    )
                    to_append = prediction.iloc[-1].copy()
                    to_append.loc["y"] = df.iloc[-1]["y"]

                    pred_series = pred_series.append(
                        to_append, ignore_index=True)

                self.last_date += datetime.timedelta(
                    **FREQUENCY_DELTA[self.freq])

        return pred_series

    def _detect_anomalies(self, pred_series):
        pred_series["anomaly"] = 0
        high_sel = pred_series["y"] > pred_series["yhat_upper"]
        low_sel = pred_series["y"] < pred_series["yhat_lower"]
        pred_series.loc[high_sel, "anomaly"] = 1
        pred_series.loc[low_sel, "anomaly"] = -1

        return pred_series

    def _detect_severity(self, anomaly_prediction):
        std_dev = anomaly_prediction["y"].mean()

        anomaly_prediction["severity"] = 0
        anomaly_prediction["severity"] = anomaly_prediction.apply(
            lambda x: self._compute_severity(x, std_dev), axis=1
        )

        return anomaly_prediction

    def _compute_severity(self, row, std_dev):
        # TODO: Create docstring for these comments
        if row["anomaly"] == 0:
            # No anomaly. Severity is 0 ;)
            return 0
        elif row["anomaly"] == 1:
            # Check num deviations from upper bound of CI
            zscore = (row["y"] - row["yhat_upper"]) / std_dev
        elif row["anomaly"] == -1:
            # Check num deviations from lower bound of CI
            zscore = (row["y"] - row["yhat_lower"]) / std_dev

        # Scale zscore where 4 scales to 100; -4 scales to -100
        severity = zscore * 100 / ZSCORE_UPPER_BOUND
        severity = abs(severity)

        # Bound between min and max score
        # If above 100, we return 100; If below -100, we return -100
        return bound_between(0, severity, 100)

    def _get_model(self) -> AnomalyModel:
        model = MODEL_MAPPER[self.model_name]
        try:
            return model.load(self.model_path, model_kwargs=self.model_kwargs)
        except NotImplementedError:
            return model(model_kwargs=self.model_kwargs)

    def _save_model(
        self,
        model: AnomalyModel,
    ) -> None:
        try:
            model.save(self.model_path)
        except NotImplementedError:
            pass

    def _gen_model_save_path(self):
        if self.series == "overall":
            return f"./{self.table_name}/{self.subgroup}.mdl"
        else:
            return f"./{self.table_name}/{self.subgroup}_{self.series}.mdl"
