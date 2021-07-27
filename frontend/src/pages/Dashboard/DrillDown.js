import React, { Component } from "react";

import { BASE_URL, DEFAULT_HEADERS } from '../../config/Constants'

import moment from 'moment'
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import highchartsMore from 'highcharts/highcharts-more'; highchartsMore(Highcharts);

class Anomaly extends Component {
    constructor(props) {
        super(props);
        this.state = {
            chartData: {},
        };
    }

    findAnomalyZones = (intervals, values) => {
        let validColor = "#25cc7b",
            anomalyColor = "#ff5f5f";
        let zones = Array();
        let prev = null;
        let anomalyType = null; // 1 for above Confidence interval. -1 for below
        for (let i = 0; i < values.length; i++) {
            let interval = intervals[i],
                value = values[i];
            let zone = {
                value: value[0],
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
            if (prev != null && prev.color != zone.color) {
                const interIdx = anomalyType == 1 ? 2 : 1;
                let { m: m1, b: b1 } = this.findSlopeAndYIntercept(
                    [intervals[i - 1][0], intervals[i - 1][interIdx]],
                    [interval[0], [interval[interIdx]]]
                );
                let { m: m2, b: b2 } = this.findSlopeAndYIntercept(values[i - 1], value);
                let { x, y } = this.findIntersection(m1, b1, m2, b2);

                prev.value = x;
                zones.push(prev);
            }
            prev = zone;
        }

        zones.push({
            value: Date.UTC(9999), // Some arbitrarily high date that will put a zone that goes until the end
            color: validColor,
        });
        return zones;
    }

    // Find slope and y-intercept of line between two points
    findSlopeAndYIntercept = (p1, p2) => {
        const m = (p2[1] - p1[1]) / (p2[0] - p1[0]);
        const b = p1[1] - m * p1[0];
        return {
            m,
            b,
        };
    }

    // Find the intersection of 2 lines using the slope and y-intercept of each line.
    findIntersection = (m1, b1, m2, b2) => {
        let x = (b2 - b1) / (m1 - m2);
        let y = m1 * x + b1;
        return {
            x,
            y,
        };
    }

    renderChart = () => {
        const graphData  = this.props.drillDown;
        const zones = this.findAnomalyZones(graphData.intervals, graphData.values);
        const demoChart = {
            chart: {
                zoomType: "x,y",
                selectionMarkerFill: "rgba(37, 204, 123, 0.25)",
            },
            title: {
                text: graphData.title,
            },
            xAxis: {
                type: "datetime",
                title: {
                    text: graphData.x_axis_label,
                },
            },
            yAxis: {
                title: {
                    text: graphData.y_axis_label,
                },
            },
            tooltip: {
                crosshairs: true,
                shared: true,
                valueSuffix: null,
            }, 
            // legend: {
            //     enabled: true,
            //     borderWidth: 1,
            //     padding: 20,
            //     title: {
            //         text: 'Legend<br/><span style="font-size: 9px; color: #666; font-weight: normal">(Click to hide)',
            //         style: {
            //             fontStyle: "italic",
            //         },
            //     },
            // },
            series: [
                {
                    name: "Confidence Interval",
                    id: "Confidence Interval",
                    data: graphData.intervals,
                    type: "arearange",
                    lineWidth: 0,
                    linkedTo: ":previous",
                    color: "#29A374",
                    fillOpacity: 0.2,
                    zIndex: 0,
                    marker: {
                        fillColor: "grey",
                        enabled: false,
                        symbol: "diamond",
                    },
                    states: {
                        inactive: {
                            opacity: 0
                        },
                        hover: {
                            enabled: false,
                        }
                    }
                },
                {
                    name: "Value",
                    id: "value",
                    zoneAxis: "x",
                    zones: zones,
                    data: graphData.values,
                    zIndex: 2,
                    color: "#25cc7b",
                    marker: {
                        fillColor: "white",
                        lineWidth: 1,
                        lineColor: "grey",
                        symbol: "circle",
                        enabled:false
                    },
                },
                {
                    name: "Predicted Value",
                    id: "predicted_value",
                    visible: false,
                    type: "line",
                    data: graphData.predicted_values,
                    zIndex: 1,
                    color: "#02964e",
                    dashStyle: "Dash",
                    opacity: 0.5,
                    marker: {
                        fillColor: "gray",
                        lineWidth: 1,
                        radius: 2,
                        lineColor: "white",
                        enabled: false,
                        symbol: "circle",
                    },
                },
            ],
        }
        this.setState({
            chartData: demoChart
        })
    }

    componentDidUpdate(prevProps){
        if (this.props.drillDown !== prevProps.drillDown) {
            this.renderChart();
        }
    }

    componentDidMount() {
        this.renderChart();
    }

    render() {
        return (
            <>
                <HighchartsReact
                    highcharts={Highcharts}
                    options={this.state.chartData}
                />
            </>
        );
    }
}

export default Anomaly;
