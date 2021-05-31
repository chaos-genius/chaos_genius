
import React from "react";
import { Col, Row, Button, Card, Form, InputGroup } from '@themesberg/react-bootstrap';

import { RcaAnalysisTable } from '../components/Tables';

// Am4charts
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import * as am4plugins_sunburst from "@amcharts/amcharts4/plugins/sunburst";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
am4core.useTheme(am4themes_animated);


class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      kpi: "0",
      dimension: "multidimension",
      timeline: "mom",
      kpiData: [],
      chartData: [],
      yAxis: [],
      tableData: [],
      amChart: null
    };
    this.handleKpiChange = this.handleKpiChange.bind(this);
    this.handleTimelineChange = this.handleTimelineChange.bind(this);
  }

  componentDidMount() {
    this.fetchKPIData();
  }

  fetchKPIData() {
    fetch('/api/kpi/')
      .then(response => response.json())
      .then(data => {
        this.setState({
          kpiData: data.data
        })
      });
  }

  plotChart() {
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

  handleKpiChange(e) {
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
      "kpi": componentValue
    }, () => {
      this.fetchAnalysisData();
    })
  }

  handleTimelineChange(e) {
    const targetComponent = e.target;
    this.setState({
      "timeline": targetComponent.value
    }, () => {
      this.fetchAnalysisData();
    })
  }

  fetchAnalysisData() {
    fetch(`/api/kpi/${this.state.kpi}/rca-analysis?timeline=${this.state.timeline}&dimensions=${this.state.dimension}`)
      .then(response => response.json())
      .then(respData => {
        const data = respData.data;
        this.setState({
          chartData: data.chart.chart_data,
          yAxis: data.chart.y_axis_lim,
          tableData: data.data_table
        }, () => {
          this.plotChart();
        })
      });
  }

  render() {

    const kpiOption = this.state.kpiData.map((kpi) => {
      return (
        <option key={kpi.id} value={kpi.id}>{kpi.name}</option>
      )
    })

    return (
      <>
        <h2>RCA Analysis</h2>
        <br/>
        <Row>
          <Col xs={12} xl={12}>
            <Card border="light" className="bg-white shadow-sm mb-4">
              <Card.Body>
                <h5 className="mb-4">Provide Analysis Information</h5>
                <Form>
                  <Row>
                    <Col sm={4} className="mb-3">
                      <Form.Group className="mb-2">
                        <Form.Label>Select KPI</Form.Label>
                        <Form.Select id="kpiId" onChange={this.handleKpiChange}>
                          <option key='0' value='0'>KPI</option>
                          {kpiOption}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col sm={4} className="mb-3">
                      <Form.Group className="mb-2">
                        <Form.Label>Timeline</Form.Label>
                        <Form.Select id="analysisTimeline" defaultValue="mom" onChange={this.handleTimelineChange}>
                          <option value="mom">Current Month on Last Month</option>
                          <option value="wow">Current Week on Last Week</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col sm={4} className="mb-3">
                      <Form.Group className="mb-2">
                        <Form.Label>Dimension</Form.Label>
                        <Form.Select id="analysisTimeline" defaultValue="multidimension">
                          <option value="multidimension">Multi Dimension</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    {/* <Col sm={3} className="mb-3">
                      <Button variant="primary" type="submit">Apply</Button>
                    </Col> */}
                  </Row>
                </Form>
              </Card.Body>
            </Card>

          </Col>
        </Row>

        <Row style={{display: this.state.amChart ? 'block' : 'none' }}>
          <Col xs={12} xl={12}>
            <Card border="light" className="shadow-sm mb-4">
              <Card.Body className="pb-0">
                <div id="chartdivWaterfall" style={{ width: "100%", height: "500px" }}></div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row style={{display: this.state.amChart ? 'block' : 'none' }}>
          <Col xs={12} xl={12}>
            <RcaAnalysisTable data={this.state.tableData.slice(0, 50)}/>
          </Col>
        </Row>

      </>
    );
  }
}

export default Home;