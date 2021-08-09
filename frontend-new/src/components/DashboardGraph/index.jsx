import React, { useEffect, useState } from 'react';

import Select from 'react-select';

import { useDispatch, useSelector } from 'react-redux';

import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';

import Setting from '../../assets/images/setting.svg';
import Toparrow from '../../assets/images/toparrow.svg';

// import { analysisData, y_axis_lim } from './constant';

import DashboardTable from '../DashboardTable';
import Dashboardgraphcard from '../DashboardGraphCard';

import './dashboardgraph.scss';

import {
  getDashboardLinechart,
  getAllDashboardDimension,
  getDashboardRcaAnalysis
} from '../../redux/actions';

import { v4 as uuidv4 } from 'uuid';

const data = [
  {
    value: 'mom',
    label: 'Current Month on Last Month'
  },
  {
    value: 'wow',
    label: 'Current Week on Last Week'
  }
];

const multidimensional = [
  {
    value: 'multidimension',
    label: 'Multidimension'
  },
  {
    value: 'singledimension',
    label: 'Singledimension'
  }
];

const Dashboardgraph = ({ kpi }) => {
  const dispatch = useDispatch();
  const [active, setActive] = useState('');
  const { linechartData, rcaAnalysisData } = useSelector(
    (state) => state.dashboard
  );
  const { dimensionData, dimensionLoading } = useSelector(
    (state) => state.dimension
  );
  const [monthWeek, setMonthWeek] = useState({
    value: 'mom',
    label: 'Current Month on Last Month'
  });

  const [tableData, SetTableData] = useState('mom');
  const [collapse, setCollapse] = useState(true);
  const [overlap, setOverlap] = useState('');
  const [dimension, setDimension] = useState('multidimension');

  useEffect(() => {
    getAllLinechart();
    dispatchGetAllDashboardDimension();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kpi, monthWeek.value]);

  const getAllLinechart = () => {
    dispatch(getDashboardLinechart(kpi, { timeline: monthWeek.value }));
  };

  const dispatchGetAllDashboardDimension = () => {
    dispatch(getAllDashboardDimension(kpi));
  };

  const getAllRCA = () => {
    if (dimension === 'multidimension') {
      dispatch(getDashboardRcaAnalysis(kpi, { timeline: monthWeek.value }));
    } else {
      dispatch(
        getDashboardRcaAnalysis(kpi, {
          timeline: monthWeek.value,
          dimension: active
        })
      );
    }
  };

  useEffect(() => {
    if (linechartData) {
      plotLineChart();
    }
    if (rcaAnalysisData) {
      plotChart();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linechartData, rcaAnalysisData, dimensionData]);

  const plotLineChart = () => {
    // https://www.amcharts.com/demos/comparing-different-date-values-google-analytics-style/?theme=frozen#code

    am4core.options.autoDispose = true;

    let chart = am4core.create('lineChartDiv', am4charts.XYChart);

    chart.legend = new am4charts.Legend();
    chart.legend.position = 'bottom';

    chart.data = linechartData; //this.state.lineChartData;

    chart.fontSize = 12;
    chart.fontFamily = 'Inter';

    // Create axes
    let dateAxis = chart.xAxes.push(new am4charts.ValueAxis());
    dateAxis.renderer.minGridDistance = 50;
    dateAxis.renderer.grid.template.disabled = true;

    let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.renderer.grid.template.disabled = true;

    // Create series
    let series = chart.series.push(new am4charts.LineSeries());
    series.legendSettings.labelText = 'Current Values';
    series.dataFields.valueY = 'value';
    series.dataFields.valueX = 'index';
    series.stroke = am4core.color('#05A677');
    series.strokeWidth = 2.5;
    series.minBulletDistance = 10;
    series.tooltipText =
      '[bold]{date.formatDate()}:[/] {value}\n[bold]{previousDate.formatDate()}:[/] {previousValue}';
    series.tooltip.pointerOrientation = 'vertical';
    series.tooltip.getFillFromObject = false;
    series.tooltip.background.fill = am4core.color('#778CA3');
    series.tooltip.label.fontSize = 12;
    series.tooltip.label.fontFamily = 'Inter';
    series.tooltip.label.fill = '#fff';

    // Create series
    let series2 = chart.series.push(new am4charts.LineSeries());
    series2.legendSettings.labelText = 'Previous Values';
    series2.dataFields.valueY = 'previousValue';
    series2.dataFields.valueX = 'index';
    series2.stroke = am4core.color('#778CA3');
    series2.strokeWidth = 2.5;
    series2.strokeDasharray = '6, 4';

    // Add cursor
    chart.cursor = new am4charts.XYCursor();

    // Required to make tooltips function in an XY chart with both axes as ValueAxis
    // Taken from https://www.amcharts.com/docs/v4/tutorials/multiple-cursor-tooltips-on-scatter-chart/
    am4charts.ValueAxis.prototype.getSeriesDataItem = function (
      series,
      position
    ) {
      var key = this.axisFieldName + this.axisLetter;
      var value = this.positionToValue(position);
      const dataItem = series.dataItems.getIndex(
        series.dataItems.findClosestIndex(
          value,
          function (x) {
            return x[key] ? x[key] : undefined;
          },
          'any'
        )
      );
      return dataItem;
    };
  };

  const plotChart = () => {
    am4core.options.autoDispose = true;

    // if (this.state.amChart) {
    //   this.state.amChart.data = this.state.chartData;
    //   let valueAxis = this.state.amChart.yAxes.getIndex(0);
    //   valueAxis.min = this.state.yAxis[0];
    //   valueAxis.max = this.state.yAxis[1];
    // } else {
    let chart = am4core.create('chartdivWaterfall', am4charts.XYChart);
    chart.fontSize = 12;
    chart.fontFamily = 'Inter';

    chart.hiddenState.properties.opacity = 0; // this makes initial fade in effect

    // using math in the data instead of final values just to illustrate the idea of Waterfall chart
    // a separate data field for step series is added because we don't need last step (notice, the last data item doesn't have stepValue)
    chart.data = rcaAnalysisData.chart.chart_data; ///this.state.chartData;

    let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = 'category';
    categoryAxis.renderer.minGridDistance = 40;
    categoryAxis.renderer.grid.template.disabled = true;

    // Configure axis label
    var xlabel = categoryAxis.renderer.labels.template;
    xlabel.wrap = true;
    xlabel.maxWidth = 120;

    // Automatically figure out correct max width for labels
    categoryAxis.events.on('sizechanged', function (ev) {
      let axis = ev.target;
      let cellWidth = axis.pixelWidth / (axis.endIndex - axis.startIndex);
      axis.renderer.labels.template.maxWidth = cellWidth;
    });

    let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.renderer.minGridDistance = 50;
    valueAxis.renderer.grid.template.opacity = 0.6;

    if (rcaAnalysisData?.chart?.y_axis_lim.length > 0) {
      valueAxis.min = rcaAnalysisData?.chart?.y_axis_lim[0];
      valueAxis.max = rcaAnalysisData?.chart?.y_axis_lim[1];
    }

    let columnSeries = chart.series.push(new am4charts.ColumnSeries());
    columnSeries.dataFields.categoryX = 'category';
    columnSeries.dataFields.valueY = 'value';
    columnSeries.dataFields.openValueY = 'open';
    columnSeries.fillOpacity = 0.8;
    columnSeries.sequencedInterpolation = true;
    columnSeries.interpolationDuration = 1500;

    let columnTemplate = columnSeries.columns.template;
    columnTemplate.strokeOpacity = 0;
    columnTemplate.propertyFields.fill = 'color';

    let label = columnTemplate.createChild(am4core.Label);
    label.text = "{displayValue.formatNumber('###,###.##')}";
    label.align = 'center';
    label.valign = 'middle';
    label.wrap = true;
    label.maxWidth = 120;
    label.fontWeight = 600;

    let stepSeries = chart.series.push(new am4charts.StepLineSeries());
    stepSeries.dataFields.categoryX = 'category';
    stepSeries.dataFields.valueY = 'stepValue';
    stepSeries.noRisers = true;
    stepSeries.stroke = new am4core.InterfaceColorSet().getFor(
      'alternativeBackground'
    );
    stepSeries.strokeDasharray = '3,3';
    stepSeries.interpolationDuration = 2000;
    stepSeries.sequencedInterpolation = true;

    // because column width is 80%, we modify start/end locations so that step would start with column and end with next column
    stepSeries.startLocation = 0.1;
    stepSeries.endLocation = 1.1;

    chart.cursor = new am4charts.XYCursor();
    chart.tooltip.label.fontSize = 12;
    chart.tooltip.label.fontFamily = 'Inter';
    chart.cursor.behavior = 'none';
    // this.setState({
    //   amChart: chart
    // });

    // }
  };

  useEffect(() => {
    getAllRCA();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const handleDimensionChange = (data) => {
    if (data.value === 'singledimension') {
      dispatchGetAllDashboardDimension();
    }
  };

  return (
    <div>
      <div className="dashboard-layout">
        {/* Dashboard tap */}
        <div className="dashboard-subheader">
          <div className="common-tab">
            <ul>
              <li className="active">AutoRCA</li>
            </ul>
          </div>
          <div className="common-option">
            <button className="btn grey-button">
              <img src={Setting} alt="Setting" />
              <span>Settings</span>
            </button>
          </div>
        </div>
        <div className="dashboard-container">
          <div className="dashboard-subcategory">
            <Select
              value={monthWeek}
              options={data}
              classNamePrefix="selectcategory"
              placeholder="select"
              isSearchable={false}
              onChange={(e) => {
                setMonthWeek(e);
                SetTableData(e.value);
              }}
            />
          </div>
          {/* Graph Section */}
          <div className="dashboard-graph-section">
            <div className="common-graph">
              {/* {aggregationData && (
                <Dashboardgraphcard aggregation={aggregationData} />
              )} */}
              <Dashboardgraphcard kpi={kpi} data={tableData} />
            </div>
            <div className="common-graph" id="lineChartDiv"></div>
          </div>
        </div>
      </div>
      <div className="dashboard-layout">
        <div
          className={
            !collapse
              ? 'dashboard-header-wrapper header-wrapper-disable'
              : 'dashboard-header-wrapper'
          }>
          <div className="dashboard-header">
            <h3>Drill Downs</h3>
          </div>
          <div
            className={
              !collapse ? 'header-collapse header-disable' : 'header-collapse'
            }
            onClick={() => setCollapse(!collapse)}>
            <img src={Toparrow} alt="CollapseOpen" />
          </div>
        </div>
        {collapse ? (
          <div className="dashboard-container">
            <div className="dashboard-subheader">
              <div
                className={
                  dimension !== 'multidimension'
                    ? ' common-tab'
                    : 'common-tab common-tab-hide'
                }>
                <ul>
                  {dimensionLoading ? (
                    <div className="loader">
                      <div className="loading-text">
                        <p>loading</p>
                        <span></span>
                      </div>
                    </div>
                  ) : (
                    dimensionData &&
                    dimensionData.dimensions.map((data) => {
                      return (
                        <li
                          key={uuidv4()}
                          className={active === data ? 'active' : ''}
                          onClick={() => setActive(data)}>
                          {data}
                        </li>
                      );
                    })
                  )}
                </ul>
              </div>
              <div className="common-option">
                <Select
                  options={multidimensional}
                  classNamePrefix="selectcategory"
                  placeholder="Multidimensional"
                  isSearchable={false}
                  onChange={(e) => {
                    handleDimensionChange(e);
                    setDimension(e.value);
                  }}
                />
              </div>
            </div>
            {/*Drill down chart*/}
            <div
              className="common-drilldown-graph"
              id="chartdivWaterfall"></div>

            {dimension === 'multidimension' && (
              <div className="common-subsection">
                <div className="subsection-heading">
                  <h3>Top Drivers</h3>
                </div>

                <div className="form-check form-switch overlap-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="removeoverlap"
                    onChange={(e) => setOverlap(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="removeoverlap">
                    Remove Overlap
                  </label>
                </div>
              </div>
            )}
            <div className="common-drilldown-table table-section">
              <DashboardTable
                data={tableData}
                kpi={kpi}
                overlap={overlap}
                dimension={dimension}
                activeDimension={active}
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Dashboardgraph;
