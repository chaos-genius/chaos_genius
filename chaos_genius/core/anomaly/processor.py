import datetime

import pandas as pd

from chaos_genius.core.anomaly.constants import MODEL_MAPPER, FREQUENCY_DELTA
from chaos_genius.core.anomaly.models import AnomalyModel
from chaos_genius.core.anomaly.utils import bound_between, get_timedelta


class ProcessAnomalyDetection:
    def __init__(
        self,
        model_name: str,
        data: pd.DataFrame,
        last_date: datetime.datetime,
        period: int,
        table_name: str,
        freq: str,
        sensitivity: str,
        series: str,
        subgroup: str = None,
        model_kwargs={},
    ):
        self.model_name = model_name
        self.input_data = data
        self.last_date = last_date
        self.period = period
        self.table_name = table_name,
        self.series = series,
        self.subgroup = subgroup
        self.model_path = self.gen_model_save_path()
        self.model_kwargs = model_kwargs
        self.freq = freq
        self.sensitivity = sensitivity

    def predict(self):

        model = self._get_model()

        predictionSeries = self._predict(model)

        anomalyDf = self._detect_severity(
            self._detect_anomalies(predictionSeries))

        self._save_model(model)

        return anomalyDf

    def _predict(self, model: AnomalyModel):

        # TODO: Write docstrings for entire class

        input_data = self.input_data

        predSeries = pd.DataFrame(columns=[
            'dt', 'y', 'yhat_lower', 'yhat_upper'])

        input_last_date = input_data['dt'].iloc[-1]
        input_first_date = input_data['dt'].iloc[0]
        max_period = get_timedelta(self.freq, self.period)

        if self.last_date is None:
            # pass complete input data frame in here as pred_df
            if len(input_data) >= self.period:
                prediction = model.predict(
                    input_data,
                    self.sensitivity,
                    pred_df=input_data,
                )

                prediction['y'] = input_data['y']
                predSeries = prediction

        else:

            while self.last_date <= input_last_date:
                curr_period = self.last_date-input_first_date

                if curr_period >= max_period:
                    df = input_data[
                        (input_data['dt'] >= self.last_date-max_period)
                        & (input_data['dt'] <= self.last_date)
                    ]

                    prediction = model.predict(
                        df,
                        self.sensitivity
                    )
                    toAppend = prediction.iloc[-1].copy()
                    toAppend.loc['y'] = df.iloc[-1]['y']

                    predSeries = predSeries.append(toAppend, ignore_index=True)

                self.last_date += datetime.timedelta(**FREQUENCY_DELTA[self.freq])

        return predSeries

    def _detect_anomalies(self, predictionSeries):
        predictionSeries["anomaly"] = 0
        high_sel = predictionSeries["y"] > predictionSeries["yhat_upper"]
        low_sel = predictionSeries["y"] < predictionSeries["yhat_lower"]
        predictionSeries.loc[high_sel, "anomaly"] = 1
        predictionSeries.loc[low_sel, "anomaly"] = -1

        return predictionSeries

    def _detect_severity(self, anomaly_prediction):
        std_dev = anomaly_prediction["y"].mean()

        anomaly_prediction['severity'] = 0
        anomaly_prediction["severity"] = anomaly_prediction.apply(
            lambda x: self.compute_severity(x, std_dev), axis=1)

        return anomaly_prediction

    def compute_severity(self, row, std_dev):
        # TODO: Create docstring for these comments
        if row['anomaly'] == 0:
            # No anomaly. Severity is 0 ;)
            return 0
        elif row['anomaly'] == 1:
            # Check num deviations from upper bound of CI
            zscore = (row['y'] - row['yhat_upper']) / std_dev
        elif row['anomaly'] == -1:
            # Check num deviations from lower bound of CI
            zscore = (row['y'] - row['yhat_lower']) / std_dev

        ZSCORE_UPPER_BOUND = 2.5
        # Scale zscore where 4 scales to 100; -4 scales to -100
        severity = zscore * 100 / ZSCORE_UPPER_BOUND
        severity = abs(severity)

        # Bound between min and max score
        # If above 100, we return 100; If below -100, we return -100
        return bound_between(0, severity, 100)

    def _get_model(self) -> AnomalyModel:
        model = MODEL_MAPPER[self.model_name]
        try:
            return model.load(self.model_path, model_kwargs=self.model_kwargs)
        except NotImplementedError:
            return model(model_kwargs=self.model_kwargs)

    def _save_model(
        self,
        model: AnomalyModel,
    ) -> None:
        try:
            model.save(self.model_path)
        except NotImplementedError:
            pass

    def gen_model_save_path(self):
        if self.series == "overall":
            return f'./{self.table_name}/{self.subgroup}.mdl'
        else:
            return f'./{self.table_name}/{self.subgroup}_{self.series}.mdl'
