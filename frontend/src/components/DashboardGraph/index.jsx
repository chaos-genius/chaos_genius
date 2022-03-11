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
import DeepdrillDrilldownsEmpty from '../DeepdrillDrilldownsEmpty';

import { formatDateTime, getTimezone } from '../../utils/date-helper';

import {
  getDashboardAggregation,
  getDashboardLinechart,
  getAllDashboardDimension,
  getDashboardRcaAnalysis,
  getAllDashboardHierarchical,
  getDashboardConfig
} from '../../redux/actions';

import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import highchartsMore from 'highcharts/highcharts-more';
import {
  HRNumbers,
  HRN_PREFIXES
} from '../../utils/Formatting/Numbers/humanReadableNumberFormatter';
import store from '../../redux/store';

highchartsMore(Highcharts);
Highcharts.setOptions({
  time: {
    timezone: getTimezone()
  },
  lang: {
    thousandsSep: ','
  }
});

const multidimensional = [
  {
    value: 'singledimension',
    label: 'Single Dimension'
  },
  {
    value: 'multidimension',
    label: 'Multi Dimension'
  }
];
const customStyles = {
  container: (provided) => ({
    ...provided,
    width: 180
  })
};

const Dashboardgraph = ({ kpi, kpiName, anomalystatus }) => {
  const dispatch = useDispatch();

  const [activeDimension, setActiveDimension] = useState('');
  const [collapse, setCollapse] = useState(true);
  const [singleDimensionData, SetSingleDimensionData] = useState(0);

  const [monthWeek, setMonthWeek] = useState({});
  const [timeCutOptions, setTimeCutOptions] = useState([]);
  const [dimension, setDimension] = useState({
    value: 'singledimension',
    label: 'Single Dimension'
  });

  const { timeCutsData, activeTimeCut } = useSelector(
    (state) => state.TimeCuts
  );

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

  const { configData } = useSelector((state) => state.config);

  const { dimensionData, dimensionLoading } = useSelector(
    (state) => state.dimension
  );

  const getAllAggregationData = () => {
    dispatch(getDashboardAggregation(kpi, { timeline: monthWeek.value }));
  };

  const getAllLinechart = () => {
    dispatch(getDashboardLinechart(kpi, { timeline: monthWeek.value }));
  };

  const getAllTimeCutOptions = (data) => {
    let res = [];
    if (data && data.length) {
      for (const dataKey of data) {
        res.push({
          value: `${dataKey?.id}`,
          label: dataKey?.display_name,
          grp2_name: dataKey?.current_period_name,
          grp1_name: dataKey?.last_period_name
        });
      }
    }
    setTimeCutOptions(res);
  };

  useEffect(() => {
    if (timeCutsData && timeCutsData.length) {
      if (activeTimeCut && Object.keys(activeTimeCut).length) {
        setMonthWeek(activeTimeCut);
      } else {
        setMonthWeek({
          label: timeCutsData[0]?.display_name,
          value: `${timeCutsData[0]?.id}`,
          grp2_name: timeCutsData[0]?.current_period_name,
          grp1_name: timeCutsData[0]?.last_period_name
        });
      }
      getAllTimeCutOptions(timeCutsData);
    }
  }, [timeCutsData, activeTimeCut]);

  useEffect(() => {
    if (kpi !== undefined && monthWeek.value) {
      dispatch(getDashboardConfig({ kpi_id: kpi }));
      getAllAggregationData();
      getAllLinechart();
      if (dimension.value === 'singledimension') {
        dispatchGetAllDashboardDimension();
      } else if (dimension.value === 'multidimension') {
        dispatch(
          getDashboardRcaAnalysis(kpi, {
            timeline: monthWeek.value
          })
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kpi, monthWeek.value]);

  useEffect(() => {
    if (
      dimensionData &&
      dimensionData?.dimensions &&
      dimensionData?.dimensions.length !== 0
    ) {
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
      valueAxis.numberFormatter = new am4core.NumberFormatter();
      valueAxis.numberFormatter.numberFormat = '#a';
      valueAxis.numberFormatter.bigNumberPrefixes = HRN_PREFIXES;

      valueAxis.tooltip.numberFormatter = new am4core.NumberFormatter();
      valueAxis.tooltip.numberFormat = '#,###,###.##';

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
      label.text = "{displayValue.formatNumber('#,###,###.##')}";
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

  useEffect(() => {
    if (rcaAnalysisData) {
      plotChart();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rcaAnalysisData]);

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
          height: '350',
          width: '850',
          marginLeft: 70
        },
        title: {
          text: kpiName,
          style: {
            fontWeight: 'bold',
            fontSize: '14px'
          }
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
        legend: {
          enabled: true,
          padding: 5
        },
        tooltip: {
          crosshairs: true,
          shared: true,
          valueSuffix: null,
          formatter: function () {
            const tooltipStr = `<b>Datetime: </b>${formatDateTime(
              this.x,
              true,
              true
            )}<br> <b>${monthWeek.grp1_name}: </b>${Highcharts.numberFormat(
              this.y,
              2
            )}`;
            return tooltipStr;
          }
        },
        yAxis: {
          type: 'value',
          step: 1,
          labels: {
            formatter: function () {
              return HRNumbers.toHumanString(this.value);
            }
          },
          title: {
            margin: 25
          }
        },
        plotOptions: {
          line: {
            marker: {
              enabled: false
            }
          }
        },
        series: [
          {
            color: '#60ca9a',
            data: line.map((linedata) => linedata.value),
            name: monthWeek.grp1_name,
            id: 'first series',
            zIndex: 2,
            type: 'line'
          }
        ]
      };
      return demoChart;
    }
  };
  return (
    <>
      {anomalystatus.is_rca_precomputed ? (
        <>
          <div className="dashboard-layout dashboard-layout-change">
            <div className="dashboard-container">
              <div className="dashboard-subcategory">
                <div className="time-container">
                  <div className="time-stamp">
                    <p>
                      Last Data Entry:{' '}
                      <span>
                        {aggregationData?.analysis_date
                          ? aggregationData?.analysis_date
                          : '-'}
                      </span>
                    </p>
                  </div>
                  <div className="time-stamp">
                    <p>
                      Last Scan:{' '}
                      <span>
                        {aggregationData?.last_run_time_rca
                          ? aggregationData?.last_run_time_rca
                          : '-'}
                      </span>
                    </p>
                  </div>
                </div>
                <Select
                  value={monthWeek}
                  options={timeCutOptions}
                  styles={customStyles}
                  classNamePrefix="selectcategory"
                  placeholder="select"
                  isSearchable={false}
                  onChange={(e) => {
                    setMonthWeek(e);
                  }}
                />
              </div>
              <div className="dashboard-aggregate-section">
                <div className="aggregate-card-container">
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
                        />
                      )}
                    </>
                  )}
                </div>
              </div>
              {/* Graph Section */}
              <div className="dashboard-graph-section">
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
              }
              onClick={() => setCollapse(!collapse)}>
              <div className="dashboard-header">
                <h3>Drill Downs</h3>
              </div>
              <div
                className={
                  collapse
                    ? 'header-collapse '
                    : 'header-collapse header-disable'
                }>
                <img src={Toparrow} alt="CollapseOpen" />
              </div>
            </div>

            <div
              className={
                collapse
                  ? 'dashboard-container'
                  : 'dashboard-container drilldown-disable'
              }>
              {dimensionData &&
              dimensionData.dimensions &&
              dimensionData.dimensions.length === 0 ? (
                <DeepdrillDimensionEmpty />
              ) : (
                <>
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
                                onClick={() => {
                                  SetSingleDimensionData(
                                    singleDimensionData - 3
                                  );
                                }}>
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
                                        store.dispatch({
                                          type: 'RESET_DASHBOARD_RCA'
                                        });
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
                                onClick={() => {
                                  SetSingleDimensionData(
                                    singleDimensionData + 3
                                  );
                                }}>
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
                        isDisabled={!configData?.multidim_status}
                        value={dimension}
                        onChange={(e) => {
                          store.dispatch({ type: 'RESET_DASHBOARD_RCA' });
                          handleDimensionChange(e);
                        }}
                      />
                    </div>
                  </div>
                  {rcaAnalysisData &&
                  rcaAnalysisData?.chart &&
                  rcaAnalysisData?.chart?.chart_data.length === 0 &&
                  rcaAnalysisData?.data_table.length === 0 ? (
                    <DeepdrillDrilldownsEmpty />
                  ) : (
                    <>
                      {/*Drill down chart*/}
                      {rcaAnalysisLoading && (
                        <div className="load waterfallchart-loader">
                          <div className="preload"></div>
                        </div>
                      )}
                      {rcaAnalysisData &&
                        rcaAnalysisData?.chart &&
                        rcaAnalysisData?.chart?.chart_data.length && (
                          <div
                            className={
                              'common-drilldown-graph' +
                              (rcaAnalysisLoading
                                ? ' common-drilldown-graph-none '
                                : '')
                            }
                            id="chartdivWaterfall"></div>
                        )}
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
                    </>
                  )}
                </>
              )}
            </div>
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
