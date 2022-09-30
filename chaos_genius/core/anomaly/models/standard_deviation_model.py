"""Provides the Standard Deviation model for anomaly detection."""

import pandas as pd

from chaos_genius.core.anomaly.models import AnomalyModel
from chaos_genius.core.anomaly.utils import get_timedelta

STDSENS = {"high": 0.8, "medium": 0.9, "low": 0.95}


class StandardDeviationModel(AnomalyModel):
    """Standard Deviation model for anomaly detection."""

    def __init__(self, *args, model_kwargs={}, **kwargs) -> None:
        """Initialize the StandardDeviationModel.

        :param model_kwargs: model specific configuration, defaults to {}
        :type model_kwargs: dict, optional
        """
        super().__init__(*args, **kwargs)
        self.model_kwargs = model_kwargs

    def predict(
        self,
        df: pd.DataFrame,
        sensitivity: str,
        frequency: str,
        pred_df: pd.DataFrame = None,
    ) -> pd.DataFrame:
        """Predict anomalies on data.

        If pred_df is None, will predict on the last data point.

        :param df: Input Dataframe with dt, y columns
        :type df: pd.DataFrame
        :param sensitivity: sensitivity to use for anomaly detection
        :type sensitivity: str
        :param frequency: frequency to use in the model
        :type frequency: str
        :param pred_df: dataframe to predict on, defaults to None
        :type pred_df: pd.DataFrame, optional
        :return: Output Dataframe with dt, y, yhat_lower, yhat_upper
        columns
        :rtype: pd.DataFrame
        """
        mean = df["y"].mean()
        std_dev = df["y"].std()

        num_dev = STDSENS[sensitivity.lower()]
        num_dev_u = None
        num_dev_l = None

        if num_dev_u is None:
            num_dev_u = num_dev
        if num_dev_l is None:
            num_dev_l = num_dev

        threshold_u = mean + (num_dev_u * std_dev)
        threshold_l = mean - (num_dev_l * std_dev)

        if pred_df is None:
            forecast_time = df["dt"].iloc[-1] + get_timedelta(frequency, 1)
            forecast_value = (threshold_l + threshold_u) / 2
            df = pd.concat(
                [
                    df,
                    pd.DataFrame({'dt': forecast_time, 'y': forecast_value}, index=[0])
                ],
                ignore_index=True
            )

        df["yhat_lower"] = threshold_l
        df["yhat_upper"] = threshold_u
        df["yhat"] = (threshold_l + threshold_u) / 2

        df_anomaly = self._detect_anomalies(df)
        df_anomaly = df_anomaly[["dt", "yhat", "yhat_lower", "yhat_upper"]]

        return df_anomaly

    def _detect_anomalies(self, forecast):
        forecasted = forecast[["ds", "yhat", "yhat_lower", "yhat_upper", "y"]].copy()
        forecasted["anomaly"] = 0

        forecasted.loc[forecasted["y"] > forecasted["yhat_upper"], "anomaly"] = 1

        forecasted.loc[forecasted["y"] < forecasted["yhat_lower"], "anomaly"] = -1

        # anomaly importances

        forecasted["importance"] = 0
        forecasted.loc[forecasted["anomaly"] == 1, "importance"] = (
            forecasted["y"] - forecasted["yhat_upper"]
        ) / forecast["y"]

        forecasted.loc[forecasted["anomaly"] == -1, "importance"] = (
            forecasted["yhat_lower"] - forecasted["y"]
        ) / forecast["y"]

        return forecasted
