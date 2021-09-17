import pandas as pd
import numpy as np
from statsmodels.tsa.exponential_smoothing.ets import ETSModel

from chaos_genius.core.anomaly.models import AnomalyModel

ETSSENS = {
    "high": 0.8,
    "medium": 0.9,
    "low": 0.95
}

ETSFREQ = {
    'hourly': 'H',
    'daily': 'D'
}

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
        """Takes in pd.DataFrame with 2 columns, dt and y, and returns a
        pd.DataFrame with 4 columns, dt, y, and yhat_lower, yhat_upper.

        :param df: Input Dataframe with dt, y columns
        :type df: pd.DataFrame
        :return: Output Dataframe with dt, y, yhat_lower, yhat_upper
        columns
        :rtype: pd.DataFrame
        """
        #ETS Model only accepts double value
        df['y'] = df['y'].astype(np.float64)
        x = df.set_index('dt').iloc[:,0]
        ETS_model = ETSModel(x, 
                             freq=ETSFREQ[frequency.lower()], 
                             **self.model_kwargs).fit(disp=0)

        if pred_df is None:
            forecast = ETS_model.get_prediction(end = len(df))
        else:
            forecast = ETS_model.get_prediction(end = len(df)-1)
        
        forecast_df = forecast.summary_frame(alpha=1-ETSSENS[sensitivity.lower()])
        forecast_df = forecast_df.reset_index().rename(columns={'index': 'dt',
                                                                "mean":'y',
                                                                "pi_lower":'yhat_lower',
                                                                "pi_upper":'yhat_upper'})
  
        return forecast_df