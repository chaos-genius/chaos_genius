import pandas as pd

from chaos_genius.core.anomaly.models import AnomalyModel

class StdDeviModel(AnomalyModel):
    def __init__(self, *args, model_kwargs = {}, **kwargs):
        super().__init__(*args, **kwargs)
        self.model_kwargs = model_kwargs
    def predict(self, df: pd.DataFrame, pred_df: pd.DataFrame = None) -> pd.DataFrame:
        """Takes in pd.DataFrame with 2 columns, dt and y, and returns a 
        pd.DataFrame with 3 columns, dt, y, and yhat_lower, yhat_upper.

        :param df: Input Dataframe with dt, y columns
        :type df: pd.DataFrame
        :return: Output Dataframe with dt, y, yhat_lower, yhat_upper 
        columns
        :rtype: pd.DataFrame
        """
        df = df.rename(columns = {'dt':'ds', 'y':'y'})
        mean = df["y"].mean()
        stddevi =  df["y"].std()
        numDevi = self.model_kwargs.get('numDevi', 2)
        numDevi_u = self.model_kwargs.get('numDevi_u')
        numDevi_l = self.model_kwargs.get('numDevi_l')
        if numDevi_u is None:
            numDevi_u = numDevi
        if numDevi_l is None:
            numDevi_l = numDevi
        threshold_u = mean + (numDevi_u * stddevi)
        threshold_l = mean - (numDevi_l * stddevi)
        df['yhat_lower'] =  threshold_l
        df['yhat_upper'] = threshold_u
        df['yhat'] = (threshold_l + threshold_u)/2
        df_anomaly = self.detect_anomalies(df)
        df_anomaly =  df_anomaly[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].rename(columns = {
            'ds':'dt',
            'yhat':'y',
            'yhat_lower': 'yhat_lower',
            'yhat_upper': 'yhat_upper'
        })
        return df_anomaly
        
    def detect_anomalies(self, forecast):
        forecasted = forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper', 'y']].copy()
        forecasted['anomaly'] = 0
        forecasted.loc[forecasted['y'] > forecasted['yhat_upper'], 'anomaly'] = 1
        forecasted.loc[forecasted['y'] < forecasted['yhat_lower'], 'anomaly'] = -1

        #anomaly importances

        forecasted['importance'] = 0    
        forecasted.loc[forecasted['anomaly'] ==1, 'importance'] = \
            (forecasted['y'] - forecasted['yhat_upper'])/forecast['y']


        forecasted.loc[forecasted['anomaly'] ==-1, 'importance'] = \
            (forecasted['yhat_lower'] - forecasted['y'])/forecast['y']

        return forecasted
