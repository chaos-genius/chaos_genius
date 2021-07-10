
import React from "react";
import {
    Grid, Card, CardContent, CardActions,
    Button, Typography, InputLabel, MenuItem,
    FormControl, Select, CircularProgress, Accordion, AccordionSummary, AccordionDetails
} from '@material-ui/core';

import CustomTabs from '../../components/CustomTabs'

import { tab1Fields } from './HelperFunctions'
import SideBar from './SideBar'
import MultidimensionTable from './MultidimensionTable'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import RcaAnalysisTable from '../../components/DashboardTable';
import { BASE_URL, DEFAULT_HEADERS } from '../../config/Constants'


// Am4charts
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import * as am4plugins_sunburst from "@amcharts/amcharts4/plugins/sunburst";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import { ThreeSixty } from "@material-ui/icons";
am4core.useTheme(am4themes_animated);
class Dashboard extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            kpi: 0,
            kpiName: "",
            cardData: [],
            cardDataLoader: false,
            dimension: '',
            dimensionType: 'multidimension',
            timeline: "mom",
            lineChartData: {},
            dimensionData: [],
            kpiData: [],
            chartData: [],
            dataColumns: [{ title: "Subgroup Name", field: "subgroup" }, { title: "Previous Avg", field: 'g1_agg' }, { title: "Previous Subgroup Size", field: 'g1_size' }, { title: "Previous Subgroup Count", field: 'g1_count' }, { title: "Current Avg", field: 'g2_agg' }, { title: "Current Subgroup Size", field: 'g2_size' }, { title: "Current Subgroup Count", field: 'g2_count' }, { title: "Impact", field: 'impact' }],
            yAxis: [],
            tableData: [],
            amChart: null,
            cardDataLoader: false,
            loading: false,
            tabState: 0,
            multiDimensionTableData: []

        }

    }
    fetchKPIData = () => {
        this.setState({ loading: true })
        fetch(`/api/kpi/`)
            .then(response => response.json())
            .then(data => {
                if (data?.data) {
                    if (data.data?.[0]['id']) {
                        this.setState({
                            kpi: data.data[0]['id'],
                            kpiName: data.data[0]['name'],
                            kpiData: data.data,
                            loading: false
                        }, () => {
                            this.fetchKpiAggegation();
                            this.fetchDimensionData();
                        })
                    }
                }
            });
    }
    fetchKpiAggegation = () => {
        const { kpi, timeline } = this.state;
        if (kpi !== 0) {
            this.setState({
                cardDataLoader: true
            })
            fetch(`${BASE_URL}/api/kpi/${kpi}/kpi-aggregations?timeline=${timeline}`)
                .then(response => response.json())
                .then(respData => {
                    const data = respData.data;
                    if (data?.panel_metrics) {
                        this.setState({
                            cardData: data.panel_metrics,
                        })
                    }
                    this.setState({
                        cardDataLoader: false
                    })
                });
            this.setState({
                cardDataLoader: true
            })
            fetch(`${BASE_URL}/api/kpi/${kpi}/kpi-line-data?timeline=${timeline}`)
                .then(response => response.json())
                .then(respData => {
                    const data = respData.data;
                    if (data) {
                        this.setState({
                            lineChartData: data,
                        }, () => {
                            this.plotLineChart();
                        })
                    }
                    this.setState({
                        cardDataLoader: false
                    })
                });


        }
    }
    handleKpiChange = (e) => {
        const targetComponent = e.target;
        const componentValue = targetComponent.id;

        this.setState({
            kpi: componentValue,
            kpiName: targetComponent.innerText,
            tabState: 0
        }, () => {
            this.fetchKpiAggegation();
            this.plotLineChart();
            this.fetchDimensionData();
        })
    }
    handleTimelineChange = (e) => {
        const targetComponent = e.target;
        this.setState({
            timeline: targetComponent.value,
        }, () => {
            this.setDataColumns();
            this.fetchKpiAggegation();
            this.fetchAnalysisData();
        })
    }
    handleDimensionType = (e) => {
        const targetComponent = e.target;
        this.setState({
            dimensionType: targetComponent.value
        }, () => {
            this.fetchDimensionData();
        })
    }
    fetchDimensionData = () => {
        this.setState({ loading: true })
        fetch(`${BASE_URL}/api/kpi/${this.state.kpi}/get-dimensions`)
            .then(response => response.json())
            .then(data => {
                const dimensionArray = data.dimensions;
                // dimensionArray.unshift("multidimension")
                this.setState({
                    dimension: dimensionArray[0],
                    dimensionData: dimensionArray,
                    loading: false
                }, () => {
                    this.fetchAnalysisData();
                })
            });
    }
    handleDimensionChange = (e, type, newValue) => {
        const targetComponent = e.target;
        let targetValue = this.state.dimension;
        if (type === "options") {
            targetValue = targetComponent.value
        } else {
            targetValue = targetComponent.id
            if (newValue || newValue === 0) {
                this.setState({
                    tabState: newValue
                })
            }
        }

        this.setState({
            dimension: targetValue,
            tableData: []
        }, () => {
            this.fetchAnalysisData();
        })
    }
    fetchAnalysisData = () => {
        const { kpi, timeline, dimension, tabState, dimensionType } = this.state;
        let dimensionStr = ""
        if (dimensionType !== "multidimension") {
            dimensionStr = `&dimension=${dimension}`
        }
        if (kpi !== 0) {
            this.setState({ loading: true })
            fetch(`${BASE_URL}/api/kpi/${kpi}/rca-hierarchical-data?timeline=${timeline}${dimensionStr}`)
                .then(response => response.json())
                .then(respData => {
                    const data = respData.data;
                    if (data?.data_table) {
                        this.setState({
                            tableData: data.data_table,
                            loading: false
                        })
                    }
                });


            this.setState({ loading: true })
            fetch(`${BASE_URL}/api/kpi/${kpi}/rca-analysis?timeline=${timeline}${dimensionStr}`)
                .then(response => response.json())
                .then(respData => {
                    const data = respData.data;
                    if (data?.chart) {
                        this.setState({
                            chartData: data.chart.chart_data,
                            yAxis: data.chart.y_axis_lim,
                            multiDimensionTableData: data.chart.chart_table,
                            loading: false
                        }, () => {
                            this.plotChart();
                        })
                    }
                });

        }
    }

    plotChart = () => {
        am4core.options.autoDispose = true;

        // if (this.state.amChart) {
        //   this.state.amChart.data = this.state.chartData;
        //   let valueAxis = this.state.amChart.yAxes.getIndex(0);
        //   valueAxis.min = this.state.yAxis[0];
        //   valueAxis.max = this.state.yAxis[1];
        // } else {
        let chart = am4core.create("chartdivWaterfall", am4charts.XYChart);
        chart.fontSize = 12;
        chart.fontFamily = "Inter";

        chart.hiddenState.properties.opacity = 0; // this makes initial fade in effect

        // using math in the data instead of final values just to illustrate the idea of Waterfall chart
        // a separate data field for step series is added because we don't need last step (notice, the last data item doesn't have stepValue)
        chart.data = this.state.chartData;

        let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
        categoryAxis.dataFields.category = "category";
        categoryAxis.renderer.minGridDistance = 40;
        categoryAxis.renderer.grid.template.disabled = true;

        // Configure axis label
        var xlabel = categoryAxis.renderer.labels.template;
        xlabel.wrap = true;
        xlabel.maxWidth = 120;

        // Automatically figure out correct max width for labels
        categoryAxis.events.on("sizechanged", function(ev) {
            let axis = ev.target;
            let cellWidth = axis.pixelWidth / (axis.endIndex - axis.startIndex);
            axis.renderer.labels.template.maxWidth = cellWidth;
        });

        let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        valueAxis.renderer.minGridDistance = 50;
        valueAxis.renderer.grid.template.opacity = 0.6;
        if (this.state.yAxis.length > 0) {
            valueAxis.min = this.state.yAxis[0];
            valueAxis.max = this.state.yAxis[1];
        }

        let columnSeries = chart.series.push(new am4charts.ColumnSeries());
        columnSeries.dataFields.categoryX = "category";
        columnSeries.dataFields.valueY = "value";
        columnSeries.dataFields.openValueY = "open";
        columnSeries.fillOpacity = 0.8;
        columnSeries.sequencedInterpolation = true;
        columnSeries.interpolationDuration = 1500;

        let columnTemplate = columnSeries.columns.template;
        columnTemplate.strokeOpacity = 0;
        columnTemplate.propertyFields.fill = "color";

        let label = columnTemplate.createChild(am4core.Label);
        label.text = "{displayValue.formatNumber('###,###.##')}";
        label.align = "center";
        label.valign = "middle";
        label.wrap = true;
        label.maxWidth = 120;
        label.fontWeight = 600;

        let stepSeries = chart.series.push(new am4charts.StepLineSeries());
        stepSeries.dataFields.categoryX = "category";
        stepSeries.dataFields.valueY = "stepValue";
        stepSeries.noRisers = true;
        stepSeries.stroke = new am4core.InterfaceColorSet().getFor("alternativeBackground");
        stepSeries.strokeDasharray = "3,3";
        stepSeries.interpolationDuration = 2000;
        stepSeries.sequencedInterpolation = true;

        // because column width is 80%, we modify start/end locations so that step would start with column and end with next column
        stepSeries.startLocation = 0.1;
        stepSeries.endLocation = 1.1;

        chart.cursor = new am4charts.XYCursor();
        chart.tooltip.label.fontSize = 12;
        chart.tooltip.label.fontFamily = "Inter";
        chart.cursor.behavior = "none";
        this.setState({
            amChart: chart,
        })

        // }
    }

    setDataColumns = () => {
        let timeMetric = '';
        if (this.state.timeline === 'mom') {
            timeMetric = 'month';
        } else if (this.state.timeline === 'wow') {
            timeMetric = 'week';
        }
        this.setState({
            dataColumns: [
                { title: `Subgroup Name`, field: "subgroup" },
                { title: `Prev ${timeMetric} Avg`, field: 'g1_agg' },
                { title: `Prev ${timeMetric} Size`, field: 'g1_size' },
                { title: `Prev ${timeMetric} Count`, field: 'g1_count' },
                { title: `Curr ${timeMetric} Avg`, field: 'g2_agg' },
                { title: `Curr ${timeMetric} Size`, field: 'g2_size' },
                { title: `Curr ${timeMetric} Count`, field: 'g2_count' },
                { title: `Impact`, field: 'impact' }
            ]
        });
    }
    componentDidMount() {
        this.fetchKPIData();
        this.setDataColumns();
    }
    tabHousingChart = () => {
        return (
            <div id="chartdivWaterfall" style={{ width: "100%", height: "500px" }}></div>
        )
    }
    renderAutoRCA = () => {
        const tabChartData = [];
        if (this.state.dimensionData) {
            this.state.dimensionData.map((key) => {
                const datatab = {};
                datatab['title'] = key;
                datatab['body'] = this.tabHousingChart();
                tabChartData.push(datatab)
            });
        }
        return (
            <>
                <Card className="chart-tab-card">
                    <CardContent>
                        <Grid container spacing={2} justify="flex-end" className="custom-dash-select">
                            <Grid item xs={12} md={4}>
                                <FormControl variant="outlined" style={{ width: '100%' }}>
                                    {/* <InputLabel htmlFor="analysisTimeline">Timeline</InputLabel> */}
                                    <Select native defaultValue={this.state.timeline} id="analysisTimeline" onChange={(e) => this.handleTimelineChange(e)}>
                                        <option value="mom">Current Month on Last Month</option>
                                        <option value="wow">Current Week on Last Week</option>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>

                        <Grid container spacing={2} >
                            <Grid item xs={12} md={6}>
                                {(this.state.cardData) ? (tab1Fields(this.state.cardData, this.state.kpiName, this.state.cardDataLoader)) : ("")}
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Card className="line-chart-card">
                                    <CardContent>
                                        <div id="lineChartDiv" style={{ width: "100%", height: "223px" }}></div>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>


                    </CardContent>
                </Card>
                <Accordion className="custom-dash-accordian" defaultExpanded={true}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                    >
                        <Typography component="h4" className="title">Drill Downs</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Grid container spacing={2} justify="flex-end" className="custom-dash-select">
                            <Grid item xs={12} md={4}>
                                <FormControl variant="outlined" style={{ width: '100%' }}>
                                    {/* <InputLabel htmlFor="analysisTimeline">Timeline</InputLabel> */}
                                    <Select native defaultValue={this.state.dimensionType} id="dimensionType" onChange={(e) => this.handleDimensionType(e)}>
                                        <option value="multidimension">MultiDimension</option>
                                        <option value="singledimension">Single Dimension</option>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                        {(this.state.loading) ? (
                            <div className="loader">
                                <CircularProgress color="secondary" />
                            </div>
                        ) : (this.state.dimensionType === "multidimension") ? (
                            this.tabHousingChart()
                        ) : (
                            <CustomTabs tabs={tabChartData} handleDimensionChange={this.handleDimensionChange} tabState={this.state.tabState} scrollable="auto" />
                        )}
                        <div className="mt-4">
                            {(this.state.dimensionType !== "multidimension") ? (
                                <div style={{ display: this.state.tableData.length ? 'block' : 'none' }}>

                                    <h5 className="mb-4">Top Subgroups Data</h5>
                                    <p>These are the top 50 subgroups sorted by their Impact.</p>
                                    {(Object.keys(this.state.tableData).length > 0) ? (
                                        <RcaAnalysisTable data={this.state.tableData.slice(0, 50)} columns={this.state.dataColumns} />) : ("")}

                                </div>
                            ) : (Object.keys(this.state.multiDimensionTableData).length > 0) ? (

                                <MultidimensionTable multiDimensionTableData={this.state.multiDimensionTableData} />


                            ) : ("")}
                        </div>


                    </AccordionDetails>
                </Accordion>

            </>
        )
    }
    plotLineChart = () => {

        // https://www.amcharts.com/demos/comparing-different-date-values-google-analytics-style/?theme=frozen#code

        am4core.options.autoDispose = true;

        let chart = am4core.create("lineChartDiv", am4charts.XYChart);

        chart.legend = new am4charts.Legend();
        chart.legend.position = "bottom";

        chart.data = this.state.lineChartData;

        chart.fontSize = 12;
        chart.fontFamily = "Inter";

        // Create axes
        let dateAxis = chart.xAxes.push(new am4charts.ValueAxis());
        dateAxis.renderer.minGridDistance = 50;
        dateAxis.renderer.grid.template.disabled = true;

        let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        valueAxis.renderer.grid.template.disabled = true;

        // Create series
        let series = chart.series.push(new am4charts.LineSeries());
        series.legendSettings.labelText = "Current Values"
        series.dataFields.valueY = "value";
        series.dataFields.valueX = "index";
        series.stroke = am4core.color("#05A677");
        series.strokeWidth = 2.5;
        series.minBulletDistance = 10;
        series.tooltipText = "[bold]{date.formatDate()}:[/] {value}\n[bold]{previousDate.formatDate()}:[/] {previousValue}";
        series.tooltip.pointerOrientation = "vertical";
        series.tooltip.getFillFromObject = false;
        series.tooltip.background.fill = am4core.color("#778CA3");
        series.tooltip.label.fontSize = 12;
        series.tooltip.label.fontFamily = "Inter";
        series.tooltip.label.fill = "#fff";

        // Create series
        let series2 = chart.series.push(new am4charts.LineSeries());
        series2.legendSettings.labelText = "Previous Values"
        series2.dataFields.valueY = "previousValue";
        series2.dataFields.valueX = "index";
        series2.stroke = am4core.color("#778CA3");
        series2.strokeWidth = 2.5;
        series2.strokeDasharray = "6, 4";

        // Add cursor
        chart.cursor = new am4charts.XYCursor();
        
        // Required to make tooltips function in an XY chart with both axes as ValueAxis
        // Taken from https://www.amcharts.com/docs/v4/tutorials/multiple-cursor-tooltips-on-scatter-chart/
        am4charts.ValueAxis.prototype.getSeriesDataItem = function(series, position) {
            var key = this.axisFieldName + this.axisLetter;
            var value = this.positionToValue(position);
            const dataItem = series.dataItems.getIndex(series.dataItems.findClosestIndex(value, function(x) {
                return x[key] ? x[key] : undefined;
            }, "any"));
            return dataItem;
        }

    }
    render() {
        const tabChartData = [{
            "title": "AutoRCA",
            "body": this.renderAutoRCA()
        }];

        return (
            <Grid container spacing={3}>
                {(Object.keys(this.state.kpiData).length > 0) ? (
                    <Grid item xs={3}>
                        <SideBar handleKpiChange={this.handleKpiChange} kpiData={this.state.kpiData} kpiID={this.state.kpi} />
                    </Grid>
                ) : ("")}

                <Grid item xs={9} className="tab-with-borders">
                    <CustomTabs tabs={tabChartData} />
                </Grid>
            </Grid>
        )
    }


}
export default Dashboard;
