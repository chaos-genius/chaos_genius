
import React from "react";
import {
  Grid, Card, CardContent, CardActions,
  Button, Typography, InputLabel, MenuItem,
  FormControl, Select, CircularProgress
} from '@material-ui/core';

import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';


import CustomModal from './../components/CustomModal'
import CustomTabs from './../components/CustomTabs'

import { tab1Fields} from './Charts/Housing'
import { RcaAnalysisTable } from '../components/DashboardTable';

import './../assets/css/custom.css'


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
      showDefault: false,
      kpi: "0",
      kpiName:"KPI",
      dimension: "multidimension",
      dimensionData: [],
      timeline: "mom",
      kpiData: [],
      chartData: [],
      dataColumns: ["Subgroup Name", "Previous Avg", "Previous Subgroup Size", "Previous Subgroup Count", "Current Avg", "Current Subgroup Size", "Current Subgroup Count", "Impact"],
      yAxis: [],
      tableData: [],
      amChart: null,
      cardData:[],
      loading: false
    }
  }


  addActionButton = () => {
    return (
      <span className="m-1 btn btn-tertiary" >New DataSource</span>
    )
  }
  editActionButton = () => {
    return (
      <Button variant="warning" className="m-1" onClick={() => this.setState({ showDefault: true })}>Manage DataSources</Button>
    )
  }
  handleClose = () => {
    this.setState({
      showDefault: false
    })
  }

  fetchKPIData = () => {
    this.setState({ loading: true })
    fetch('/api/kpi/')
      .then(response => response.json())
      .then(data => {
        this.setState({
          kpiData: data.data,
          loading: false
        })
      });
  }
  fetchDimensionData = () => {
    this.setState({ loading: true })
    fetch(`/api/kpi/${this.state.kpi}/get-dimensions`)
      .then(response => response.json())
      .then(data => {
        this.setState({
          dimension:'multidimension',
          dimensionData: data.dimensions,
          loading: false
        }, () => {
          this.fetchAnalysisData();
        })
      });
  }
  handleKpiChange = (e) => {
    const targetComponent = e.target;

    const componentValue = targetComponent.value;

    if (componentValue === "0") {
      this.setState({
        chartData: [],
        yAxis: [],
        tableData: [],
        amChart: null
      })
      return;
    }
    this.setState({
      kpi: componentValue,
      kpiName: targetComponent.options[componentValue].innerText
    }, () => {
      this.fetchDimensionData();
    })
  }
  handleTimelineChange = (e) => {
    const targetComponent = e.target;
    this.setState({
      timeline: targetComponent.value
    }, () => {
      this.fetchAnalysisData();
    })
  }
  handleDimensionChange = (e) => {
    const targetComponent = e.target;
    this.setState({
      dimension: targetComponent.value
    }, () => {
      this.fetchAnalysisData();
    })
  }

  fetchAnalysisData = () => {
    const { kpi, timeline, dimension } = this.state;
    this.setState({ loading: true })


    fetch(`/api/kpi/${kpi}/kpi-aggregations?timeline=${timeline}`)
      .then(response => response.json())
      .then(respData => {
        const data = respData.data;
        if(data?.panel_metrics){
          this.setState({
            cardData: data.panel_metrics,
          })
        }
      });
    fetch(`/api/kpi/${kpi}/rca-analysis?timeline=${timeline}&dimensions=${dimension}`)
      .then(response => response.json())
      .then(respData => {
        const data = respData.data;
        if (data?.chart) {
          this.setState({
            chartData: data.chart.chart_data,
            yAxis: data.chart.y_axis_lim,
            tableData: data.data_table,
            loading: false
          }, () => {
            this.plotChart();
          })
        }
      });

  }

  plotChart = () => {
    if (this.state.amChart) {

      this.state.amChart.data = this.state.chartData;
      let valueAxis = this.state.amChart.yAxes.getIndex(0);
      valueAxis.min = this.state.yAxis[0];
      valueAxis.max = this.state.yAxis[1];
    } else {
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
      label.text = "{displayValue.formatNumber('#,## a')}";
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
        amChart: chart
      })
    }
  }

  componentDidMount() {
    this.fetchKPIData();
    this.fetchDimensionData();
  }

  
  tabHousingChart = () => {
    return (
      <Card className="mt-4 mb-4">
        <CardContent>
          <div id="chartdivWaterfall" style={{ width: "100%", height: "500px" }}></div>
        </CardContent>
      </Card>
    )
  }
  FilterData = () => {
    const { kpiData, dimensionData, dimension, timeline, kpi } = this.state;
    return (
      <Card className="mt-4 mb-4">
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={2}>
              <FormControl variant="outlined" style={{ width: '100%' }}>
                <InputLabel htmlFor="kpiId">Select KPI</InputLabel>
                <Select native defaultValue={kpi} id="kpiId" onChange={this.handleKpiChange}>
                  <option key='0' value='0'>KPI</option>
                  {kpiData.map((kpi) => {
                    return (
                      <option key={kpi.id} value={kpi.id}>{kpi.name}</option>
                    )
                  })}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl variant="outlined" style={{ width: '100%' }}>
                <InputLabel htmlFor="analysisTimeline">Timeline</InputLabel>
                <Select native defaultValue={timeline} id="analysisTimeline" onChange={this.handleTimelineChange}>
                  <option value="mom">Current Month on Last Month</option>
                  <option value="wow">Current Week on Last Week</option>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl variant="outlined" style={{ width: '100%' }}>
                <InputLabel htmlFor="dimension">Dimension</InputLabel>
                <Select native defaultValue={dimension} id="dimension" onChange={this.handleDimensionChange}>
                  <option value="multidimension">Multi Dimension</option>
                  {dimensionData.map((dimension) => {
                    return (
                      <option key={dimension} value={dimension}>{dimension}</option>
                    )
                  })}
                  {/* <option value="multidimension">Multi Dimension</option> */}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    )
  }
  keyPoints = () => {
    return (
      <Card className="mb-4">
        <CardContent>
          <ul>
            <li>Top negative contributors: </li>
            <li>Top positive contributors: </li>
            <li>Top Anomalies  </li>
          </ul>
        </CardContent>
      </Card>
    )
  }

  render() {
    // const tabCardData = [{
    //   title: "AutoRCA",
    //   body: this.tab1Fields()
    // }];
    // const tabChartData = [{
    //   title: "Housing",
    //   body: this.tabHousingChart()
    // }, {
    //   title: "Loan",
    //   body: this.keyPoints()
    // }];
    // , {
    //   title: "Education",
    //   body: this.tabHousingChart()
    // }, {
    //   title: "Martial",
    //   body: this.tabHousingChart()
    // }, {
    //   title: "Job",
    //   body: this.tabHousingChart()
    // }
    // if (this.state.loading) {
    //   return (
    //     <div className="loader">
    //       <CircularProgress color="secondary" />
    //     </div>
    //   )
    // } 
    return (
      <>
        <this.FilterData />
        {/* <Card className="mb-4">
          <CardContent>
            <CustomTabs tabs={tabCardData} />
          </CardContent>
        </Card> */}
        {(this.state.cardData)?(tab1Fields(this.state.chartData,this.state.kpiName)):("")}
        {this.keyPoints()}

        {/* <CustomTabs tabs={tabChartData} /> */}
        {this.tabHousingChart(this.state.cardData,this.state.kpi)}
        {/* <Housing tableData={this.state.tableData.slice(0, 50)} /> */}
        <div style={{ display: this.state.tableData.length ? 'block' : 'none' }}>
          <RcaAnalysisTable data={this.state.tableData.slice(0, 50)} columns={this.state.dataColumns} />
        </div>
      </>
    )
  }


}
export default Dashboard;
