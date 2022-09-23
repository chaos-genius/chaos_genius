import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import Select from 'react-select';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import highchartsMore from 'highcharts/highcharts-more';

import Toparrow from '../../assets/images/toparrow.svg';
import Refresh from '../../assets/images/refresh.svg';
import download from '../../assets/images/Download.svg';
import Anomalygraph from '../Anomalygraph';
import Noresult from '../Noresult';
import AnomalyEmptyState from '../AnomalyEmptyState';
import EmptyAnomalyDrilldown from '../EmptyDrillDown';
import { formatDateTime, getTimezone } from '../../utils/date-helper';
import { HRNumbers } from '../../utils/Formatting/Numbers/humanReadableNumberFormatter';
import subdimFilterImage from '../../assets/images/subdim_filter.svg';
import './anomaly.scss';

import deepDrillGif from '../../assets/Animations/PH_Animation.gif';

import {
  anomalyDetection,
  anomalyDrilldown,
  getAnomalyQualityData,
  setRetrain
} from '../../redux/actions';
import store from '../../redux/store';

import { useToast } from 'react-toast-wnm';
import { CustomContent, CustomActions } from '../../utils/toast-helper';
import { downloadCsv } from '../../utils/download-helper';
import { anomalyDownloadCsv } from '../../redux/actions/Anomaly';

highchartsMore(Highcharts);
Highcharts.setOptions({
  time: {
    timezone: getTimezone()
  }
});

const RESET_ACTION = {
  type: 'RESET'
};

const RESET = {
  type: 'RESET_DRILL'
};

const RESET_CSV = {
  type: 'RESET_CSV'
};

const customStyles = {
  container: (provided) => ({
    ...provided,
    width: 140
  })
};

const Anomaly = ({ kpi, anomalystatus, dashboard }) => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const dispatch = useDispatch();
  const history = useHistory();
  const toast = useToast();
  const [chartData, setChartData] = useState([]);
  const [retrainOn, setRetrainOn] = useState(false);
  const [drilldownCollapse, setDrilldownCollapse] = useState(true);
  const [anomalStatusInfo, setAnomalyStatusInfo] = useState(false);
  const [dimension, setDimension] = useState(
    query.getAll('dimension')?.length > 0
      ? {
          value: query.getAll('dimension')[0],
          label: query.getAll('dimension')[0]
        }
      : null
  );
  const [value, setValue] = useState(
    query.getAll('value')?.length > 0
      ? { value: query.getAll('value')[0], label: query.getAll('value')[0] }
      : null
  );
  const [dimensionOptions, setDimensionOptions] = useState([]);
  const [valueOptions, setValueOptions] = useState([]);

  const idRef = useRef(0);

  const handleRetrain = () => {
    dispatch(setRetrain(kpi));
  };

  const handleDownloadClick = () => {
    const params =
      dimension?.value && value?.value !== undefined && value?.value !== null
        ? { dimension: dimension?.value, value: value?.value }
        : {};
    dispatch(anomalyDownloadCsv(kpi, params));
  };

  const handleDimensionChange = (e) => {
    let params = new URLSearchParams();
    params.append('dimension', e.value);
    history.push({
      pathname: kpi,
      search: '?' + params.toString()
    });
    setDimension(e);
    if (anomalyDetectionData && anomalyDetectionData.dimensions_values) {
      const dimensionIndex = anomalyDetectionData.dimensions_values?.findIndex(
        (dimensionItem) => {
          return e.value.toString() === dimensionItem.value.toString();
        }
      );
      if (dimensionIndex >= 0) {
        setValueOptions(
          anomalyDetectionData.dimensions_values[dimensionIndex]
            .subdim_value_options
        );
      }
    }
    setValue(null);
  };

  const handleValueChange = (e) => {
    setValue(e);
    let params = new URLSearchParams();
    params.append('dimension', dimension?.value);
    params.append('value', e.value);
    history.push({
      pathname: kpi,
      search: '?' + params.toString()
    });
    store.dispatch(RESET_ACTION);
    let dimFilterObj = undefined;
    if (dimension && e) {
      dimFilterObj = { dimension: dimension.value, value: e.value };
    }
    dispatch(anomalyDetection(kpi, dimFilterObj));
  };

  const clearSubdimFilters = () => {
    setDimension(null);
    setValue(null);
    setValueOptions(null);
    const params = new URLSearchParams(location.search);
    params?.delete('dimension');
    params?.delete('value');
    history.push({
      pathname: kpi,
      search: params?.toString()
    });

    store.dispatch(RESET_ACTION);
    dispatch(anomalyDetection(kpi, null));
  };

  const {
    anomalyDetectionData,
    anomalyDrilldownData,
    anomalyQualityData,
    retrain,
    anomalyCsv
  } = useSelector((state) => {
    return state.anomaly;
  });

  useEffect(() => {
    if (
      anomalyCsv &&
      anomalyCsv.length !== 0 &&
      anomalyCsv.status !== 'failure'
    ) {
      let dimensionName = undefined;
      let valueName = undefined;
      if (dimension && dimensionOptions) {
        const filterObj = dimensionOptions.find((option) => {
          return option.value === dimension.value;
        });
        if (filterObj) {
          dimensionName = filterObj.label_path_safe;
        }
      }
      if (value && valueOptions) {
        const filterObj = valueOptions.find((option) => {
          return option.value === value.value;
        });
        if (filterObj) {
          valueName = filterObj.label_path_safe;
        }
      }
      downloadCsv(
        anomalyCsv,
        anomalyDetectionData?.kpi_name_path_safe && dimensionName && valueName
          ? `chaosgenius_${anomalyDetectionData?.kpi_name_path_safe}_anomaly_data_${dimensionName}_${valueName}.csv`
          : `chaosgenius_${anomalyDetectionData?.kpi_name_path_safe}_anomaly_data.csv`
      );
      store.dispatch(RESET_CSV);
    } else if (
      anomalyCsv &&
      anomalyCsv.length !== 0 &&
      anomalyCsv.status === 'failure'
    ) {
      customToast({
        type: 'failure',
        header: 'Failed to Download',
        description: anomalyCsv.message
      });
      store.dispatch(RESET_CSV);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anomalyCsv]);

  useEffect(() => {
    store.dispatch(RESET_ACTION);
    let dimFilterObj = undefined;
    if (dimension && value) {
      dimFilterObj = { dimension: dimension.value, value: value.value };
    }
    dispatch(anomalyDetection(kpi, dimFilterObj));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kpi]);

  useEffect(() => {
    if (retrain === true) {
      setRetrainOn(true);
    } else {
      setRetrainOn(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retrain]);

  useEffect(() => {
    if (anomalyDetectionData) {
      idRef.current = anomalyDetectionData?.data?.base_anomaly_id;
      renderChart(anomalyDetectionData?.data?.chart_data);
      handleDataQuality(anomalyDetectionData?.data?.base_anomaly_id);
      setDimensionOptions(anomalyDetectionData?.dimensions_values);
      if (dimension?.value) {
        const dimensionIndex =
          anomalyDetectionData.dimensions_values?.findIndex((dimensionItem) => {
            return (
              dimension.value.toString() === dimensionItem.value.toString()
            );
          });
        if (dimensionIndex >= 0) {
          setValueOptions(
            anomalyDetectionData.dimensions_values[dimensionIndex]
              .subdim_value_options
          );
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anomalyDetectionData]);

  let itemList = [];
  if (
    anomalyDrilldownData &&
    anomalyDrilldownData.length !== 0 &&
    anomalyDetectionData?.data?.chart_data
  ) {
    anomalyDrilldownData.map((obj) => {
      itemList.push(<Anomalygraph key={`dl-${obj.title}`} drilldown={obj} />);
      return '';
    });
  }
  let dataQualityList = [];
  if (anomalyQualityData && anomalyQualityData.length !== 0) {
    anomalyQualityData.map((obj) => {
      dataQualityList.push(
        <Anomalygraph key={`dl-${obj.title}`} drilldown={obj} />
      );
      return '';
    });
  }

  useEffect(() => {
    if (anomalystatus && anomalystatus?.is_anomaly_setup === false) {
      history.push(`/dashboard/${dashboard}/settings/${kpi}`);
    }
    if (
      anomalystatus &&
      anomalystatus?.is_anomaly_precomputed !== true &&
      anomalystatus !== ''
    ) {
      setAnomalyStatusInfo(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anomalystatus]);

  const renderChart = (graphData) => {
    if (graphData !== undefined) {
      let zones = findAnomalyZones(graphData.intervals, graphData.values);

      let demoChart = {
        chart: {
          zoomType: 'x,y',
          selectionMarkerFill: 'rgba(37, 204, 123, 0.25)'
        },
        title: {
          text: graphData.title
        },
        time: {
          timezone: getTimezone()
        },
        xAxis: {
          type: 'datetime',
          title: {
            text: graphData.x_axis_label
          },
          min: graphData.x_axis_limits[0] * 1000,
          max: graphData.x_axis_limits[1] * 1000
        },
        yAxis: {
          title: {
            text: graphData.y_axis_label
          },
          labels: {
            formatter: function () {
              return HRNumbers.toHumanString(this.value);
            }
          }
        },
        tooltip: {
          crosshairs: true,
          shared: true,
          valueSuffix: null,
          formatter: function () {
            const intervals = graphData.intervals.find(
              (row) => row[0] === this.x
            );
            const severity_score = graphData.severity.find(
              (row) => row[0] === this.x
            );
            const expected_value = graphData?.expected_values?.find((row) => {
              return row[0] === this.x;
            })[1];
            let s = 'Value: <b>' + Highcharts.numberFormat(this.y, 2) + '</b>';
            s =
              s +
              '<br>Expected Value: <b>' +
              (expected_value !== undefined &&
              expected_value !== null &&
              !isNaN(expected_value)
                ? expected_value
                : 'N/A') +
              '</b>';
            s =
              s +
              '<br>Expected Range: <b>' +
              intervals[1] +
              ' - ' +
              intervals[2] +
              '</b>';
            s = s + '<br>Severity: <b>' + severity_score[1] + '</b>';
            s =
              s +
              '<br>Datetime: <b>' +
              formatDateTime(this.x, true, true) +
              '</b>';
            return s;
          }
        },
        plotOptions: {
          series: {
            marker: {
              enabled: false
            },
            cursor: 'pointer',
            point: {
              events: {
                click: (event) => handleGraphClick(graphData, event)
              }
            }
          }
        },
        legend: {
          enabled: false,
          borderWidth: 1,
          padding: 20,
          title: {
            text: 'Legend<br/><span style="font-size: 9px; color: #666; font-weight: normal">(Click to hide)',
            style: {
              fontStyle: 'italic'
            }
          }
        },
        series: [
          {
            name: 'Value',
            id: 'value',
            zoneAxis: 'x',
            zones: zones,
            data: graphData.values,
            zIndex: 2,
            color: '#25cc7b',
            marker: {
              fillColor: 'white',
              lineWidth: 1,
              lineColor: 'grey',
              symbol: 'circle'
            }
          },
          {
            name: 'Confidence Interval',
            id: 'Confidence Interval',
            data: graphData.intervals,
            type: 'arearange',
            lineWidth: 0,
            linkedTo: ':previous',
            color: '#60CA9A',
            fillOpacity: 0.2,
            zIndex: 0,
            states: {
              inactive: {
                opacity: 0
              },
              hover: {
                enabled: false
              }
            }
          },
          {
            name: 'Predicted Value',
            id: 'predicted_value',
            visible: false,
            type: 'line',
            data: graphData.predicted_values,
            zIndex: 1,
            color: '#02964e',
            dashStyle: 'Dash',
            opacity: 0.5,
            marker: {
              fillColor: 'gray',
              lineWidth: 1,
              radius: 2,
              lineColor: 'white',
              enabled: false,
              symbol: 'circle'
            }
          }
        ]
      };

      setChartData(demoChart);
    } else {
      setChartData([]);
    }
  };

  //TODO: Create Single component to use this method instead of duplicating it.
  const findAnomalyZones = (intervals, values) => {
    let validColor = '#60CA9A',
      anomalyColor = '#EB5756';
    let zones = [];
    let prev = null;
    let anomalyType = null; // 1 for above Confidence interval. -1 for below
    for (let i = 0; i < values.length; i++) {
      let interval = intervals[i],
        value = values[i];
      let zone = {
        value: value[0]
      };

      // point is an anomaly
      if (value[1] < interval[1]) {
        anomalyType = -1;
        zone.color = anomalyColor;
      } else if (value[1] > interval[2]) {
        anomalyType = 1;
        zone.color = anomalyColor;
      } else {
        zone.color = validColor;
      }

      // Push prev zone if colors should be different
      // and there is some slope between prev and current
      // Update prev zone
      if (
        prev !== null &&
        prev.color !== zone.color &&
        prev.value !== value[0]
      ) {
        const interIdx = anomalyType === 1 ? 2 : 1;
        let { m: m1, b: b1 } = findSlopeAndYIntercept(
          [intervals[i - 1][0], intervals[i - 1][interIdx]],
          [interval[0], [interval[interIdx]]]
        );
        let { m: m2, b: b2 } = findSlopeAndYIntercept(values[i - 1], value);
        let { x } = findIntersection(m1, b1, m2, b2);
        prev.value = parseInt(x);
        zones.push(prev);
      }
      prev = zone;
    }

    // Add last zone
    if (zones.length > 0) {
      let lastTimestamp = values[values.length - 1][0];
      zones.push({
        // Some timestamp far beyond the largest timestamp, so that the end of the graph is the right color
        value: lastTimestamp * 2,
        color: prev.color
      });
    }
    return zones;
  };

  const findSlopeAndYIntercept = (p1, p2) => {
    const m = (p2[1] - p1[1]) / (p2[0] - p1[0]);
    const b = p1[1] - m * p1[0];
    return {
      m,
      b
    };
  };

  // Find the intersection of 2 lines using the slope and y-intercept of each line.
  const findIntersection = (m1, b1, m2, b2) => {
    let x = (b2 - b1) / (m1 - m2);
    let y = m1 * x + b1;
    return {
      x,
      y
    };
  };

  const handleGraphClick = (graphData, event) => {
    const unixDate = event.point.x;
    const severity_score = graphData.severity.find(
      (row) => row[0] === event.point.x
    );
    store.dispatch(RESET);
    setDrilldownCollapse(true);
    if (severity_score[1] !== 0) {
      dispatch(
        anomalyDrilldown(kpi, {
          date: unixDate,
          base_anomaly_id: idRef.current
        })
      );
    }
  };

  const handleDataQuality = (id) => {
    if (id !== undefined) {
      dispatch(
        getAnomalyQualityData(kpi, {
          base_anomaly_id: id
        })
      );
    }
  };

  const customToast = (data) => {
    const { type, header, description } = data;
    toast({
      autoDismiss: true,
      enableAnimation: true,
      delay: type === 'success' ? '5000' : '30000',
      backgroundColor: type === 'success' ? '#effaf5' : '#FEF6F5',
      borderRadius: '6px',
      color: '#222222',
      position: 'bottom-right',
      minWidth: '240px',
      width: 'auto',
      boxShadow: '4px 6px 32px -2px rgba(226, 226, 234, 0.24)',
      padding: '17px 14px',
      height: 'auto',
      border: type === 'success' ? '1px solid #60ca9a' : '1px solid #FEF6F5',
      type: type,
      actions: <CustomActions />,
      content: (
        <CustomContent
          header={header}
          description={description}
          failed={type === 'success' ? false : true}
        />
      )
    });
  };
  return (
    <>
      {retrainOn === true || anomalStatusInfo === true ? (
        <div className="dashboard-layout setup-layout-empty">
          <AnomalyEmptyState />
        </div>
      ) : (
        <>
          {anomalyDetectionData && anomalyDetectionData !== '' ? (
            <>
              <div className="dashboard-layout dashboard-layout-change">
                <div className="dashboard-container">
                  <div className="dashboard-subcategory anomaly-subcategory">
                    <div className="time-container">
                      <div className="time-stamp">
                        <p>
                          Last Data Entry:{' '}
                          <span>
                            {anomalyDetectionData?.anomaly_end_date
                              ? anomalyDetectionData?.anomaly_end_date
                              : '-'}
                          </span>
                        </p>
                      </div>
                      <div className="time-stamp">
                        <p>
                          Last Scan:{' '}
                          <span>
                            {anomalyDetectionData?.last_run_time_anomaly
                              ? anomalyDetectionData?.last_run_time_anomaly
                              : '-'}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="option-selections-container">
                      <div className="download-container">
                        <div className="option-selections">
                          <div className="filter-container">
                            <img src={subdimFilterImage} alt="filter" />
                          </div>
                          <div className="filter-container">
                            <span>Dimension =</span>
                            <Select
                              value={dimension}
                              placeholder="select"
                              styles={customStyles}
                              classNamePrefix="selectcategory"
                              isSearchable={true}
                              options={dimensionOptions}
                              onChange={(e) => handleDimensionChange(e)}
                            />
                          </div>
                          <div className="filter-container">
                            <span>Value =</span>
                            <Select
                              value={value}
                              placeholder="select"
                              styles={customStyles}
                              classNamePrefix="select_value selectcategory"
                              isSearchable={true}
                              options={valueOptions}
                              onChange={(e) => handleValueChange(e)}
                            />
                          </div>
                          {(dimension || value) && (
                            <div className="filter-container">
                              <span
                                className="clear-filter"
                                onClick={() => clearSubdimFilters()}>
                                Clear filter
                              </span>
                            </div>
                          )}
                        </div>
                        <div
                          className="download-icon"
                          onClick={() => handleDownloadClick()}>
                          <img src={download} alt="icon"></img>
                        </div>
                      </div>
                    </div>
                  </div>
                  {chartData && Object.keys(chartData)?.length && (
                    <HighchartsReact
                      containerProps={{ className: 'chartContainer' }}
                      highcharts={Highcharts}
                      options={chartData}
                    />
                  )}

                  {anomalyDetectionData?.is_overall && (
                    <div className="retrain-button-container">
                      <div
                        className="retrain-button"
                        onClick={() => handleRetrain()}>
                        <img src={Refresh} alt="alert-notification" />{' '}
                        <span>Retrain Model</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {anomalyDetectionData?.is_overall && (
                <div className="dashboard-layout">
                  <div
                    className={
                      drilldownCollapse
                        ? 'dashboard-header-wrapper '
                        : 'dashboard-header-wrapper header-wrapper-disable '
                    }
                    onClick={() => setDrilldownCollapse(!drilldownCollapse)}>
                    <div className="dashboard-header">
                      <h3>Drill Downs</h3>
                    </div>
                    <div
                      className={
                        !drilldownCollapse
                          ? 'header-collapse header-disable'
                          : 'header-collapse'
                      }>
                      <img src={Toparrow} alt="CollapseOpen" />
                    </div>
                  </div>
                  {itemList.length === 0 && (
                    <div
                      className={
                        drilldownCollapse
                          ? 'gif-container'
                          : 'gif-container drilldown-disable'
                      }>
                      <div className="ddgif_parent_container">
                        <div className="ddGif-container">
                          <img src={deepDrillGif} alt="deepDrillclick" />
                        </div>
                        <div className="info-container">
                          <span>
                            Click on the above graph to view{' '}
                            <span className="bold--info-text">Drill Downs</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  {drilldownCollapse &&
                  itemList &&
                  anomalyDrilldownData !== '' ? (
                    <>
                      {itemList.length ? (
                        <div
                          className={
                            drilldownCollapse
                              ? 'dashboard-container'
                              : 'dashboard-container drilldown-disable'
                          }>
                          {itemList}
                        </div>
                      ) : (
                        <div className="anomaly-drilldown-empty">
                          <EmptyAnomalyDrilldown />
                        </div>
                      )}
                    </>
                  ) : null}
                </div>
              )}
            </>
          ) : (
            anomalyDetectionData !== '' && <Noresult title="Anomaly" />
          )}
        </>
      )}
    </>
  );
};

export default Anomaly;
