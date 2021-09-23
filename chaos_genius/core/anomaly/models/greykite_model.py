import warnings

import pandas as pd
from greykite.framework.templates.autogen.forecast_config import (
    ForecastConfig, MetadataParam)
from greykite.framework.templates.forecaster import Forecaster
from greykite.framework.templates.model_templates import ModelTemplateEnum

from chaos_genius.core.anomaly.models import AnomalyModel

warnings.filterwarnings("ignore")

GKSENS = {
    "high": 0.8,
    "medium": 0.9,
    "low": 0.95
}

GKFREQ = {
    'hourly': 'H',
    'daily': 'D'
}


class GreyKiteModel(AnomalyModel):

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
        df = df.rename(columns={"dt": "ds", "y": "y"})
        metadata = MetadataParam(
            time_col="ds",
            value_col="y",
            freq=GKFREQ[frequency.lower()]
        )

        # Creates forecasts and stores the result
        forecaster = Forecaster()

        # result is also stored as forecaster.forecast_result
        result = forecaster.run_forecast_config(
            df=df,
            config=ForecastConfig(
                model_template=ModelTemplateEnum.SILVERKITE.name,
                forecast_horizon=1,  # forecasts 1 step
                **self.model_kwargs,
                coverage=GKSENS[sensitivity.lower()],
                metadata_param=metadata
            )
        )

        forecast_df = result.forecast.df
        forecast_df = forecast_df[
            ['ds', 'forecast', 'forecast_lower', 'forecast_upper']]
        forecast_df = forecast_df.rename(columns={
            'ds': 'dt',
            'forecast': 'y',
            'forecast_lower': 'yhat_lower',
            'forecast_upper': 'yhat_upper'
        })

        if pred_df is not None:
            return forecast_df.iloc[:-1]

        return forecast_df
