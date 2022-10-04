"""Provides the EWMADModel for anomaly detection."""

import pandas as pd

from chaos_genius.core.anomaly.models import AnomalyModel
from chaos_genius.core.anomaly.utils import get_timedelta

EWMASENS = {
    "high": 0.1,
    "medium": 0.2,
    "low": 0.4,
}

EWMAFREQ = {
    "H": 24,
    "D": 4,
}


class EWMAModel(AnomalyModel):
    """EWSTD model for anomaly detection."""

    def __init__(self, *args, model_kwargs={}, **kwargs):
        """Initialize the EWSTDModel.

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
        pred_df: pd.DataFrame = None
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
        num_dev = EWMASENS[sensitivity.lower()]

        if pred_df is None:
            ew_mean = df["y"].ewm(span=EWMAFREQ[frequency]).mean().iloc[-1]
            threshold_u = ew_mean + (num_dev * ew_mean)
            threshold_l = ew_mean - (num_dev * ew_mean)
            forecast_value = (threshold_l + threshold_u)/2
            forecast_time = df['dt'].iloc[-1] + get_timedelta(frequency, 1)
            df = pd.concat(
                [
                    df,
                    pd.DataFrame({'dt': forecast_time, 'y': forecast_value}, index=[0])
                ],
                ignore_index=True
            )

        df['ew_mean'] = df["y"].ewm(span=EWMAFREQ[frequency]).mean()
        df['yhat_lower'] = df['ew_mean'] - (num_dev * df['ew_mean'])
        df['yhat_upper'] = df['ew_mean'] + (num_dev * df['ew_mean'])
        df['yhat'] = (df['yhat_lower'] + df['yhat_upper'])/2

        df = df[['dt', 'yhat', 'yhat_lower', 'yhat_upper']]

        return df
