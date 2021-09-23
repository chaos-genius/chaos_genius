import numpy as np
import pandas as pd
from statsmodels.tsa.exponential_smoothing.ets import ETSModel

from chaos_genius.core.anomaly.models import AnomalyModel

ETS_SENS = {"high": 0.8, "medium": 0.9, "low": 0.95}

ETS_FREQ = {"hourly": "H", "daily": "D"}


class ExpTSModel(AnomalyModel):
    def __init__(self, *args, model_kwargs={}, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        self.model_kwargs = model_kwargs

    def predict(
        self,
        df: pd.DataFrame,
        sensitivity,
        frequency,
        pred_df: pd.DataFrame = None
    ) -> pd.DataFrame:
        """Predict anomalies on data.

        :param df: Input Dataframe with dt, y columns
        :type df: pd.DataFrame
        :return: Output Dataframe with dt, y, yhat_lower, yhat_upper
        columns
        :rtype: pd.DataFrame
        """
        # ETS Model only accepts double value
        df["y"] = df["y"].astype(np.float64)
        x = df.set_index("dt").iloc[:, 0]
        ets_model = ETSModel(
            x, freq=ETS_FREQ[frequency.lower()], **self.model_kwargs
        ).fit(disp=0)

        if pred_df is None:
            forecast = ets_model.get_prediction(end=len(df))
        else:
            forecast = ets_model.get_prediction(end=len(df) - 1)

        forecast_df = forecast.summary_frame(
            alpha=1 - ETS_SENS[sensitivity.lower()])
        forecast_df = forecast_df.reset_index().rename(
            columns={
                "index": "dt",
                "mean": "y",
                "pi_lower": "yhat_lower",
                "pi_upper": "yhat_upper",
            }
        )

        return forecast_df
