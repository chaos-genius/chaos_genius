import pandas as pd
from neuralprophet import NeuralProphet

from chaos_genius.core.anomaly.models import AnomalyModel


class NeuralProphetModel(AnomalyModel):
    def __init__(self, *args, model_kwargs={}, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        self.model = None
        self.prevModel = None
        self.model_kwargs = model_kwargs

    def predict(
        self, df: pd.DataFrame,
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
        frequency = self.model_kwargs.get('freq', 'D')
        df = df.rename(columns={"dt": "ds", "y": "y"})

        # TODO: add support for customizable seasonality here
        self.model = NeuralProphet()
        self.model.fit(df, freq=frequency)

        if pred_df is None:
            future = self.model.make_future_dataframe(
                df=df, periods=1, n_historic_predictions=True)
        else:
            future = self.model.make_future_dataframe(
                df=df, periods=0, n_historic_predictions=True)

        forecast = self.model.predict(future)
        forecast = forecast[["ds", "y", "yhat1"]].rename(
            {"yhat1": "yhat"}, axis=1)

        # adding confidence intervals
        mean = forecast["yhat"].mean()
        stddevi = forecast["yhat"].std()
        num_devi = self.model_kwargs.get('numDevi', 2)
        num_devi_u = self.model_kwargs.get('numDevi_u')
        num_devi_l = self.model_kwargs.get('numDevi_l')

        if num_devi_u is None:
            num_devi_u = num_devi
        if num_devi_l is None:
            num_devi_l = num_devi
        threshold_u = mean + (num_devi_u * stddevi)
        threshold_l = mean - (num_devi_l * stddevi)
        forecast['yhat_lower'] = threshold_l
        forecast['yhat_upper'] = threshold_u
        forecast = forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']]

        return forecast.rename(columns={
            'ds': 'dt',
            'yhat': 'y'
        })
