import pandas as pd

import prophet as pt
from prophet.serialize import model_to_json, model_from_json

from chaos_genius.core.anomaly.models import AnomalyModel
from chaos_genius.core.utils import suppress_stdout_stderr

PROPHETSENS = {
    "high": 0.8,
    "medium": 0.9,
    "low": 0.95
}

PROPHETFREQ = {
    'hourly': 'H',
    'daily': 'D'
}

class ProphetModel(AnomalyModel):
    def __init__(self, *args, model_kwargs={}, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        self.model = None
        self.prevModel = None
        self.model_kwargs = model_kwargs

    def predict(
        self,
        df: pd.DataFrame,
        sensitivity, 
        frequency, 
        pred_df: pd.DataFrame = None
    ) -> pd.DataFrame:
        """Takes in pd.DataFrame with 2 columns, dt and y, and returns a
        pd.DataFrame with 3 columns, dt, y, and yhat_lower, yhat_upper.

        :param df: Input Dataframe with dt, y columns
        :type df: pd.DataFrame
        :return: Output Dataframe with dt, y, yhat_lower, yhat_upper
        columns
        :rtype: pd.DataFrame
        """
        df = df.rename(columns={"dt": "ds", "y": "y"})

        # TODO: Add seasonality to model kwargs
        with suppress_stdout_stderr():
            self.model = pt.Prophet(
                yearly_seasonality=False,
                daily_seasonality=True,
                interval_width = PROPHETSENS[sensitivity],
                **self.model_kwargs).fit(df)

        if pred_df is None:
            future = self.model.make_future_dataframe(periods=1,
                freq = PROPHETFREQ[frequency.lower()],
            )
        else:
            future = self.model.make_future_dataframe(periods=0,
                freq = PROPHETFREQ[frequency.lower()],
            )
        
        forecast = self.model.predict(future)
        forecast = forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']]
        
        return forecast.rename(columns={
            'ds': 'dt',
            'yhat': 'y',
            'yhat_lower': 'yhat_lower',
            'yhat_upper': 'yhat_upper'
        })

    def stan_init(self, model):
        """Retrieve parameters from a trained model in the format
        used to initialize a new Stan model.

        :param model: A trained model of the Prophet class
        :type model: Prophet model
        :return: dictionary containing the retrieved parameters of model
        :rtype: dict
        Parameters
        ----------
        m: A trained model of the Prophet class.

        Returns
        -------
        A Dictionary containing retrieved parameters of m.

        """
        res1_cols = ['k', 'm', 'sigma_obs']
        res1 = {pname: model.params[pname][0][0] for pname in res1_cols}
        
        res2_cols = ['delta', 'beta']
        res2 = {pname: model.params[pname][0] for pname in res2_cols}
        
        return {**res1, **res2}

    # def save(self, path: str) -> None:
    #     """Saves the model to the given path as json

    #     :param path: Path to save the model
    #     :type path: str
    #     """
    #     with open(path, 'w') as fout:
    #         json.dump(model_to_json(self.model), fout)

    # @classmethod
    # def load(self, path: str) -> None:
    #     """Loads the model from the given path to json

    #     :param path: Path to load the model
    #     :type path: str
    #     """
    #     with open(path, 'r') as fin:
    #         self.model = model_from_json(json.load(fin))
    #     return self.model
