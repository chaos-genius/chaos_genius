import pandas as pd
import numpy as np
from prophet import Prophet

try:
    from IPython.display import display
except ModuleNotFoundError:
    display = print
    
def cut_dataframe(df_entire,
                  start_date,
                  end_date,
                  date_column = "date"):
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
    forecasted['anomaly'] = 0
    forecasted.loc[forecasted['y'] > forecasted['yhat_upper'], 'anomaly'] = 1
    forecasted.loc[forecasted['y'] < forecasted['yhat_lower'], 'anomaly'] = -1

    #anomaly importances
    forecasted['importance'] = 0
    forecasted.loc[forecasted['anomaly'] ==1, 'importance'] = \
        (forecasted['y'] - forecasted['yhat_upper'])/forecasted['y']
    forecasted.loc[forecasted['anomaly'] ==-1, 'importance'] = \
        (forecasted['yhat_lower'] - forecasted['y'])/forecasted['y']

    return forecasted


def run_prophet(df_prepped,
                date_column,
                target_column,
                interval_width  = 0.80,
                weekly_seasonality = 'auto',
                yearly_seasonality = False,
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
    df_prepped.rename(columns={date_column:'ds',
                       target_column:'y'},
              inplace=True)
    model = Prophet(interval_width = interval_width,
                    yearly_seasonality = yearly_seasonality,
                    weekly_seasonality=weekly_seasonality)
    model.fit(df_prepped)    
    future = model.make_future_dataframe(periods=0)
    forecast = model.predict(future)
    forecast = forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']]
    forecast = forecast.merge(df_prepped)
    df_anomaly = detect_anomalies(forecast)
    return df_anomaly

def run_stddevi(df_prepped,
               date_column,
               target_column,
               num_devi = 0,
               num_devi_u = None,
               num_devi_l = None):
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
    df_prepped.rename(columns={date_column:'ds',
                       target_column:'y'},
              inplace=True)

    mean = df_prepped["y"].mean()
    stddevi =  df_prepped["y"].std()

    if num_devi:
        num_devi_u = num_devi_l = num_devi

    threshold_u = mean + (num_devi_u * stddevi)
    threshold_l = mean - (num_devi_l * stddevi)
    df_prepped['yhat_lower'] =  threshold_l
    df_prepped['yhat_upper'] = threshold_u
    df_prepped['yhat'] = (threshold_l + threshold_u)/2
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
    population_threshold = base_population_threshold + (df_entire.shape[0]*0.01)
    return population_threshold
    
def compute_entire_multi_dim_anomaly(df_entire,
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
                                     frequency='D'
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
    # """Computes the entire multi-dimensionality anomaly dataframe

    # :param df_entire: entire dataframe after pre-processing
    # :type df_entire: pandas.core.frame.DataFrame
    # :param threshold_data_points: minimum number of datapoints that must be present in the dataframe for the analysis to run
    # :type threshold_data_points: int
    # :param kpi_name: name of the KPI column in the dataset
    # :type kpi_name: str
    # :param agg_dict: agrregation dictionary which holds the key value pair of column name and the operation to be performed
    # :type agg_dict: dict
    # :param sub_dim_column: name of the sub dimension column
    # :type sub_dim_column: str
    # :param date_column: name of the data column in the dataframe
    # :type date_column: str
    # :param interval_width: confidence interval width for the algorithm (prophet), defaults to 0.80
    # :type interval_width: float, optional
    # :return: dataframe of all anomalies, including overall and subdimension
    # :rtype: pandas.core.frame.DataFrame
    # """

    #if you using different pre-processing, like interpolating, etc yhe below code must be modified
    
    df_prepped = prepare_dataframe_for_anomaly(
                    df_entire[[date_column, kpi_name]], 
                    date_column, 
                    agg_dict, 
                    frequency
                )

    df_anomaly = compute_subdim_anomaly_dataframe(
                    df_prepped=df_prepped,
                    sub_dim_name="overall KPI",
                    date_column=date_column,
                    kpi_name=kpi_name,
                    algo_used=algo_used,
                    interval_width=interval_width,
                    num_devi=num_deviation,
                    num_devi_u=num_deviation_upper,
                    num_devi_l=num_deviation_lower
                )
    
    # TODO: handling missing values in subdims
    
#     subdim = '-'.join(sub_dim_column)
#     df_entire[sub_dim_column] = df_entire[sub_dim_column].fillna(value="unknown")
#     df_entire[subdim] = df_entire[sub_dim_column].apply(lambda x: '-'.join(x), axis=1)
#     df_entire  = df_entire.drop(columns=sub_dim_column)

    population_threshold = compute_population_threshold(df_entire, base_population_threshold=500)
    
    for subdim in sub_dim_column:
        print(f"Current Dimension {subdim}")
        for sub_dim in df_entire[subdim].unique():
            df_sub_dim = df_entire[df_entire[subdim]==sub_dim][[date_column, kpi_name]]
            
            if df_sub_dim.shape[0] > population_threshold:
                print(f"Processing SubDim: {sub_dim}")
                # for a distributed arch, just call these in individual workers
                df_prepped_sub_dim = prepare_dataframe_for_anomaly(df_sub_dim, date_column, agg_dict, frequency)

                df_anomaly_subdim = compute_subdim_anomaly_dataframe(
                                        df_prepped_sub_dim,
                                        sub_dim,
                                        date_column,
                                        kpi_name,
                                        algo_used,
                                        interval_width,
                                        num_deviation,
                                        num_deviation_upper,
                                        num_deviation_lower
                                    )   
                
                # the appending bit
                # TODO: make a list of df, then pd.concat them
                df_anomaly = df_anomaly.append(df_anomaly_subdim, ignore_index=True)
    return df_anomaly

def prepare_dataframe_for_anomaly(df_sub_dim,
                                 date_column,
                                 agg_dict,
                                 frequency='D'):
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
    return df_sub_dim.set_index(date_column).resample(frequency).agg(agg_dict).reset_index()


def compute_subdim_anomaly_dataframe(df_prepped,
                                     sub_dim_name,
                                     date_column,
                                     kpi_name,
                                     algo_used,
                                     interval_width=0.8,
                                     num_devi=None,
                                     num_devi_u=None,
                                     num_devi_l=None):
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
        df_subdim_anomaly = run_prophet(df_prepped, date_column, target_column=kpi_name, \
                    interval_width = interval_width)
        df_subdim_anomaly['sub_dimension'] = sub_dim_name
        
#     elif algo_used == "ets":
#         df_anomaly_subdim = run_ets(df_prepped, date_column, target_column=kpi_name, \
#                     interval_width = interval_width, seasonality=2)

    elif algo_used == "stddevi":
        df_subdim_anomaly = run_stddevi(df_prepped, date_column, target_column=kpi_name, \
                        num_devi=num_deviation, num_devi_u=num_deviation_upper,
                        num_devi_l=num_deviation_lower)
        df_subdim_anomaly['sub_dimension'] = sub_dim_name
        
    return df_subdim_anomaly


        
    
    
    
    

# Testing
if __name__ == '__main__':
    # compute_entire_multi_dim_anomaly(df.rename(columns={'InvoiceNo': 'num_purchases'}),
    #                              kpi_name='num_purchases',
    #                              agg_dict = {"num_purchases": "sum"},
    #                              sub_dim_column=['Country', 'PurchaseTime'], 
    #                              date_column='date', 
    #                              frequency='D', 
    #                              algo_used='prophet',
    #                              interval_width=0.80)
    
    



