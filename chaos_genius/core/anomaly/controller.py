import datetime
import os
import re

import pandas as pd

from chaos_genius.core.anomaly.models import AnomalyModel
from chaos_genius.core.anomaly.processor import ProcessAnomalyDetection


class AnomalyDetectionController(object):
    def __init__(self, kpi_info, save_model=False, debug=False):
        self.kpi_info = kpi_info
        self.save_model = save_model
        self.debug = debug

    def _load_anomaly_data(self) -> pd.DataFrame:
        """Loads KPI data from its datastore, preprocesses it and 
        returns it for anomaly detection 

        :return: Dataframe with all of KPI's data for the last 
        N days/hours
        :rtype: pd.DataFrame
        """

        # FIXME: Fix csv loading to sql query
        df = pd.read_csv(self.kpi_info["dataset_path"])
        df[self.kpi_info['datetime_column']] = pd.to_datetime(
            df[self.kpi_info['datetime_column']])

        if self.debug:
            return df[
                df[self.kpi_info['datetime_column']]
                < datetime.datetime(2021, 5, 1)]
        else:
            return df

    def _get_last_date_in_db(
        self,
        series: str,
        subgroup: str = None
    ) -> datetime.datetime:
        """Returns the last date for which we have data for the given 
        series

        :param series: Type of series
        :type series: str
        :param subgroup: Subtype of series
        :type subgroup: str
        :return: Last date for which we have data for the given series
        :rtype: datetime.datetime
        """
        name = self.kpi_info['name']
        table = self.kpi_info['table_name']
        if series != 'overall':
            parsed_subgroup = '_'.join(re.findall('"(.*?)"', subgroup))
            read_path = f'./{name}/{table}_{series}_{parsed_subgroup}.csv'
        else:
            read_path = f'./{name}/{table}_{series}.csv'
        try:
            x = pd.read_csv(read_path)
            x['dt'] = pd.to_datetime(x['dt'])
            return x['dt'].iloc[-1]+datetime.timedelta(days=1)
        except FileNotFoundError:
            if series == 'subgroup':
                x = self._load_anomaly_data.query(subgroup)
            else:
                x = self._load_anomaly_data()

            timedelta = datetime.timedelta(days=self.kpi_info["period"])
            date = x[self.kpi_info['datetime_column']].iloc[0]

            return pd.to_datetime(date) + timedelta

    def _detect_anomaly(
        self,
        model: AnomalyModel,
        input_data: pd.DataFrame,
        last_date: datetime.datetime,
        series,
        subgroup
    ) -> pd.DataFrame:
        """Detects anomaly in the given data

        :param model: Model to use for anomaly detection
        :type model: AnomalyModel
        :param input_data: Dataframe with metric's data
        :type input_data: pd.DataFrame
        :param last_date: Last date for which we have output data
        :type last_date: datetime.datetime
        :return: Dataframe with anomaly data
        :rtype: pd.DataFrame
        """

        input_data = input_data.reset_index().rename(columns={
            self.kpi_info['datetime_column']: 'dt',
            self.kpi_info['metric']: 'y'
        })

        processed_anomaly = ProcessAnomalyDetection(
            model,
            input_data,
            last_date,
            self.kpi_info["period"],
            self.kpi_info["table_name"],
            series,
            subgroup,
            self.kpi_info["model_kwargs"]
        ).predict()

        if self.debug:
            input_data['yhat_upper'] = 0
            input_data['yhat_lower'] = 0
            input_data['anomaly'] = 0
            input_data['severity'] = 0
            processed_anomaly = pd.concat(
                [input_data[:self.kpi_info["period"]], processed_anomaly])

        return processed_anomaly

    def _save_anomaly_output(
        self,
        anomaly_output: pd.DataFrame,
        series: str,
        subgroup: str = None
    ) -> None:
        """Saves anomaly output to the output DB

        :param anomaly_output: Dataframe with anomaly data
        :type anomaly_output: pd.DataFrame
        :param series: Type of series
        :type series: str
        :param subgroup: Subgroup of the KPI
        :type subgroup: str
        """
        name = self.kpi_info['name']
        table = self.kpi_info['table_name']
        model_name = self.kpi_info['model_name']

        # FIXME: Reformat subdim name to be more UI friendly
        if series == "subdim":
            parsed_subgroup = '_'.join(re.findall('"([^"]*)"', subgroup))
            output_read_path = f'./Processed/{table}/{model_name}/{series}_{parsed_subgroup}.csv'
        elif series == "dq":
            output_read_path = f'./Processed/{table}/{model_name}/{series}_{subgroup}.csv'
        else:
            output_read_path = f'./Processed/{table}/{model_name}/{series}.csv'

        if self.debug == True:
            output_read_path = './Test'+output_read_path[1:]

        try:
            os.makedirs(output_read_path.rsplit('/', 1)[0])
        except FileExistsError:
            pass

        try:
            save_file = pd.read_csv(output_read_path)
            save_file = pd.concat([save_file, anomaly_output])
        except FileNotFoundError:
            save_file = pd.DataFrame(columns=[
                'dt', 'y', 'yhat_lower', 'yhat_upper'])
            save_file = anomaly_output

        save_file.to_csv(output_read_path, index=False)

    def _get_subgroup_list(
        self,
        input_data: pd.DataFrame
    ) -> list:
        """Returns list of subgroups for which we want to run anomaly 
        detection

        :return: List of subgroups
        :rtype: list
        """

        subgroups = []
        for dim in self.kpi_info["dimensions"]:
            subgroup = []
            for category in input_data[dim].unique():
                subgroup.append(f"`{dim}`==\"{category}\"")
            subgroups.append(subgroup)

        dp = {}

        def gen_groups(level=0, k=0):
            if len(subgroups[level:]) == 1:
                return subgroups[level]

            if (level, k) in dp:
                return dp[(level, k)]

            ans = []
            for i in subgroups[level]:
                ans.extend(
                    ' and '.join([i, x]) for x in gen_groups(level+1, k+1))
            dp[(level, k)] = ans
            return ans

        return gen_groups()

    def _filter_subgroups(
        self, subgroups: list, input_data: pd.DataFrame
    ) -> list:
        """Filters out irrelevant subgroups

        :param subgroups: List of subgroups
        :type subgroups: list
        :return: List of subgroups
        :rtype: list
        """

        # TODO: Update temporary filter logic
        # FIXME: Replace current temp logic with faster temp logic
        filtered_subgroups = []
        for subgroup in subgroups:
            if len(input_data.query(subgroup)) >= self.kpi_info["period"]:
                filtered_subgroups.append(subgroup)

        return filtered_subgroups

    def _run_anomaly_for_series(
        self,
        input_data: pd.DataFrame,
        series: str,
        subgroup: str = None
    ) -> None:
        """Runs anomaly detection for the given series

        :param series: Type of series
        :type series: str
        :param subgroup: Subgroup of the KPI
        :type subgroup: str
        """

        dt_col = self.kpi_info['datetime_column']
        metric_col = self.kpi_info['metric']
        freq = self.kpi_info['freq']
        agg = self.kpi_info["aggregation"]

        last_date = self._get_last_date_in_db(series, subgroup)

        series_data = None

        if series == 'dq':
            if subgroup == 'missing':
                data = input_data

                data[dt_col] = pd.to_datetime(data[dt_col])
                data = data.groupby(dt_col)[metric_col]

                missing_data = [[g, data.get_group(g).isna().sum()]
                                for g in data.groups]

                missing_data = pd.DataFrame(
                    missing_data,
                    columns=[dt_col, metric_col]
                ).set_index(dt_col)

                series_data = missing_data

            else:
                series_data = input_data.set_index(dt_col) \
                    .resample(freq).agg({metric_col: subgroup})

        else:
            series_data = input_data.set_index(dt_col) \
                .resample(freq).agg({metric_col: agg})

        model_name = self.kpi_info["model_name"]
        # FIXME: Model name and model seem to be used interchangably here
        # How to fix that
        overall_anomaly_output = self._detect_anomaly(
            model_name, series_data, last_date, series, subgroup)

        self._save_anomaly_output(overall_anomaly_output, series, subgroup)

        # FIXME: Fix saving placeholder
        # if self.save_model:
        #     self._save_model(overall_model, series, subgroup)

    def detect(self) -> None:
        # TODO: Docstring
        if self.debug:
            print(self.kpi_info["model_name"])

        input_data = self._load_anomaly_data()

        if self.debug:
            print('overall')

        self._run_anomaly_for_series(input_data, "overall")

        subgroups = self._get_subgroup_list(input_data)

        filtered_subgroups = self._filter_subgroups(subgroups, input_data)

        if self.debug:
            filtered_subgroups = filtered_subgroups[:5]

        for subgroup in filtered_subgroups:
            if self.debug:
                print(subgroup)

            self._run_anomaly_for_series(input_data, "subdim", subgroup)

        for dq_subgroup in ["max", "count", "mean", "missing"]:
            if self.debug:
                print(dq_subgroup)

            try:
                self._run_anomaly_for_series(input_data, "dq", dq_subgroup)
            except Exception as e:
                print(e)
