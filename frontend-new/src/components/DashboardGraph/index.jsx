import React, { useEffect, useState } from 'react';

import { useSelector, useDispatch } from 'react-redux';

import Select from 'react-select';

import DashboardTable from '../DashboardTable';
import Dashboardgraphcard from '../DashboardGraphCard';
import SingleDimensionTable from './SingleDimensionTable';

import './dashboardgraph.scss';
import '../../assets/styles/table.scss';

import Setting from '../../assets/images/setting.svg';
import Toparrow from '../../assets/images/toparrow.svg';

import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';

import {
  getDashboardAggregation,
  getDashboardLinechart,
  getAllDashboardDimension,
  getDashboardRcaAnalysis,
  getAllDashboardHierarchical
} from '../../redux/actions';

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

  const [activeDimension, setActiveDimension] = useState('');
  const [collapse, setCollapse] = useState(true);

  const [monthWeek, setMonthWeek] = useState({
    value: 'mom',
    label: 'Current Month on Last Month'
  });
  const [dimension, setDimension] = useState({
    value: 'multidimension',
    label: 'Multidimension'
  });

  const { aggregationData } = useSelector((state) => state.aggregation);

  const { linechartData } = useSelector((state) => state.lineChart);

  const { hierarchicalLoading, hierarchicalData } = useSelector(
    (state) => state.hierarchial
  );

  const { rcaAnalysisData } = useSelector((state) => state.dashboard);

  const { dimensionData, dimensionLoading } = useSelector(
    (state) => state.dimension
  );

  const getAllAggregationData = () => {
    dispatch(getDashboardAggregation(kpi, { timeline: monthWeek.value }));
  };

  const getAllLinechart = () => {
    dispatch(getDashboardLinechart(kpi, { timeline: monthWeek.value }));
  };

  useEffect(() => {
    if (kpi !== undefined) {
      getAllAggregationData();
      getAllLinechart();
      getAllRCA();
      if (dimension.value === 'singledimension') {
        getAllDashboardDimension();
      }
    }
    if (dimensionData && dimensionData?.dimensions && activeDimension === '') {
      setActiveDimension(dimensionData.dimensions[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kpi, dimension, activeDimension, monthWeek.value, dimensionData]);

  function getAllRCA() {
    if (dimension.value === 'singledimension') {
      dispatch(
        getDashboardRcaAnalysis(kpi, {
          timeline: monthWeek.value,
          dimension: activeDimension
        })
      );
      dispatch(
        getAllDashboardHierarchical(kpi, {
          timeline: monthWeek.value,
          dimension: activeDimension
        })
      );
    } else {
      dispatch(
        getDashboardRcaAnalysis(kpi, {
          timeline: monthWeek.value
        })
      );
    }
  }

  const plotLineChart = () => {
    am4core.options.autoDispose = true;

    let chart = am4core.create('lineChartDiv', am4charts.XYChart);

    // chart.legend = new am4charts.Legend();
    // chart.legend.position = "bottom";

    chart.data = linechartData;

    chart.fontSize = 12;
    chart.fontFamily = 'Inter ,sans-serif';

    // let title = chart.titles.create();
    // title.text = this.props.kpidetails.name;
    // title.fontSize = 16;
    // title.fontfamily = 'Inter';
    // title.marginBottom = 10;
    // title.align = 'center';

    // Create axes
    let dateAxis = chart.xAxes.push(new am4charts.DateAxis());
    dateAxis.renderer.minGridDistance = 50;
    // dateAxis.renderer.grid.template.disabled = true;

    chart.yAxes.push(new am4charts.ValueAxis());
    //valueAxis.renderer.grid.template.disabled = true;

    // Create series
    let series = chart.series.push(new am4charts.LineSeries());
    // series.legendSettings.labelText = "Values";
    series.dataFields.valueY = 'value';
    series.dataFields.dateX = 'date';
    series.stroke = am4core.color('#05A677');
    series.strokeWidth = 2.5;
    series.minBulletDistance = 10;
    series.tooltipText = '[bold]{date.formatDate()}:[/] {value}';
    series.tooltip.pointerOrientation = 'vertical';
    series.tooltip.getFillFromObject = false;
    series.tooltip.background.fill = am4core.color('#778CA3');
    series.tooltip.label.fontSize = 12;
    series.tooltip.label.fontFamily = 'Inter ,sans-serif';
    series.tooltip.label.fill = '#fff';

    // Add cursor
    chart.cursor = new am4charts.XYCursor();
  };

  const plotChart = () => {
    if (rcaAnalysisData?.chart) {
      am4core.options.autoDispose = true;

      let chart = am4core.create('chartdivWaterfall', am4charts.XYChart);
      chart.fontSize = 12;
      chart.fontFamily = 'Inter ,sans-serif';

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
      chart.tooltip.label.fontFamily = 'Inter ,sans-serif';
      chart.cursor.behavior = 'none';
    }
  };

  if (linechartData) {
    plotLineChart();
  }
  if (rcaAnalysisData) {
    plotChart();
  }

  const dispatchGetAllDashboardDimension = () => {
    dispatch(getAllDashboardDimension(kpi));
  };

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
              }}
            />
          </div>
          {/* Graph Section */}
          <div className="dashboard-graph-section">
            <div className="common-graph">
              {aggregationData && (
                <Dashboardgraphcard
                  aggregationData={aggregationData}
                  monthWeek={monthWeek}
                />
              )}
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
                  dimension.value !== 'multidimension'
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
                    dimensionData.dimensions.length !== 0 &&
                    dimensionData.dimensions.map((data) => {
                      return (
                        <li
                          className={activeDimension === data ? 'active' : ''}
                          onClick={() => {
                            setActiveDimension(data);
                          }}>
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
                  value={dimension}
                  onChange={(e) => {
                    handleDimensionChange(e);
                    setDimension(e);
                  }}
                />
              </div>
            </div>
            {/*Drill down chart*/}
            <div
              className="common-drilldown-graph"
              id="chartdivWaterfall"></div>

            {dimension.value === 'multidimension' ? (
              <>
                {rcaAnalysisData ? (
                  <DashboardTable
                    rcaAnalysisData={rcaAnalysisData}
                    dimension={dimension}
                  />
                ) : (
                  <div className="loader loader-page">
                    <div className="loading-text">
                      <p>loading</p>
                      <span></span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              // <>
              //   <div className="common-subsection">
              //     <div className="subsection-heading">
              //       <h3>Top Drivers</h3>
              //     </div>

              //     <div className="form-check form-switch">
              //       <input
              //         className="form-check-input"
              //         type="checkbox"
              //         id="removeoverlap"
              //         value={overlap}
              //         onChange={() => setOverlap((prev) => !prev)}
              //       />
              //       <label
              //         className="form-check-label"
              //         htmlFor="removeoverlap">
              //         Remove Overlap
              //       </label>
              //     </div>
              //   </div>

              //   <div className="common-drilldown-table table-section">
              //     <DashboardTable
              //       rcaAnalysisData={rcaAnalysisData}
              //       dimension={dimension}
              //       overlap={overlap}
              //     />
              //   </div>
              // </>
              <>
                {hierarchicalLoading ? (
                  <div className="loader loader-page">
                    <div className="loading-text">
                      <p>loading</p>
                      <span></span>
                    </div>
                  </div>
                ) : (
                  <>
                    {hierarchicalData &&
                      hierarchicalData?.data_table.length !== 0 && (
                        <SingleDimensionTable
                          hierarchicalData={hierarchicalData}
                        />
                      )}
                  </>
                )}
              </>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};
export default Dashboardgraph;
