import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import highchartsMore from 'highcharts/highcharts-more';

import Toparrow from '../../assets/images/toparrow.svg';
import Refresh from '../../assets/images/refresh.svg';
import Anomalygraph from '../Anomalygraph';
import Noresult from '../Noresult';
import AnomalyEmptyState from '../AnomalyEmptyState';
import EmptyAnomalyDrilldown from '../EmptyDrillDown';
import { formatDateTime, getTimezone } from '../../utils/date-helper';
import { HRNumbers } from '../../utils/Formatting/Numbers/humanReadableNumberFormatter';
import './anomaly.scss';

import {
  anomalyDetection,
  anomalyDrilldown,
  getAnomalyQualityData,
  setRetrain
} from '../../redux/actions';
import store from '../../redux/store';
import SubdimensionEmpty from '../SubdimensionEmpty';
import EmptyDataQualityAnomaly from '../EmptyDataQualityAnomaly';

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

const Anomaly = ({ kpi, anomalystatus, dashboard }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [chartData, setChartData] = useState([]);
  const [subDimLoading, setSubDimloading] = useState(true);
  const [retrainOn, setRetrainOn] = useState(false);
  const [subDimList, setSubDimList] = useState([]);
  const [drilldownCollapse, setDrilldownCollapse] = useState(false);
  const [dataQualityCollapse, setDataQualityCollapse] = useState(false);
  const [anomalStatusInfo, setAnomalyStatusInfo] = useState(false);
  const [kpiTab, setKPITab] = useState('Overall KPI');

  const idRef = useRef(0);
  const isFirstRun = useRef(true);

  const KPITabs = [{ name: 'Overall KPI' }, { name: 'Sub-dimensions' }];

  const {
    anomalyDetectionData,
    anomalyDrilldownData,
    anomalyQualityData,
    retrain
  } = useSelector((state) => {
    return state.anomaly;
  });

  useEffect(() => {
    store.dispatch(RESET_ACTION);
    getAnomaly(kpiTab);
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
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    store.dispatch(RESET_ACTION);
    getAnomaly(kpiTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kpiTab]);

  const getAnomaly = (tab) => {
    if (tab === 'Sub-dimensions') {
      setSubDimloading(true);
    }
    dispatch(anomalyDetection(kpi, tab));
  };
  useEffect(() => {
    let subDimesionList = [];
    if (kpiTab === 'Overall KPI') {
      if (anomalyDetectionData) {
        idRef.current = anomalyDetectionData?.data?.base_anomaly_id;
        renderChart(anomalyDetectionData?.data?.chart_data);
        handleDataQuality(anomalyDetectionData?.data?.base_anomaly_id);
      }
    } else if (kpiTab === 'Sub-dimensions') {
      setSubDimloading(false);
      if (anomalyDetectionData) {
        subDimesionList =
          anomalyDetectionData?.data?.length &&
          anomalyDetectionData?.data?.map((anomaly) => (
            <Anomalygraph key={`dl-${anomaly.title}`} drilldown={anomaly} />
          ));
        setSubDimList(subDimesionList);
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
            let s =
              'Confidence Interval: <b>' +
              intervals[1] +
              ' - ' +
              intervals[2] +
              '</b>';
            s =
              s +
              '<br>Value: <b>' +
              Highcharts.numberFormat(this.y, 2) +
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

  const handleRetrain = () => {
    dispatch(setRetrain(kpi));
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
                      <div className="option-selections">
                        {KPITabs?.length &&
                          KPITabs.map(function (tab, i) {
                            return (
                              <span
                                onClick={() => setKPITab(tab.name)}
                                className={
                                  tab.name === kpiTab ? 'active' : 'inactive'
                                }
                                key={i}>
                                {tab.name}
                              </span>
                            );
                          })}
                      </div>
                    </div>
                  </div>

                  {kpiTab === 'Overall KPI' &&
                  chartData &&
                  chartData.length !== 0 ? (
                    <HighchartsReact
                      containerProps={{ className: 'chartContainer' }}
                      highcharts={Highcharts}
                      options={chartData}
                    />
                  ) : subDimLoading ? null : subDimList && subDimList.length ? (
                    subDimList
                  ) : (
                    <div className="dashboard-layout setup-layout-empty">
                      <SubdimensionEmpty />
                    </div>
                  )}
                  {kpiTab === 'Overall KPI' && (
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
              {itemList &&
              anomalyDrilldownData !== '' &&
              kpiTab === 'Overall KPI' ? (
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
                  {drilldownCollapse ? (
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
              ) : null}

              {kpiTab === 'Overall KPI' ? (
                <div className="dashboard-layout">
                  <div
                    className={
                      !dataQualityCollapse
                        ? 'dashboard-header-wrapper header-wrapper-disable'
                        : 'dashboard-header-wrapper'
                    }
                    onClick={() =>
                      setDataQualityCollapse(!dataQualityCollapse)
                    }>
                    <div className="dashboard-header">
                      <h3>Data Quality</h3>
                    </div>
                    <div
                      className={
                        !dataQualityCollapse
                          ? 'header-collapse header-disable'
                          : 'header-collapse'
                      }>
                      <img src={Toparrow} alt="CollapseOpen" />
                    </div>
                  </div>
                  {dataQualityCollapse ? (
                    <>
                      {anomalyQualityData !== '' &&
                      dataQualityList &&
                      dataQualityList.length !== 0 ? (
                        <div
                          className={
                            dataQualityCollapse
                              ? 'dashboard-container'
                              : 'dashboard-container drilldown-disable'
                          }>
                          {dataQualityList}
                        </div>
                      ) : (
                        anomalyQualityData !== '' && (
                          <div className="anomaly-drilldown-empty">
                            <EmptyDataQualityAnomaly />
                          </div>
                        )
                      )}
                    </>
                  ) : null}
                </div>
              ) : null}
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
