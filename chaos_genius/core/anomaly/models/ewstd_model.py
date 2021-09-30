import pandas as pd

from chaos_genius.core.anomaly.models import AnomalyModel
from chaos_genius.core.anomaly.utils import get_timedelta

EWSTDSENS = {
    'high': 0.8,
    'medium': 0.9,
    'low': 0.95
}


class EWSTDModel(AnomalyModel):
    def __init__(self, *args, model_kwargs={}, **kwargs):
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
        df = df.rename(columns={'dt': 'ds', 'y': 'y'})

        # span = window size
        ew_mean = df["y"].ewm(span=len(df)).mean().iloc[-1]
        ew_std_dev = df["y"].ewm(span=len(df)).std().iloc[-1]

        num_dev = EWSTDSENS[sensitivity.lower()]
        num_dev_u = None
        num_dev_l = None

        if num_dev_u is None:
            num_dev_u = num_dev
        if num_dev_l is None:
            num_dev_l = num_dev

        threshold_u = ew_mean + (num_dev_u * ew_std_dev)
        threshold_l = ew_mean - (num_dev_l * ew_std_dev)

        if pred_df is None:
            forecast_time = df['ds'].iloc[-1] + get_timedelta(frequency, 1)
            forecast_value = (threshold_l + threshold_u)/2
            df = df.append(
                {'ds': forecast_time, 'y': forecast_value}, ignore_index=True)

        df['yhat_lower'] = threshold_l
        df['yhat_upper'] = threshold_u
        df['yhat'] = (threshold_l + threshold_u)/2

        df_anomaly = self._detect_anomalies(df)

        df_anomaly = df_anomaly[['ds', 'yhat', 'yhat_lower', 'yhat_upper']]

        return df_anomaly.rename(columns={
            'ds': 'dt',
            'yhat': 'y',
            'yhat_lower': 'yhat_lower',
            'yhat_upper': 'yhat_upper'
        })

    def _detect_anomalies(self, forecast):
        forecasted = forecast[['ds', 'yhat',
                               'yhat_lower', 'yhat_upper', 'y']].copy()
        forecasted['anomaly'] = 0
        forecasted.loc[forecasted['y'] >
                       forecasted['yhat_upper'], 'anomaly'] = 1
        forecasted.loc[forecasted['y'] <
                       forecasted['yhat_lower'], 'anomaly'] = -1

        # anomaly importances

        forecasted['importance'] = 0
        forecasted.loc[forecasted['anomaly'] == 1, 'importance'] = \
            (forecasted['y'] - forecasted['yhat_upper'])/forecast['y']

        forecasted.loc[forecasted['anomaly'] == -1, 'importance'] = \
            (forecasted['yhat_lower'] - forecasted['y'])/forecast['y']

        return forecasted
