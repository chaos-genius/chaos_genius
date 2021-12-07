from typing import Dict, List
from datetime import timedelta
import pandas as pd
from prophet import Prophet
import altair as alt
import statsmodels.api as sm
from statsmodels.tsa.exponential_smoothing.ets import ETSModel

from chaos_genius.core.utils import suppress_stdout_stderr

# TODO: Add prophet and altair as requirements
# TODO: Add debug checks and logging

try:
    from IPython.display import display
except ModuleNotFoundError:
    display = print

DEFAULT_SENSITIVITY_THRESHOLDS = {"Low": 0.95, "Medium": 0.9, "High": 0.8, "Chaos": 0.7}


def cut_dataframe(df_entire, start_date, end_date, date_column="date"):
    """Cuts a dataframe to a desired date range

    :param df_entire: The dataframe to cut
    :type df_entire: pandas.core.frame.DataFrame
    :param start_date: Start date of the dataframe entries
    :type start_date: str
    :param end_date: End date of the dataframe entries
    :type end_date: str
    :param date_column: Column name of the timestamp/date column, defaults to "date"
    :type date_column: str, optional
    :return: Returns the dataframe with entries only between inclusive boundaries of the mentioned dates
    :rtype: pandas.core.frame.DataFrame
    """
    mask = (df_entire[date_column] > start_date) & (df_entire[date_column] <= end_date)
    return df_entire.loc[mask]


def detect_anomalies(forecasted):
    """This function takes input from any anomaly detection algorithm and
    returns a dataframe with anomalies and their corresponding importance.
    Here, importance is calculated using a zscore based method.

    :param forecasted: output of the anomaly detection functions;
    it should have the following columns: ['ds', 'yhat', 'yhat_lower', 'yhat_upper', 'y']
    :type forecasted: pandas.core.frame.DataFrame
    :return: A dataframe with anomalies and their corresponding importance
    :rtype: pandas.core.frame.DataFrame
    """
    forecasted["anomaly"] = 0
    forecasted.loc[forecasted["y"] > forecasted["yhat_upper"], "anomaly"] = 1
    forecasted.loc[forecasted["y"] < forecasted["yhat_lower"], "anomaly"] = -1

    return forecasted


def run_prophet(
    df_prepped,
    date_column,
    target_column,
    interval_width=0.80,
    weekly_seasonality="auto",
    yearly_seasonality=False,
):
    """Run prophet on the desired dataframe and return the predictions

    :param df_prepped: dataframe to run prophet on. It needs to have only 2 columns; date and target
    :type df_prepped: pandas.core.frame.DataFrame
    :param date_column: name of the date/timestamp column
    :type date_column: str
    :param target_column: name of the target/predictor column
    :type target_column: str
    :param interval_width: confidence interval for prophet, defaults to 0.80
    :type interval_width: float, optional
    :param yearly_seasonality: yearly seasonality in the data, defaults to False
    :type yearly_seasonality: bool, optional
    :param weekly_seasonality: weekly seasonality in the data, defaults to False
    :type weekly_seasonality: bool, optional
    :param daily_seasonality: daily seasonality in the data, defaults to False
    :type daily_seasonality: bool, optional
    :return: Returns a dataframe after running the prophet algorithm on the input data
    :rtype: pandas.core.frame.DataFrame
    """
    df_prepped.rename(columns={date_column: "ds", target_column: "y"}, inplace=True)
    with suppress_stdout_stderr():
        model = Prophet(
            interval_width=interval_width,
            yearly_seasonality=yearly_seasonality,
            weekly_seasonality=weekly_seasonality,
        )
        model.fit(df_prepped)
    future = model.make_future_dataframe(periods=0)
    forecast = model.predict(future)
    forecast = forecast[["ds", "yhat", "yhat_lower", "yhat_upper"]]
    forecast = forecast.merge(df_prepped)
    df_anomaly = detect_anomalies(forecast)
    df_anomaly = detect_severity(df_anomaly)
    return df_anomaly


def run_stddevi(
    df_prepped,
    date_column,
    target_column,
    num_devi=0,
    num_devi_u=None,
    num_devi_l=None,
    interval_width=0.80,
):
    """Run standard deviation on the desired dataframe and return the predictions

    :param df_prepped: Dataframe to run standard deviation on.
    It needs to have only 2 columns; date and target
    :type df_prepped: pandas.core.frame.DataFrame
    :param date_column: name of the date/timestamp column
    :type date_column: str
    :param target_column: name of the target column
    :type target_column: str]
    :param num_devi: number of standard deviations beyond which the value should be
    categorized as an anomaly, defaults to 0
    :type num_devi: float, optional
    :param num_devi_u: number of standard deviations above which the value should be an anomaly, defaults to None
    :type num_devi_u: float, optional
    :param num_devi_l: number of standard deviations below which the value should be an anomaly, defaults to None
    :type num_devi_l: float, optional
    :return: Returns a dataframe after running the standard deviation algorithm on the input data
    :rtype: pandas.core.frame.DataFrame
    """
    df_prepped.rename(columns={date_column: "ds", target_column: "y"}, inplace=True)

    mean = df_prepped["y"].mean()
    stddevi = df_prepped["y"].std()

    if num_devi:
        num_devi_u = num_devi_l = num_devi

    threshold_u = mean + (num_devi_u * stddevi)
    threshold_l = mean - (num_devi_l * stddevi)
    df_prepped["yhat_lower"] = threshold_l * interval_width
    df_prepped["yhat_upper"] = threshold_u * interval_width
    df_prepped["yhat"] = (threshold_l + threshold_u) / 2
    df_anomaly = detect_anomalies(df_prepped)
    return df_anomaly


def compute_population_threshold(df_entire, base_population_threshold=500):
    """Computes a population threshold to use when deciding whether or not to display a sub-dimension's anomaly detection analysis

    :param df_entire: Entire pandas DataFrame which anomaly detection is run on
    :type df_entire: pandas.core.frame.DataFrame
    :param base_population_threshold: Base/minimum population threshold to output, defaults to 500
    :type base_population_threshold: int, optional
    :return: Returns the computed population threshold
    :rtype: float
    """

    # TODO: experiment with algorithm dependent threshold
    population_threshold = base_population_threshold + (df_entire.shape[0] * 0.01)
    return population_threshold


def compute_entire_multi_dim_anomaly(
    df_entire,
    kpi_name,
    agg_dict,
    sub_dim_column,
    date_column,
    algo_used="prophet",
    num_deviation=None,
    num_deviation_lower=None,
    num_deviation_upper=None,
    interval_width=None,
    seasonality="auto",
    frequency="D",
):
    """Computes the entire multi-dimensionality anomaly dataframe

    :param df_entire: entire dataframe after pre-processing
    :type df_entire: pandas.core.frame.DataFrame
    :param threshold_data_points: minimum number of datapoints that must be present in the dataframe for the analysis to run
    :type threshold_data_points: int
    :param kpi_name: name of the KPI column in the dataset
    :type kpi_name: str
    :param agg_dict: agrregation dictionary which holds the key value pair of column name and the operation to be performed
    :type agg_dict: dict
    :param sub_dim_column: list of sub dimension columns
    :type sub_dim_column: list, maximum of 3 values in the list
    :param date_column: name of the column containing the date/timeperiod
    :type date_column: str
    :param algo_used: the type of algorithm used for anomaly detection, defaults to "prophet"
    :type algo_used: str, optional
    :param num_deviation: number of standard deviations beyond which, an anomaly occurs.
    This param to be specified when using the stddevi algorithm, defaults to None
    :type num_deviation: float, optional
    :param num_deviation_lower: number of standard deviations below which the value should be an anomaly, defaults to None
    :type num_deviation_lower: float, optional
    :param num_deviation_upper: number of standard deviations above which the value should be an anomaly, defaults to None
    :type num_deviation_upper: float, optional
    :param interval_width: confidence interval width for the algorithm (prophet), defaults to None
    :type interval_width: float, optional
    :param seasonality: Seasonality of the data, defaults to "auto"
    :type seasonality: str, optional
    :param frequency: Aggregation frequency key using pandas standards (https://pandas.pydata.org/pandas-docs/stable/user_guide/timeseries.html#offset-aliases), defaults to 'D'
    :type frequency: str, optional
    :return: Returns the dataframe describing the anomalies across all subdimensions
    :rtype: pandas.core.frame.DataFrame
    """

    # if you using different pre-processing, like interpolating, etc yhe below code must be modified

    df_prepped = prepare_dataframe_for_anomaly(
        df_entire[[date_column, kpi_name]], date_column, agg_dict, frequency
    )

    df_anomaly = compute_subdim_anomaly_dataframe(
        df_prepped=df_prepped,
        sub_dim_name="overall_kpi",
        date_column=date_column,
        kpi_name=kpi_name,
        algo_used=algo_used,
        interval_width=interval_width,
        num_devi=num_deviation,
        num_devi_u=num_deviation_upper,
        num_devi_l=num_deviation_lower,
    )

    # TODO: handling missing values in subdims

    # subdim = '-'.join(sub_dim_column)
    # df_entire[sub_dim_column] = df_entire[sub_dim_column].fillna(value="unknown")
    # df_entire[subdim] = df_entire[sub_dim_column].apply(lambda x: '-'.join(x), axis=1)
    # df_entire  = df_entire.drop(columns=sub_dim_column)

    population_threshold = compute_population_threshold(
        df_entire, base_population_threshold=500
    )

    for subdim in sub_dim_column:
        print(f"Current Dimension {subdim}")
        for sub_dim in df_entire[subdim].unique():
            df_sub_dim = df_entire[df_entire[subdim] == sub_dim]
            df_sub_dim = df_sub_dim[[date_column, kpi_name]]

            if df_sub_dim.shape[0] > population_threshold:
                print(f"Processing SubDim: {sub_dim}")
                # for a distributed arch, just call these in individual workers
                df_prepped_sub_dim = prepare_dataframe_for_anomaly(
                    df_sub_dim, date_column, agg_dict, frequency
                )

                df_anomaly_subdim = compute_subdim_anomaly_dataframe(
                    df_prepped_sub_dim,
                    sub_dim,
                    date_column,
                    kpi_name,
                    algo_used,
                    interval_width,
                    num_deviation,
                    num_deviation_upper,
                    num_deviation_lower,
                )

                # the appending bit
                # TODO: make a list of df, then pd.concat them
                df_anomaly = df_anomaly.append(df_anomaly_subdim, ignore_index=True)

    return df_anomaly


def prepare_dataframe_for_anomaly(df_sub_dim, date_column, agg_dict, frequency="D"):
    """Performs resampling and aggregation to prepare the input DataFrame to be used for Anomaly Detection

    :param df_sub_dim: A pandas DataFrame for some sub-dimension
    :type df_sub_dim: pandas.core.frame.DataFrame
    :param date_column: Name of the column containing the date/timeperiod
    :type date_column: str
    :param agg_dict: Aggregation dictionary specifying the columns and aggregation functions to perform in resampling.
    :type agg_dict: Dict
    :param frequency: Aggregation frequency key using pandas standards (https://pandas.pydata.org/pandas-docs/stable/user_guide/timeseries.html#offset-aliases), defaults to 'D'
    :type frequency: str, optional
    :return: Returns the resampled and aggregated pandas DataFrame.
    :rtype: pandas.core.frame.DataFrame
    """
    return (
        df_sub_dim.set_index(date_column)
        .resample(frequency)
        .agg(agg_dict)
        .reset_index()
    )


def compute_subdim_anomaly_dataframe(
    df_prepped,
    sub_dim_name,
    date_column,
    kpi_name,
    algo_used,
    interval_width=0.8,
    num_devi=None,
    num_devi_u=None,
    num_devi_l=None,
):
    """Computes the Anomaly dataframe for a single sub-dimension

    :param df_prepped: the prepped pandas DataFrame after resampling, aggregation, etc.
    :type df_prepped: pandas.core.frame.DataFrame
    :param sub_dim_name: name of the current sub-dimension
    :type sub_dim_name: str
    :param date_column: name of the column containing the date/timeperiod
    :type date_column: str
    :param kpi_name: name of the KPI column in the dataset
    :type kpi_name: str
    :param algo_used: the type of algorithm used for anomaly detection
    :type algo_used: str
    :param interval_width: confidence interval width for the algorithm (prophet), defaults to 0.8
    :type interval_width: float, optional
    :param num_devi: number of standard deviations beyond which, an anomaly occurs.
    This param to be specified when using the stddevi algorithm, defaults to None, defaults to None
    :type num_devi: float, optional
    :param num_devi_u: number of standard deviations above which the value should be an anomaly, defaults to None
    :type num_devi_u: float, optional
    :param num_devi_l: number of standard deviations below which the value should be an anomaly, defaults to None
    :type num_devi_l: float, optional
    :return: Returns the anomaly DataFrame for a single sub-dimension
    :rtype: pandas.core.frame.DataFrame
    """

    if algo_used == "prophet":
        df_subdim_anomaly = run_prophet(
            df_prepped,
            date_column,
            target_column=kpi_name,
            interval_width=interval_width,
        )
        df_subdim_anomaly["sub_dimension"] = sub_dim_name

    # elif algo_used == "ets":
    #     df_anomaly_subdim = run_ets(df_prepped, date_column, target_column=kpi_name, \
    #                 interval_width = interval_width, seasonality=2)

    elif algo_used == "stddevi":
        df_subdim_anomaly = run_stddevi(
            df_prepped,
            date_column,
            target_column=kpi_name,
            num_devi=num_devi,
            num_devi_u=num_devi_u,
            num_devi_l=num_devi_l,
            interval_width=interval_width,
        )
        df_subdim_anomaly["sub_dimension"] = sub_dim_name

    return df_subdim_anomaly


def get_missing_dates(df_entire, date_column, start_date, end_date):
    return pd.date_range(start=start_date, end=end_date).difference(
        df_entire.set_index(date_column).index
    )


def get_missing_df(df_entire, date_column, kpi_column, freq="D"):
    return (
        df_entire.set_index(date_column)[kpi_column]
        .isna()
        .resample(freq, level=date_column)
        .sum(min_count=1)
        .dropna()
        .reset_index()
    )


def get_data_volume_dataframe(df_entire, date_column, kpi_name, freq="D"):
    return (
        df_entire.set_index(date_column)
        .resample(freq)
        .agg({kpi_name: "count"})
        .reset_index()
    )


def get_max_or_min_df(df_metric, date_column, kpi_name, dq_metric="max", freq="D"):
    print(f"Data Quality over the {dq_metric} values per {freq}")
    return (
        df_metric.set_index(date_column)
        .resample(freq)
        .agg({kpi_name: dq_metric})
        .reset_index()
    )


def anomaly_detection(
    df_entire: pd.DataFrame,
    start_date: str,
    end_date: str,
    kpi_column_name: str,
    agg_dict: Dict,
    sub_dimensions: List,
    date_column_name: str,
    frequency: str,
    algo_used: str,
    interval_width: float = 0.8,
    num_days_around_kpi_anomaly: int = 1,
    num_anomalies_kpi: int = 15,
    debug: bool = False,
    plot_in_altair: bool = False,
    anomaly_date=False,
    dq_metric=False,
    top_n_subdim=5,
):

    # TODO: Verbosity parameter for prophet. Verbosity = 0 if not debug.
    # Compute/Find anomalies
    df_anomaly = compute_entire_multi_dim_anomaly(
        df_entire,
        kpi_column_name,
        agg_dict,
        sub_dimensions,
        date_column=date_column_name,
        algo_used=algo_used,
        num_deviation=None,
        num_deviation_lower=None,
        num_deviation_upper=None,
        interval_width=interval_width,
        seasonality="auto",
        frequency=frequency,
    )

    # Get data for JS plotting
    graphs = format_anomaly_data_for_js_graph(
        df_anomaly=df_anomaly,
        algo_used=algo_used,
        kpi_column_name=kpi_column_name,
        agg_type=agg_dict[kpi_column_name],
        freq=frequency,
        anomaly_date=anomaly_date,
        dq_metric=dq_metric,
        top_n_subdim=top_n_subdim,
    )

    if plot_in_altair:
        # Plot in Altair
        top_n_correlated_anomalies = get_top_n_correlated_anomalies(
            df_anomaly, num_days_around_kpi_anomaly, num_anomalies_kpi
        )
        plot_top_n_anomalies(
            top_n_correlated_anomalies, kpi_column_name, algo_used, start_date, end_date
        )

    return graphs


def format_anomaly_data_for_js_graph(
    df_anomaly,
    algo_used,
    kpi_column_name,
    agg_type,
    freq,
    anomaly_date=False,
    dq_metric=False,
    top_n_subdim=5,
    precision=2,
):
    """Prepares and formats anomaly data to be graphed on frontend.

    :param df_anomaly: Anomaly DataFrame output from the compute multi-dim anomaly function
    :type df_anomaly: pd.core.frame.DataFrame
    :param algo_used: Algorithm used to run compute anomalies
    :type algo_used: str
    :param kpi_name: Name of the KPI column
    :type kpi_name: str
    :param agg_type: Aggregation type used to compute anomalies
    :type agg_type: str
    :param freq: Aggregation frequency used when resampling the data
    :type freq: str
    :param precision: Precision to round y and yhat values to, defaults to 2
    :type precision: int, optional
    :return: List of Dicts where each Dict has the data for one sub-dimension graph
    :rtype: List
    """

    def fill_graph_data(row, graph_data, precision=2):
        """Fills graph_data with intervals, values, and predicted_values for a given row.

        :param row: A single row from the anomaly dataframe
        :type row: pandas.core.series.Series
        :param graph_data: Dictionary object with the current graph
        :type graph_data: Dict
        :param precision: Precision to round y and yhat values to, defaults to 2
        :type precision: int, optional
        """
        if row.notna()["y"]:  # Do not include rows where there is no data
            # Convert to milliseconds for HighCharts
            timestamp = row["ds"].timestamp() * 1000
            # Create and append a point for the interval
            interval = [
                timestamp,
                round(row["yhat_lower"], precision),
                round(row["yhat_upper"], precision),
            ]
            graph_data["intervals"].append(interval)
            # Create and append a point for the value
            value = [timestamp, round(row["y"])]
            graph_data["values"].append(value)
            # Create and append a point for the predicted_value
            predicted_value = [timestamp, round(row["yhat"], precision)]
            graph_data["predicted_values"].append(predicted_value)
            # Create and append a point for the severity
            severity = [timestamp, round(row["severity"], precision)]
            graph_data["severity"].append(severity)

    print("ENTERING JSON FORMATTING FUNCTION")
    if dq_metric:
        print("ENTERING DQ METRIC")
        graph_data = {
            "title": f"{dq_metric}",
            # 'y_axis_label': f'{agg_type.capitalize()} of {freq} {kpi_column_name}',
            "y_axis_label": kpi_column_name,
            "x_axis_label": "Time",
            "sub_dimension": dq_metric,
            "intervals": [],
            "values": [],
            "predicted_values": [],
            "severity": [],
        }

        df_anomaly.apply(
            lambda row: fill_graph_data(row, graph_data, precision), axis=1
        )

        return graph_data

    else:
        print("Entering overall KPI")
        graphs = []
        graph_data = {
            "title": "Overall KPI",
            # 'y_axis_label': f'{agg_type.capitalize()} of {freq} {kpi_column_name}',
            "y_axis_label": kpi_column_name,
            "x_axis_label": "Time",
            "sub_dimension": "overall_kpi",
            "intervals": [],
            "values": [],
            "predicted_values": [],
            "severity": [],
        }

        sub_dim_df = df_anomaly.loc[df_anomaly["sub_dimension"] == "overall_kpi"]
        sub_dim_df.apply(
            lambda row: fill_graph_data(row, graph_data, precision), axis=1
        )
        graphs.append(graph_data)

        # try:

        if anomaly_date is False:
            print("entering subdim anomaly")
            df_anomaly = df_anomaly[df_anomaly["sub_dimension"] != "overall_kpi"]
            for sub_dim in df_anomaly.sort_values(by="severity", ascending=False)[
                "sub_dimension"
            ].unique()[:top_n_subdim]:
                graph_data = {
                    "title": f"Drilldown: {sub_dim}",
                    # 'y_axis_label': f'{agg_type.capitalize()} of {freq} {kpi_column_name}',
                    "y_axis_label": kpi_column_name,
                    "x_axis_label": "Time",
                    "sub_dimension": sub_dim,
                    "intervals": [],
                    "values": [],
                    "predicted_values": [],
                    "severity": [],
                }

                # Fill intervals, values, predicted_values lists
                sub_dim_df = df_anomaly.loc[df_anomaly["sub_dimension"] == sub_dim]
                sub_dim_df.apply(
                    lambda row: fill_graph_data(row, graph_data, precision), axis=1
                )
                graphs.append(graph_data)
            return graphs

        if anomaly_date is True:
            print("entering anomaly date")
            df_anomaly = df_anomaly[df_anomaly["sub_dimension"] != "overall_kpi"]
            anomaly_date = pd.to_datetime(anomaly_date)

            display(
                df_anomaly[df_anomaly["ds"] == anomaly_date].sort_values(
                    by="severity", ascending=False
                )
            )
            anomaly_date_sub_dim = (
                df_anomaly[df_anomaly["ds"] == anomaly_date]
                .sort_values(by="severity", ascending=False)["sub_dimension"]
                .unique()[:top_n_subdim]
            )
            print(anomaly_date_sub_dim)

            # graphs=[]
            for sub_dim in anomaly_date_sub_dim:
                graph_data = {
                    "title": f"Drilldown: {sub_dim}",
                    # 'y_axis_label': f'{agg_type.capitalize()} of {freq} {kpi_column_name}',
                    "y_axis_label": kpi_column_name,
                    "x_axis_label": "Time",
                    "sub_dimension": sub_dim,
                    "intervals": [],
                    "values": [],
                    "predicted_values": [],
                    "severity": [],
                }
                # Fill intervals, values, predicted_values lists
                sub_dim_df = df_anomaly.loc[df_anomaly["sub_dimension"] == sub_dim]
                sub_dim_df.apply(
                    lambda row: fill_graph_data(row, graph_data, precision), axis=1
                )
                graphs.append(graph_data)

            # except Exception as e:
            graphs.append(graph_data)
            return graphs


def compute_data_quality_metrics_dataframe(
    df_dq,
    date_column,
    kpi_name,
    algo_used,
    num_deviation=None,
    num_deviation_lower=None,
    num_deviation_upper=None,
    interval_width=None,
    seasonality="auto",
):
    if algo_used == "prophet":
        df_dq_anomaly = run_prophet(
            df_dq, date_column, target_column=kpi_name, interval_width=interval_width
        )

    elif algo_used == "ets":
        # given a random seasonality here
        df_dq_anomaly = run_ets(
            df_dq,
            date_column,
            target_column=kpi_name,
            interval_width=interval_width,
            seasonality=seasonality,
        )

    elif algo_used == "stddevi":
        df_dq_anomaly = run_stddevi(
            df_dq,
            date_column,
            target_column=kpi_name,
            num_devi=num_deviation,
            num_devi_u=num_deviation_upper,
            num_devi_l=num_deviation_lower,
        )
    # display(df_dq_anomaly)
    return df_dq_anomaly


def get_dq_json(
    df_entire,
    algo_used,
    date_column,
    kpi_name,
    interval_width,
    freq="D",
    plot_in_altair=False,
):
    df_entire = df_entire[[date_column, kpi_name]]

    df_all = pd.DataFrame(
        columns=[
            "ds",
            "yhat",
            "yhat_lower",
            "yhat_upper",
            "y",
            "anomaly",
            "severity",
            "sub_dimension",
        ]
    )

    graphs = []
    for i in ["volume", "max", "mean", "missing"]:
        if i != "volume" and i != "missing":
            print(i)
            df_dq_metric = compute_data_quality_metrics_dataframe(
                get_max_or_min_df(
                    df_entire, date_column, kpi_name, dq_metric=i, freq=freq
                ),
                date_column,
                kpi_name,
                algo_used,
                interval_width=interval_width,
            )

            df_dq_metric["sub_dimension"] = i
            graphs.append(
                format_anomaly_data_for_js_graph(
                    df_dq_metric,
                    algo_used,
                    kpi_name,
                    agg_type=i,
                    freq=freq,
                    dq_metric=f"DQ-{i} of Data",
                )
            )
            df_all = df_all.append(df_dq_metric)
        elif i == "volume":
            df_dq_metric = compute_data_quality_metrics_dataframe(
                get_data_volume_dataframe(df_entire, date_column, kpi_name, freq=freq),
                date_column,
                kpi_name,
                algo_used,
                interval_width=interval_width,
            )

            df_dq_metric["sub_dimension"] = i
            graphs.append(
                format_anomaly_data_for_js_graph(
                    df_dq_metric,
                    algo_used,
                    kpi_name,
                    agg_type="count",
                    freq=freq,
                    dq_metric="DQ-Data Volume",
                )
            )
            df_all = df_all.append(df_dq_metric)
        elif i == "missing":
            df_dq_metric = compute_data_quality_metrics_dataframe(
                get_missing_df(df_entire, date_column, kpi_name, freq=freq),
                date_column,
                kpi_name,
                algo_used,
                interval_width=interval_width,
            )
            df_dq_metric["sub_dimension"] = i

            graphs.append(
                format_anomaly_data_for_js_graph(
                    df_dq_metric,
                    algo_used,
                    kpi_name,
                    agg_type="Number of Missing Values",
                    freq=freq,
                    dq_metric="DQ-Missing Data",
                )
            )
            df_all = df_all.append(df_dq_metric)
        # display(df_dq_metric.head())
        if plot_in_altair:
            # Drop na so we don't skip points which don't exist
            display(
                plot_sorted_anomalies_df(
                    df_dq_metric.dropna(subset=["y"]),
                    kpi_name,
                    f"DQ-{i} of Data",
                    "prophet",
                    start_date,
                    end_date,
                )
            )

    return df_all, graphs


def compute_seasonality(sample_df):
    """[summary]

    :param sample_df: [description]
    :type sample_df: [type]
    :return: [description]
    :rtype: [type]
    """
    decomposition = sm.tsa.seasonal_decompose(sample_df, model="additive")
    value_dict = {}
    for i in range(2, 13):
        difference = abs(
            sum((decomposition.seasonal - decomposition.seasonal.shift(i)).fillna(0))
        )
        value_dict.update({i: difference})
    print("The seasonality matrix: ", value_dict)
    return min(value_dict, key=value_dict.get)


def run_ets(
    df_prepped,
    date_column,
    target_column,
    interval_width,
    seasonality="infer",
    damp_trend=True,
    trend_nature="add",
    error_nature="add",
    seasonal_nature="add",
):
    """[summary]

    :param df_prepped: [description]
    :type df_prepped: [type]
    :param date_column: [description]
    :type date_column: [type]
    :param target_column: [description]
    :type target_column: [type]
    :param interval_width: [description]
    :type interval_width: [type]
    :param seasonality: [description], defaults to "infer"
    :type seasonality: str, optional
    :param damp_trend: [description], defaults to True
    :type damp_trend: bool, optional
    :param trend_nature: [description], defaults to "add"
    :type trend_nature: str, optional
    :param error_nature: [description], defaults to "add"
    :type error_nature: str, optional
    :param seasonal_nature: [description], defaults to "add"
    :type seasonal_nature: str, optional
    :return: [description]
    :rtype: [type]
    """

    df_prepped.rename(columns={date_column: "ds", target_column: "y"}, inplace=True)
    df_prepped["y"] = df_prepped["y"].astype("float64")
    df_prepped_ets = pd.Series(
        df_prepped["y"].tolist(), index=df_prepped["ds"].tolist()
    )
    if seasonality != "infer":
        model = ETSModel(
            df_prepped_ets,
            error=error_nature,
            trend=trend_nature,
            seasonal=seasonal_nature,
            damped_trend=damp_trend,
            seasonal_periods=seasonality,
        )

    else:
        model = ETSModel(
            df_prepped_ets,
            error="add",
            trend="add",
            seasonal="add",
            damped_trend=damp_trend,
            seasonal_periods=compute_seasonality(df_prepped),
        )

    fit = model.fit()
    pred = fit.get_prediction(end=df_prepped.tail()["ds"].iloc[-1])
    pred_df = pred.summary_frame(
        alpha=1 - interval_width,
    )
    pred_df.rename(
        columns={"mean": "yhat", "pi_lower": "yhat_lower", "pi_upper": "yhat_upper"},
        inplace=True,
    )
    pred_df = pred_df.reset_index().rename(columns={"index": "ds"})
    return detect_anomalies(pred_df.merge(df_prepped, how="inner", on="ds"))


def compute_severity(row, std_dev):
    # Calculate z-score
    if row["anomaly"] == 0:
        # No anomaly. Severity is 0 ;)
        return 0
    elif row["anomaly"] == 1:
        # Check num deviations from upper bound of CI
        zscore = (row["y"] - row["yhat_upper"]) / std_dev
    elif row["anomaly"] == -1:
        # Check num deviations from lower bound of CI
        zscore = (row["y"] - row["yhat_lower"]) / std_dev

    ZSCORE_UPPER_BOUND = 2.5
    # Scale zscore where 4 scales to 100; -4 scales to -100
    severity = zscore * 100 / ZSCORE_UPPER_BOUND
    severity = abs(severity)

    # Bound between min and max score
    # If above 100, we return 100; If below -100, we return -100
    def bound_between(min_val, val, max_val):
        return min(max(val, min_val), max_val)

    return bound_between(0, severity, 100)


def detect_severity(df_anomaly):
    std_dev = df_anomaly["y"].std()
    df_anomaly["severity"] = df_anomaly.apply(
        lambda row: compute_severity(row, std_dev), axis=1
    )
    return df_anomaly


# PLOTTING CODE
#
#
#
def plot_top_n_anomalies(
    df_anomaly, kpi_name, algo_used, start_date, end_date, num_graphs=5
):
    """Plot all the relavent graphs for the data.

    :param df_anomaly: multi-dimensional anomaly dataframe
    :type df_anomaly: pandas.core.frame.DataFrame
    :param kpi_name: name of the KPI
    :type kpi_name: str
    :param algo_used: name of the algorithm used
    :type algo_used: str
    :param start_date: start date of entries in the cut dataframe
    :type start_date: str
    :param end_date: end date of entries in the cut dataframe
    :type end_date: str
    """

    display(
        plot_sorted_anomalies_df(
            df_anomaly[df_anomaly["sub_dimension"] == "overall_kpi"],
            kpi_name,
            "overall_kpi",
            algo_used,
            start_date,
            end_date,
        )
    )

    largest_anomaly_contribution = []

    for sub_dim in df_anomaly.sort_values(by="severity", ascending=False)[
        "sub_dimension"
    ].unique():
        if sub_dim != "overall_kpi" and len(largest_anomaly_contribution) <= num_graphs:

            display(
                plot_sorted_anomalies_df(
                    df_anomaly[df_anomaly["sub_dimension"] == sub_dim],
                    kpi_name,
                    sub_dim,
                    algo_used,
                    start_date,
                    end_date,
                )
            )
            largest_anomaly_contribution.append(sub_dim)


def plot_sorted_anomalies_df(
    df_anomaly, kpi, sub_dimension, algo_used="Prophet", start_date=None, end_date=None
):
    """Plots all the relavent graphs for the dataset

    :param forecasted: dataframe which the run_{algorithm} function returns
    :type forecasted: pandas.core.frame.DataFrame
    :param kpi: name of the KPI we are running the analysis for
    :type kpi: str
    :param sub_dimension: sub dimension name on which we are running the analysis
    :type sub_dimension: str
    :param algo_used: The algorith used to run the analysis, defaults to "Prophet"
    :type algo_used: str, optional
    :param start_date: Start date of the dataframe entries, defaults to None
    :type start_date: str, optional
    :param end_date: End date of the dataframe entries, defaults to None
    :type end_date: str, optional
    :return: does not return any value, displays all the relavent graphs and highlights the 'important' points.
    :rtype: NoneType
    """
    fact = (
        alt.Chart(df_anomaly)
        .mark_line(size=1.5, opacity=0.8, color="Black", point=True)
        .encode(
            x="ds:T",
            y=alt.Y("y"),
            tooltip=["ds", "y", "yhat_lower", "yhat_upper", "severity"],
        )
        .interactive()
    )

    anomalies = (
        alt.Chart(df_anomaly[df_anomaly.anomaly != 0])
        .mark_circle(size=150, color="Red", filled=False)
        .encode(
            x="ds:T",
            y=alt.Y("y", title=kpi),
            tooltip=["ds", "y", "yhat_lower", "yhat_upper", "severity"],
        )
        .interactive()
    )

    if algo_used != "stddevi":
        interval = (
            alt.Chart(df_anomaly)
            .mark_area(interpolate="basis", color="#98FB98")
            .encode(
                x=alt.X("ds:T", title="date"),
                y="yhat_upper",
                y2="yhat_lower",
                tooltip=["ds", "y", "yhat_lower", "yhat_upper", "severity"],
            )
            .interactive()
            .properties(
                title=f"Anomaly: {sub_dimension} {algo_used}; {start_date} to {end_date}"
            )
        )

        return (
            alt.layer(interval, fact, anomalies)
            .properties(width=870, height=450)
            .configure_title(fontSize=20)
        )

    interval_upper = (
        alt.Chart(df_anomaly)
        .mark_line(color="black", strokeDash=[3, 5])
        .encode(
            x=alt.X("ds:T", title="date"),
            y="yhat_upper",
            tooltip=["ds", "y", "yhat_lower", "yhat_upper", "severity"],
        )
        .interactive()
        .properties(
            title=f"Anomaly: {sub_dimension} {algo_used}; {start_date} to {end_date}"
        )
    )

    interval_lower = (
        alt.Chart(forecasted)
        .mark_line(color="black", strokeDash=[3, 5])
        .encode(
            x=alt.X("ds:T", title="date"),
            y="yhat_lower",
            tooltip=["ds", "y", "yhat_lower", "yhat_upper", "severity"],
        )
        .interactive()
        .properties(
            title=f"Anomaly: {sub_dimension} {algo_used}; {start_date} to {end_date}"
        )
    )
    return (
        alt.layer(interval_upper, interval_lower, fact, anomalies)
        .properties(width=870, height=450)
        .configure_title(fontSize=20)
    )


def get_top_n_correlated_anomalies(
    df_anomaly, no_of_days_around_anomaly, top_n_correlated_anomaly
):
    """Returns the dataframe which contains the top 'n' anomalies in the sub dimensions that
    are corelated with the overall KPI.

    :param df_anomaly: multi-dimensional anomaly dataframe
    :type df_anomaly: pandas.core.frame.Dataframe
    :param no_of_days_around_anomaly: number of days around the detected overall KPI anomaly
    we want to check in the sub-dimensional anomalies
    :type no_of_days_around_anomaly: int
    :param top_n_correlated_anomaly: the number of anomalies in the overall KPI
    :type top_n_correlated_anomaly: int
    :return: dataframe with the top 'n' correlated anomalies based on their importance
    :rtype: pandas.core.frame.Dataframe
    """
    df_kpi = df_anomaly[df_anomaly["sub_dimension"] == "overall_kpi"]
    dates_row_no = get_top_n_anomalies_independent(
        df_kpi, top_n_correlated_anomaly, True
    )

    kpi_anomaly_dates_list = df_anomaly.loc[dates_row_no]["ds"].tolist()
    dates_list_kpi = [i.date() for i in kpi_anomaly_dates_list]
    # display(kpi_anomaly_dates_list)

    dates_list = computes_dates_correlated_anomaly(
        dates_list_kpi, no_of_days_around_anomaly
    )
    # display(dates_list)

    df_kpi["isImp"] = 0
    df_kpi.loc[df_kpi[df_kpi["ds"].isin(kpi_anomaly_dates_list)].index, "isImp"] = 1

    dt_list = pd.DataFrame(dates_list)[0].tolist()

    # -----------------------------------------------
    # todo: need to optimize
    df_all_subdim = df_anomaly[df_anomaly["sub_dimension"] != "overall_kpi"]
    df_all_subdim = df_all_subdim[df_all_subdim["anomaly"] != 0]
    df_all_subdim = df_all_subdim[df_all_subdim["ds"].isin(dt_list)]
    df_all_subdim["isImp"] = 1

    df_all_subdim.loc[
        df_all_subdim[~df_all_subdim["ds"].isin(dt_list)].index, "isImp"
    ] = 0

    df_anomaly = (
        df_anomaly.merge(df_all_subdim, how="outer")
        .merge(df_kpi, how="outer")
        .fillna(int(0))
    )
    df_anomaly.loc[df_anomaly[~df_anomaly["ds"].isin(dt_list)].index, "isImp"] = 0

    return df_anomaly


def get_top_n_anomalies_independent(df_anomaly, top_n_anomalies, corr=False):
    """Returns the top 'n' independent anomalies in a given dataframe.

    :param df_anomaly: the multi-dimensional anomaly dataframe
    :type df_anomaly: pandas.core.frame.DataFrame
    :param top_n_anomalies: the top 'n' anomalies in the dataset
    :type top_n_anomalies: int
    :param corr: parameter to run correlated anomaly detection, defaults to True
    :type corr: bool, optional
    :return: returns a dataframe with the anomalies of importance or index numbers of anomalies of importance depending on the `corr` parameter.
    :rtype: pandas.core.frame.DataFrame or pandas.core.indexes.numeric.Int64Index
    """
    if not corr:
        df_anomaly.nlargest(top_n_anomalies, "severity")
        df_anomaly["isImp"] = 0
        df_anomaly.loc[
            df_anomaly.nlargest(top_n_anomalies, "severity").index, "isImp"
        ] = 1
        return df_anomaly
    return df_anomaly.nlargest(top_n_anomalies, "severity").index


def computes_dates_correlated_anomaly(dates_list, no_of_days_around_anomaly):
    """Computes all the dates near an anomaly of importance

    :param dates_list: list of dates of anomalies occuring in overall KPI
    :type dates_list: list
    :param no_of_days_around_anomaly: number of days of interest around the anomaly
    :type no_of_days_around_anomaly: int
    :return: list of dates where imortant anomalies occur
    :rtype: list
    """
    for date in dates_list.copy():
        date_inc = date_dec = date
        for _ in range(no_of_days_around_anomaly):
            date_inc += timedelta(days=1)
            date_dec -= timedelta(days=1)
            dates_list.extend([date_dec, date_inc])
    return dates_list


################################

# Code for testing

# import os
# from sqlalchemy import create_engine
# engine  = create_engine(os.environ['DATABASE_URL'])
# connection = engine.connect()
# import pandas as pd
# start_date = "2021-06-15"
# end_date = "2021-09-15"
# df = pd.read_sql(f"SELECT * from ecom_retail where date > '{start_date}' and date < '{end_date}'", connection)
# df.drop(columns=['index'], inplace=True)

# df = cut_dataframe(df, start_date, end_date)

# sensitivity_class = "High"


# df_anomaly = compute_entire_multi_dim_anomaly(
#     df.rename(columns={'InvoiceNo': 'num_purchases'}),
#     'num_purchases',
#     {'num_purchases': 'count'},
#     ['Country', 'PurchaseTime'],
#     date_column='date',
#     algo_used='prophet',
#     num_deviation=None,
#     num_deviation_lower=None,
#     num_deviation_upper=None,
#     interval_width=DEFAULT_SENSITIVITY_THRESHOLDS[sensitivity_class],
#     seasonality="auto",
#     frequency='D'
# )

# graphs = anomaly_detection(
#     df_entire=df.rename(columns={'InvoiceNo': 'num_purchases'}),
#     start_date='2021-06-15',
#     end_date='2021-09-15',
#     kpi_column_name='num_purchases',
#     agg_dict={'num_purchases': 'count'},
#     sub_dimensions=['Country', 'PurchaseTime'],
#     date_column_name='date',
#     frequency='D',
#     algo_used='prophet',
#     interval_width=DEFAULT_SENSITIVITY_THRESHOLDS[sensitivity_class],
#     num_days_around_kpi_anomaly=1,
#     num_anomalies_kpi=15,
#     plot_in_altair=False
# )

# df_all, graphs_dq = get_dq_json(
#     df.rename(columns={'InvoiceNo': 'num_purchases'}),
#     "prophet",
#     "date",
#     "num_purchases",
#     0.8,
#     'D'
# )

# print(df_anomaly)
