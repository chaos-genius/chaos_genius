import React, { useEffect, useState } from 'react';

import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import highchartsMore from 'highcharts/highcharts-more';
import { HRNumbers } from '../../utils/Formatting/Numbers/humanReadableNumberFormatter';
import { getTimezone, formatDateTime } from '../../utils/date-helper';

highchartsMore(Highcharts);
Highcharts.setOptions({
  time: {
    timezone: getTimezone()
  }
});

const Anomalygraph = ({ drilldown }) => {
  const [chartdata, setChartData] = useState([]);

  useEffect(() => {
    renderChart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        prev != null &&
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

  // Find slope and y-intercept of line between two points
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

  const renderChart = () => {
    if (drilldown !== null) {
      const graphData = drilldown;
      const zones = findAnomalyZones(graphData.intervals, graphData.values);
      const demoChart = {
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
        time: {
          timezone: getTimezone()
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
              symbol: 'circle',
              enabled: false
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
            marker: {
              fillColor: 'grey',
              enabled: false,
              symbol: 'diamond'
            },
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
    }
  };

  return (
    <>
      {chartdata && (
        <HighchartsReact
          containerProps={{ className: 'chartContainer' }}
          highcharts={Highcharts}
          options={chartdata}
        />
      )}
    </>
  );
};
export default Anomalygraph;
