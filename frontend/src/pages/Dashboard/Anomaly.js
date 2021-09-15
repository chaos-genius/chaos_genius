import React, { Component } from "react";

import { BASE_URL, DEFAULT_HEADERS } from '../../config/Constants'
import {
    Accordion, AccordionSummary, AccordionDetails,
    Typography, Grid, FormControl, Select, Card, CardContent
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import DrillDown from './DrillDown';
import moment from 'moment';
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import highchartsMore from 'highcharts/highcharts-more'; highchartsMore(Highcharts);

class Anomaly extends Component {
    constructor(props) {
        super(props)
        this.state = {
            kpi: props.kpi,
            timeline: props.timeline,
            chartData: [],
            graphData: [],
            drillDown: [],
            dataQuality: [],
            base_anomaly_id: null
        }
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

        // Add last zone
        if (zones.length > 0) {
            let lastTimestamp = values[values.length - 1][0];
            zones.push({
                // Some timestamp far beyond the largest timestamp, so that the end of the graph is the right color
                value: lastTimestamp * 2,
                color: prev.color,
            });
        }
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
        let chartdata = [];
        const { graphData } = this.state;
        let zones = this.findAnomalyZones(graphData.intervals, graphData.values);

        let demoChart = {
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
                formatter: function () {
                    const intervals = graphData.intervals.find(row => row[0] == this.x);
                    const severity_score = graphData.severity.find(row => row[0] == this.x);

                    let s = 'Confidence Interval: <b>' + intervals[1] + " - " + intervals[2] + '</b>';
                    s = s + '<br>Value: <b>' + this.y + '</b>';
                    s = s + '<br>Severity: <b>' + severity_score[1] + '</b>';
                    return s
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
                            click: (event) => this.handleGraphClick(event),
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
                        fontStyle: "italic",
                    },
                },
            },
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
        });
    }

    fetchAnomoly = () => {
        fetch(`${BASE_URL}api/anomaly-data/${this.state.kpi}/anomaly-detection`)
            .then(response => response.json())
            .then(data => {
                if (data?.data) {
                    this.setState({
                        graphData: data.data.chart_data,
                        base_anomaly_id: data.data.base_anomaly_id
                    }, () => {
                        this.renderChart();
                        this.handleDataQuality();
                    })
                }
            });
    }

    handleDataQuality = () => {
        fetch(`${BASE_URL}api/anomaly-data/${this.state.kpi}/anomaly-data-quality?base_anomaly_id=${this.state.base_anomaly_id}`)
        .then(response => response.json())
        .then(data => {
            if (data?.data) {
                this.setState({
                    dataQuality: data.data
                })
            }
        });
    }

    handleGraphClick = (event) => {
        const unixDate = event.point.x
        fetch(`${BASE_URL}api/anomaly-data/${this.state.kpi}/anomaly-drilldown?date=${unixDate}&base_anomaly_id=${this.state.base_anomaly_id}`)
            .then(response => response.json())
            .then(data => {
                if (data?.data) {
                    this.setState({
                        drillDown: data.data
                    })
                }
            });
    }

    componentDidUpdate(preProps) {
        if(this.props.kpi !== preProps.kpi){
            this.fetchAnomoly()
        }
    }

    componentDidMount() {
        this.fetchAnomoly()
    }

    render() {
        const { drillDown, dataQuality } = this.state;

        let itemList = []
        drillDown.map((obj) => {
            itemList.push(<DrillDown key={`dl-${obj.title}`} drillDown={obj} />)
        })

        const dataQualityList = [];
        dataQuality.map((dqMap) => {
            dataQualityList.push(<DrillDown key={`dq-${dqMap.title}`} drillDown={dqMap} />)
        })

        return (
            <>
                <Card className="chart-tab-card">
                    <CardContent>
                        <Grid container spacing={2} justify="flex-end" className="custom-dash-select">
                            <Grid item xs={12} md={2}>
                                <FormControl variant="outlined" style={{ width: '100%' }}>
                                    {/*onChange={(e) => this.handleTimelineChange(e)}*/}
                                    <Select native defaultValue={this.props.timeline} id="analysisTimeline" >
                                        <option value="dataquality">Data quality</option>
                                        <option value="multidimensional">Multidimensional</option>
                                    </Select>
                                </FormControl>
                            </Grid>
                            {/* <Grid item xs={12} md={3}>
                                <FormControl variant="outlined" style={{ width: '100%' }}>
                                    <Select native defaultValue={this.props.timeline} id="analysisTimeline" >
                                        <option value="mom">Display Window</option>
                                    </Select>
                                </FormControl>
                            </Grid> */}
                        </Grid>
                        <HighchartsReact
                            highcharts={Highcharts}
                            options={this.state.chartData}
                        />
                    </CardContent>
                </Card>
                <Accordion className="custom-dash-accordian" defaultExpanded={false}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                    >
                        <Typography component="h4" className="title">Drill Downs</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        {itemList}
                    </AccordionDetails>
                </Accordion>
                <Accordion className="custom-dash-accordian" defaultExpanded={false}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                    >
                        <Typography component="h4" className="title">Data Quality</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        {dataQualityList}
                    </AccordionDetails>
                </Accordion>

            </>
        );
    }
}

export default Anomaly;
