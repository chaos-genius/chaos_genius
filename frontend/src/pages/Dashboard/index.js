
import React from "react";
import {
  Grid, Card, CardContent, CardActions,
  Button, Typography, InputLabel, Switch,
  FormControl, Select, CircularProgress, Accordion, AccordionSummary, AccordionDetails
} from '@material-ui/core';

import CustomTabs from '../../components/CustomTabs'

import { tab1Fields } from './HelperFunctions'
import SideBar from './SideBar'
import MultidimensionTable from './MultidimensionTable'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import RcaAnalysisTable from '../../components/DashboardTable';
import { BASE_URL, DEFAULT_HEADERS } from '../../config/Constants'
import { withStyles, Theme, createStyles } from '@material-ui/core/styles';


// Am4charts
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import * as am4plugins_sunburst from "@amcharts/amcharts4/plugins/sunburst";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import { ThreeSixty } from "@material-ui/icons";
am4core.useTheme(am4themes_animated);




const AntSwitch = withStyles((theme) =>
    createStyles({
        root: {
            width: 40,
            height: 20,
            padding: 0,
            display: 'flex',
        },
        switchBase: {
            padding: 2,
            color: theme.palette.common.white,
            '&$checked': {
                transform: 'translateX(20px)',
                color: theme.palette.common.white,
                '& + $track': {
                    opacity: 1,
                    backgroundColor: "#00b464",
                },
            },
        },
        thumb: {
            width: 15,
            height: 15,
            boxShadow: 'none',
        },
        track: {
            borderRadius: '25px',
            opacity: 1,
            backgroundColor: "#00b464",
        },
        checked: {},
    }),
)(Switch);
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
      multiDimensionTableData: [],
      overlap: false,
      overlapTableData:[],
      dataCol:[]

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
              dataCol: data.data_columns,              
              overlapTableData: data.data_table,
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

    chart.hiddenState.properties.opacity = 0; // this makes initial fade in effect

    // using math in the data instead of final values just to illustrate the idea of Waterfall chart
    // a separate data field for step series is added because we don't need last step (notice, the last data item doesn't have stepValue)
    chart.data = this.state.chartData;

    let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "category";
    categoryAxis.renderer.minGridDistance = 40;

    // Configure axis label
    var xlabel = categoryAxis.renderer.labels.template;
    xlabel.wrap = true;
    xlabel.maxWidth = 120;

    let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
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
      <div id="chartdivWaterfall" style={{ width: "100%", height: "500px", paddingTop: "60px" }}></div>
    )
  }
  handleChangeOverlap = (e) => {
    const isChecked = e.target.checked;
    console.log("isChecked",isChecked)
    this.setState({
      overlap: isChecked
    })
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
    const columns =[{ title: "Subgroup", field: 'string' },
    { title: "Full Impact", field: "impact_full_group" }, 
    { title: "Non Overlap Impact", field: 'impact_non_overlap' }, 
    { title: "Data points in group", field: 'indices_in_group' }, 
    { title: "Non overlapping data points", field: 'non_overlap_indices' }]

    let overLapTableCol = (this.state.overlap)?(this.state.dataCol):(columns);
    let tableData = (this.state.overlap)?(this.state.overlapTableData):(this.state.multiDimensionTableData);

console.log("overlap",this.state.overlap)
console.log("tableData",tableData)
console.log("dataCol",overLapTableCol)

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
                    <div id="lineChartDiv" style={{ width: "100%", height: "275px" }}></div>
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


                  {(Object.keys(this.state.tableData).length > 0) ? (
                    <RcaAnalysisTable data={this.state.tableData.slice(0, 50)} columns={this.state.dataColumns} />) : ("")}

                </div>
              ) : (Object.keys(this.state.multiDimensionTableData).length > 0) ? (
                <>
                  <Grid container>
                    <Grid item xs={8}>
                      <h5 className="mt-4">Top Drivers</h5>
                    </Grid>
                    <Grid item xs={4} className="text-right">
                      <Grid component="label" container alignItems="center" spacing={1}>
                        {/* <Grid item className={(this.props.dynamicData.pricing === true) ? ("label-switch ") : ("label-switch active")}>Monthly Plan</Grid> */}
                        <Grid item className="display-xs-block">
                          <AntSwitch checked={this.state.overlap} className={(this.state.overlap === true) ? ("label-switch active") : ("label-switch")} onChange={(e) => this.handleChangeOverlap(e)} />
                        </Grid>
                        <Grid item  >Remove Overlap</Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                  
                  {/* <MultidimensionTable multiDimensionTableData={this.state.multiDimensionTableData} columnData={this.state.dataCol} overlap={this.state.overlap} overlapData={this.state.overlapTableData} /> */}
                  <MultidimensionTable tableData={tableData} dataCol={overLapTableCol} />
       
                </>

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

    chart.data = this.state.lineChartData;

    // Create axes
    let dateAxis = chart.xAxes.push(new am4charts.DateAxis());
    dateAxis.renderer.minGridDistance = 50;

    let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());

    // Create series
    let series = chart.series.push(new am4charts.LineSeries());
    series.dataFields.valueY = "value";
    series.dataFields.dateX = "date";
    series.strokeWidth = 2;
    series.minBulletDistance = 10;
    series.tooltipText = "[bold]{date.formatDate()}:[/] {value}\n[bold]{previousDate.formatDate()}:[/] {previousValue}";
    series.tooltip.pointerOrientation = "vertical";

    // Create series
    let series2 = chart.series.push(new am4charts.LineSeries());
    series2.dataFields.valueY = "previousValue";
    series2.dataFields.dateX = "date";
    series2.strokeWidth = 2;
    series2.strokeDasharray = "3,4";
    series2.stroke = series.stroke;

    // Add cursor
    chart.cursor = new am4charts.XYCursor();
    chart.cursor.xAxis = dateAxis;

  }
  render() {
    const tabChartData = [{
      "title": "AutoRCA",
      "body": this.renderAutoRCA()
    }];

    return (
      <Grid container spacing={2}>
        <Grid item xs={3} className="custom-col-3">
          {(Object.keys(this.state.kpiData).length > 0) ? (
            <SideBar handleKpiChange={this.handleKpiChange} kpiData={this.state.kpiData} kpiID={this.state.kpi} />
          ) : ("")}
        </Grid>
        <Grid item xs={9} className="tab-with-borders custom-col-9">
          <CustomTabs tabs={tabChartData} />
        </Grid>
      </Grid>
    )
  }


}
export default Dashboard;
