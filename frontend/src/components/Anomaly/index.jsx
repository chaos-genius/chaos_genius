import React, { useEffect, useState, useRef } from 'react';

import { useSelector, useDispatch } from 'react-redux';
// import Select from 'react-select';

import { useHistory } from 'react-router-dom';

import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import highchartsMore from 'highcharts/highcharts-more';

import Toparrow from '../../assets/images/toparrow.svg';

import Anomalygraph from '../Anomalygraph';
import Noresult from '../Noresult';
import AnomalyEmptyState from '../AnomalyEmptyState';

// import { formatDate } from '../../utils/date-helper';

import './anomaly.scss';

import {
  anomalyDetection,
  anomalyDrilldown,
  getAnomalyQualityData
} from '../../redux/actions';
import store from '../../redux/store';

highchartsMore(Highcharts);

const RESET_ACTION = {
  type: 'RESET'
};

// const data = [
//   {
//     value: 'dataquality',
//     label: 'Data Quality'
//   },
//   {
//     value: 'multidimensional',
//     label: 'Multi Dimensional'
//   }
// ];

const Anomaly = ({ kpi, anomalystatus }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  // const [graphData, setGraphData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [drilldownCollapse, setDrilldownCollapse] = useState(false);
  const [dataQualityCollapse, setDataQualityCollapse] = useState(false);
  // const [category, setCategory] = useState({
  //   value: 'dataquality',
  //   label: 'Data Quality'
  // });

  const idRef = useRef(0);

  const { anomalyDetectionData, anomalyDrilldownData, anomalyQualityData } =
    useSelector((state) => {
      return state.anomaly;
    });

  useEffect(() => {
    store.dispatch(RESET_ACTION);
    getAnomaly();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kpi]);

  const getAnomaly = () => {
    dispatch(anomalyDetection(kpi));
  };

  useEffect(() => {
    if (anomalyDetectionData) {
      idRef.current = anomalyDetectionData?.data?.base_anomaly_id;
      renderChart(anomalyDetectionData?.data?.chart_data);
      handleDataQuality(anomalyDetectionData?.data?.base_anomaly_id);
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
      history.push(`/kpi/settings/${kpi}`);
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
        xAxis: {
          type: 'datetime',
          title: {
            text: graphData.x_axis_label
          },
          min: graphData.x_axis_limits[0] * 1000,
          max: graphData.x_axis_limits[1] * 1000,
        },
        yAxis: {
          title: {
            text: graphData.y_axis_label
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
            s = s + '<br>Value: <b>' + this.y + '</b>';
            s = s + '<br>Severity: <b>' + severity_score[1] + '</b>';
            s =
              s +
              '<br>Datetime: <b>' +
              Highcharts.dateFormat('%Y %b %d %H:%M', this.x) +
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
                click: (event) => handleGraphClick(event)
                // click:  function () {
                //     // alert('title: ' + this);
                //     console.log("this",this)
                // //    this.handleGraphClick(this.x)
                // }
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
      // this.setState({
      //   chartData: demoChart
      // });
    } else {
      setChartData([]);
    }
  };

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
      // Update prev zone
      if (prev !== null && prev.color !== zone.color) {
        const interIdx = anomalyType === 1 ? 2 : 1;
        let { m: m1, b: b1 } = findSlopeAndYIntercept(
          [intervals[i - 1][0], intervals[i - 1][interIdx]],
          [interval[0], [interval[interIdx]]]
        );
        let { m: m2, b: b2 } = findSlopeAndYIntercept(values[i - 1], value);
        let { x } = findIntersection(m1, b1, m2, b2);

        prev.value = x;
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
  const handleGraphClick = (event) => {
    const unixDate = event.point.x;

    dispatch(
      anomalyDrilldown(kpi, {
        date: unixDate,
        base_anomaly_id: idRef.current
      })
    );
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

  return (
    <>
      {anomalystatus &&
      anomalystatus?.is_anomaly_precomputed !== true &&
      anomalystatus !== '' ? (
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
                    <div className="time-stamp">
                      <p>
                        Last updated:{' '}
                        <span>
                          {anomalyDetectionData?.anomaly_end_date ||
                            '-'}
                        </span>
                      </p>
                    </div>
                    {/* <Select
                      value={category}
                      options={data}
                      classNamePrefix="selectcategory"
                      placeholder="select"
                      isSearchable={false}
                      onChange={(e) => setCategory(e)}
                    /> */}
                  </div>

                  {chartData && chartData.length !== 0 && (
                    <HighchartsReact
                    containerProps={{className: 'chartContainer'}}
                      highcharts={Highcharts}
                      options={chartData}
                    />
                  )}
                </div>
              </div>
              {itemList && anomalyDrilldownData.length !== 0 ? (
                <div className="dashboard-layout">
                  <div
                    className={
                      drilldownCollapse && itemList.length !== 0
                        ? 'dashboard-header-wrapper '
                        : 'dashboard-header-wrapper header-wrapper-disable '
                    }>
                    <div className="dashboard-header">
                      <h3>Drill Downs</h3>
                    </div>
                    <div
                      className={
                        !drilldownCollapse && itemList.length !== 0
                          ? 'header-collapse header-disable'
                          : 'header-collapse'
                      }
                      onClick={() => setDrilldownCollapse(!drilldownCollapse)}>
                      <img src={Toparrow} alt="CollapseOpen" />
                    </div>
                  </div>
                  {drilldownCollapse && itemList.length !== 0 ? (
                    <div
                      className={
                        drilldownCollapse
                          ? 'dashboard-container'
                          : 'dashboard-container drilldown-disable'
                      }>
                      {itemList}
                    </div>
                  ) : null}
                </div>
              ) : null}
              <div className="dashboard-layout">
                <div
                  className={
                    !dataQualityCollapse
                      ? 'dashboard-header-wrapper header-wrapper-disable'
                      : 'dashboard-header-wrapper'
                  }>
                  <div className="dashboard-header">
                    <h3>Data Quality</h3>
                  </div>
                  <div
                    className={
                      !dataQualityCollapse
                        ? 'header-collapse header-disable'
                        : 'header-collapse'
                    }
                    onClick={() =>
                      setDataQualityCollapse(!dataQualityCollapse)
                    }>
                    <img src={Toparrow} alt="CollapseOpen" />
                  </div>
                </div>
                {dataQualityCollapse ? (
                  <div
                    className={
                      dataQualityCollapse
                        ? 'dashboard-container'
                        : 'dashboard-container drilldown-disable'
                    }>
                    {dataQualityList}
                  </div>
                ) : null}
              </div>
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
