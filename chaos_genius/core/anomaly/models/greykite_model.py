"""Provides the Greykite model for anomaly detection."""

import warnings

import pandas as pd
from greykite.framework.templates.autogen.forecast_config import (
    ForecastConfig,
    MetadataParam,
)
from greykite.framework.templates.forecaster import Forecaster
from greykite.framework.templates.model_templates import ModelTemplateEnum

from chaos_genius.core.anomaly.models import AnomalyModel

warnings.filterwarnings("ignore")

GKSENS = {"high": 0.8, "medium": 0.9, "low": 0.95}

GKFREQ = {"hourly": "H", "daily": "D", "d": "D", "h": "H"}


class GreyKiteModel(AnomalyModel):
    """EWSTD model for anomaly detection."""

    def __init__(self, *args, model_kwargs={}, **kwargs) -> None:
        """Initialize the GreyKiteModel.

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
        df = df.rename(columns={"dt": "ds", "y": "y"})
        metadata = MetadataParam(
            time_col="ds", value_col="y", freq=GKFREQ[frequency.lower()]
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
            ),
        )

        forecast_df = result.forecast.df
        forecast_df = forecast_df[
            ["ds", "forecast", "forecast_lower", "forecast_upper"]
        ]
        forecast_df = forecast_df.rename(
            columns={
                "ds": "dt",
                "forecast": "yhat",
                "forecast_lower": "yhat_lower",
                "forecast_upper": "yhat_upper",
            }
        )

        if pred_df is not None:
            return forecast_df.iloc[:-1]

        return forecast_df
