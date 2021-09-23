import pandas as pd

from chaos_genius.core.anomaly.models import AnomalyModel
from chaos_genius.core.anomaly.utils import get_timedelta

STDSENS = {"high": 0.8, "medium": 0.9, "low": 0.95}


class StdDeviModel(AnomalyModel):
    def __init__(self, *args, model_kwargs={}, **kwargs):
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

        :param df: Input Dataframe with dt, y columns
        :type df: pd.DataFrame
        :return: Output Dataframe with dt, y, yhat_lower, yhat_upper
        columns
        :rtype: pd.DataFrame
        """
        df = df.rename(columns={"dt": "ds", "y": "y"})

        mean = df["y"].mean()
        stddevi = df["y"].std()

        # TODO: Set values for numDevi_u, numDevi_l in sensitivity
        num_devi = STDSENS[sensitivity.lower()]
        num_devi_u = None
        num_devi_l = None

        if num_devi_u is None:
            num_devi_u = num_devi
        if num_devi_l is None:
            num_devi_l = num_devi

        threshold_u = mean + (num_devi_u * stddevi)
        threshold_l = mean - (num_devi_l * stddevi)

        # TODO: COMMIT AS PART OF ANOMALY MAJOR FIX
        # MAYBE COMMIT AS PREDICTION MAKER IN StdDevi
        if pred_df is None:
            forecast_time = df["ds"].iloc[-1] + get_timedelta(frequency, 1)
            forecast_value = (threshold_l + threshold_u) / 2
            df = df.append(
                {"ds": forecast_time, "y": forecast_value}, ignore_index=True
            )

        df["yhat_lower"] = threshold_l
        df["yhat_upper"] = threshold_u
        df["yhat"] = (threshold_l + threshold_u) / 2

        df_anomaly = self._detect_anomalies(df)
        df_anomaly = df_anomaly[["ds", "yhat", "yhat_lower", "yhat_upper"]]

        return df_anomaly.rename(
            columns={
                "ds": "dt",
                "yhat": "y",
                "yhat_lower": "yhat_lower",
                "yhat_upper": "yhat_upper",
            }
        )

    def _detect_anomalies(self, forecast):
        forecasted = forecast[
            ["ds", "yhat", "yhat_lower", "yhat_upper", "y"]].copy()
        forecasted["anomaly"] = 0

        forecasted.loc[
            forecasted["y"] > forecasted["yhat_upper"], "anomaly"] = 1

        forecasted.loc[
            forecasted["y"] < forecasted["yhat_lower"], "anomaly"] = -1

        # anomaly importances

        forecasted["importance"] = 0
        forecasted.loc[forecasted["anomaly"] == 1, "importance"] = (
            forecasted["y"] - forecasted["yhat_upper"]
        ) / forecast["y"]

        forecasted.loc[forecasted["anomaly"] == -1, "importance"] = (
            forecasted["yhat_lower"] - forecasted["y"]
        ) / forecast["y"]

        return forecasted
