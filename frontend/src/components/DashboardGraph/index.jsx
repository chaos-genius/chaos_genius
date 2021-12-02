import React, { useEffect, useState } from 'react';

import { useSelector, useDispatch } from 'react-redux';

import Select from 'react-select';

import DashboardTable from '../DashboardTable';
import Dashboardgraphcard from '../DashboardGraphCard';

import './dashboardgraph.scss';
import '../../assets/styles/table.scss';

import Toparrow from '../../assets/images/toparrow.svg';
import Next from '../../assets/images/next.svg';

import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';

import HierarchicalTable from '../HierarchicalTable';
import DeepdrillsEmptyState from '../DeepdrillsEmptyState';
import DeepdrillDimensionEmpty from '../DeepdrillDimensionEmpty';
// import DeepdrillDrilldownsEmpty from '../DeepdrillDrilldownsEmpty';

import { formatDateTime, getTimezone } from '../../utils/date-helper';

import {
  getDashboardAggregation,
  getDashboardLinechart,
  getAllDashboardDimension,
  getDashboardRcaAnalysis,
  getAllDashboardHierarchical
} from '../../redux/actions';

import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import highchartsMore from 'highcharts/highcharts-more';

highchartsMore(Highcharts);
Highcharts.setOptions({
  time: {
    timezone: getTimezone()
  }
});

const data = [
  {
    value: 'mom',
    label: 'Current Month on Last Month'
  },
  {
    value: 'wow',
    label: 'Current Week on Last Week'
  },
  {
    value: 'dod',
    label: 'Current Day on Last Day'
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

const Dashboardgraph = ({ kpi, kpiName, kpiAggregate, anomalystatus }) => {
  const dispatch = useDispatch();

  const [activeDimension, setActiveDimension] = useState('');
  const [collapse, setCollapse] = useState(true);
  const [singleDimensionData, SetSingleDimensionData] = useState(0);

  const [monthWeek, setMonthWeek] = useState({
    value: 'mom',
    label: 'Current Month on Last Month'
  });
  const [dimension, setDimension] = useState({
    value: 'singledimension',
    label: 'Singledimension'
  });

  const { aggregationData, aggregationLoading } = useSelector(
    (state) => state.aggregation
  );
  const { linechartData, linechartLoading } = useSelector(
    (state) => state.lineChart
  );

  const { hierarchicalData, hierarchialLoading } = useSelector(
    (state) => state.hierarchial
  );

  const { rcaAnalysisData, rcaAnalysisLoading } = useSelector(
    (state) => state.dashboard
  );

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
      if (dimension.value === 'singledimension') {
        dispatchGetAllDashboardDimension();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kpi, monthWeek.value]);

  useEffect(() => {
    if (dimensionData && dimensionData?.dimensions) {
      setActiveDimension(dimensionData?.dimensions[0]);
      getSingleDimensioData(dimensionData?.dimensions[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dimensionData]);

  const getSingleDimensioData = (value) => {
    dispatch(
      getDashboardRcaAnalysis(kpi, {
        timeline: monthWeek.value,
        dimension: value
      })
    );
    dispatch(
      getAllDashboardHierarchical(kpi, {
        timeline: monthWeek.value,
        dimension: value
      })
    );
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

  if (rcaAnalysisData) {
    plotChart();
  }

  const dispatchGetAllDashboardDimension = () => {
    dispatch(getAllDashboardDimension(kpi));
  };

  const handleDimensionChange = (data) => {
    setDimension(data);
    if (data.value === 'singledimension') {
      dispatchGetAllDashboardDimension();
    } else {
      dispatch(
        getDashboardRcaAnalysis(kpi, {
          timeline: monthWeek.value
        })
      );
    }
  };

  const onActiveDimensionClick = (data) => {
    setActiveDimension(data);
    dispatch(
      getDashboardRcaAnalysis(kpi, {
        timeline: monthWeek.value,
        dimension: data
      })
    );
    dispatch(
      getAllDashboardHierarchical(kpi, {
        timeline: monthWeek.value,
        dimension: data
      })
    );
  };

  const lineChart = (line) => {
    if (line) {
      let demoChart = {
        chart: {
          type: 'line',
          height: '308',
          width: '400'
        },
        title: {
          text: kpiName
        },
        time: {
          timezone: getTimezone()
        },
        xAxis: {
          type: 'datetime',
          categories: line.map((data) => formatDateTime(data.date)),
          labels: {
            step: 6,
            formatter: function () {
              return Highcharts.dateFormat('%d %b', this.value);
            }
          }
        },
        yAxis: {
          type: 'value',
          step: 1
        },
        plotOptions: {
          line: {
            marker: {
              enabled: false
            }
          }
        },
        legend: {
          enabled: false
        },
        series: [
          {
            color: '#60ca9a',
            data: line.map((linedata) => linedata.value)
          }
        ]
      };
      return demoChart;
    }
  };
  // useEffect(() => {
  //   console.log('Rca:', rcaAnalysisData);
  //   if (
  //     // rcaAnalysisData &&
  //     // rcaAnalysisData?.chart &&
  //     // rcaAnalysisData?.chart?.chart_data &&
  //     // rcaAnalysisData?.chart?.chart_data.length === 0 &&
  //     // rcaAnalysisData.data_table &&
  //     // rcaAnalysisData.data_table.length === 0 &&
  //     dimensionData &&
  //     dimensionData.dimensions &&
  //     dimensionData.dimensions.length === 0
  //   ) {
  //     console.log('DiemsnionData:', dimensionData.dimensions.length);

  //   }
  // }, [rcaAnalysisData, dimensionData]);

  return (
    <>
      {anomalystatus.is_rca_precomputed ? (
        <>
          <div className="dashboard-layout dashboard-layout-change">
            <div className="dashboard-container">
              <div className="dashboard-subcategory">
                <div className="time-stamp">
                  <p>
                    Last updated:{' '}
                    <span>
                      {formatDateTime(
                        aggregationData?.analysis_date,
                        true,
                        false,
                        true
                      ) || '-'}
                    </span>
                  </p>
                </div>
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
                  {aggregationLoading ? (
                    <div className="load">
                      <div className="preload"></div>
                    </div>
                  ) : (
                    <>
                      {aggregationData && (
                        <Dashboardgraphcard
                          aggregationData={aggregationData}
                          monthWeek={monthWeek}
                          kpi={kpi}
                          kpiName={kpiName}
                          kpiAggregate={kpiAggregate}
                        />
                      )}
                    </>
                  )}
                </div>
                {/* Line Chart */}
                <div className="common-graph">
                  {linechartLoading ? (
                    <div className="load">
                      <div className="preload"></div>
                    </div>
                  ) : (
                    <>
                      {linechartData && linechartData.length !== 0 && (
                        <HighchartsReact
                          highcharts={Highcharts}
                          options={lineChart(linechartData)}
                        />
                      )}
                    </>
                  )}
                </div>
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
                  collapse
                    ? 'header-collapse '
                    : 'header-collapse header-disable'
                }
                onClick={() => setCollapse(!collapse)}>
                <img src={Toparrow} alt="CollapseOpen" />
              </div>
            </div>
            {
              // rcaAnalysisData &&
              // rcaAnalysisData?.chart &&
              // rcaAnalysisData?.chart?.chart_data &&
              // rcaAnalysisData?.chart?.chart_data.length === 0 &&
              // rcaAnalysisData.data_table &&
              // rcaAnalysisData.data_table.length === 0
              // rcaAnalysisData === ''
              dimensionData &&
              dimensionData.dimensions &&
              dimensionData.dimensions.length === 0 ? (
                // <DeepdrillDrilldownsEmpty />
                <DeepdrillDimensionEmpty />
              ) : (
                <div
                  className={
                    collapse
                      ? 'dashboard-container'
                      : 'dashboard-container drilldown-disable'
                  }>
                  {/* {rcaAnalysisData &&
                  rcaAnalysisData?.chart &&
                  rcaAnalysisData?.chart?.chart_data &&
                  rcaAnalysisData.data_table &&
                  (rcaAnalysisData?.chart?.chart_data.length !== 0 ||
                    rcaAnalysisData.data_table.length !== 0) && ( */}
                  <div className="dashboard-subheader">
                    <div
                      className={
                        dimension.value !== 'multidimension'
                          ? ' common-tab common-drilldown-tab'
                          : 'common-tab common-tab-hide'
                      }>
                      <ul>
                        {dimensionLoading ? (
                          <div className="load">
                            <div className="preload"></div>
                          </div>
                        ) : (
                          <>
                            {singleDimensionData > 2 ? (
                              <li
                                className="previous-step"
                                onClick={() =>
                                  SetSingleDimensionData(
                                    singleDimensionData - 3
                                  )
                                }>
                                <img src={Next} alt="Previous" />
                              </li>
                            ) : null}
                            {dimensionData?.dimensions &&
                              dimensionData?.dimensions.length !== 0 &&
                              dimensionData?.dimensions
                                .slice(
                                  0 + singleDimensionData,
                                  3 + singleDimensionData
                                )
                                .map((data) => {
                                  return (
                                    <li
                                      className={
                                        activeDimension === data ? 'active' : ''
                                      }
                                      onClick={() => {
                                        onActiveDimensionClick(data);
                                      }}>
                                      {data}
                                    </li>
                                  );
                                })}

                            {dimensionData?.dimensions &&
                            dimensionData?.dimensions.length > 3 &&
                            dimensionData?.dimensions.length !== 0 ? (
                              <li
                                className={
                                  singleDimensionData + 1 >=
                                  dimensionData?.dimensions.length
                                    ? 'disable-next'
                                    : ''
                                }
                                onClick={() =>
                                  SetSingleDimensionData(
                                    singleDimensionData + 3
                                  )
                                }>
                                <img src={Next} alt="Next" />
                              </li>
                            ) : null}
                          </>
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
                        }}
                      />
                    </div>
                  </div>
                  {/* )}{' '} */}
                  {/*Drill down chart*/}
                  {rcaAnalysisLoading && (
                    <div className="load waterfallchart-loader">
                      <div className="preload"></div>
                    </div>
                  )}
                  <div
                    className={
                      'common-drilldown-graph' +
                      (rcaAnalysisLoading
                        ? ' common-drilldown-graph-none '
                        : '')
                    }
                    id="chartdivWaterfall"></div>
                  {/* Table */}
                  {dimension.value === 'multidimension' ? (
                    <>
                      {rcaAnalysisLoading ? (
                        <div className="load rca-graph-loader">
                          <div className="preload"></div>
                        </div>
                      ) : (
                        <>
                          {rcaAnalysisData &&
                            rcaAnalysisData.data_table.length !== 0 && (
                              <DashboardTable
                                rcaAnalysisData={rcaAnalysisData}
                                dimension={dimension}
                              />
                            )}
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      {hierarchialLoading ? (
                        <div className="load rca-graph-loader">
                          <div className="preload"></div>
                        </div>
                      ) : (
                        <>
                          {hierarchicalData &&
                            hierarchicalData?.data_table.length !== 0 && (
                              <HierarchicalTable
                                hierarchicalData={hierarchicalData}
                              />
                            )}
                        </>
                      )}
                    </>
                  )}
                </div>
              )
            }{' '}
          </div>
        </>
      ) : (
        anomalystatus !== '' && (
          <div className="dashboard-layout setup-layout-empty">
            <DeepdrillsEmptyState />
          </div>
        )
      )}
    </>
  );
};
export default Dashboardgraph;
