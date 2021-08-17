import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './dashboard.scss';
import rightarrow from '../../assets/images/rightarrow.svg';

import Dashboardgraph from '../../components/DashboardGraph';
import { useSelector, useDispatch } from 'react-redux';
import { getDashboardSidebar } from '../../redux/actions';
//import Fuse from 'fuse.js';
import {
  getDashboardAggregation,
  getDashboardLinechart,
  getAllDashboardDimension,
  getDashboardRcaAnalysis,
  getAllDashboardHierarchical
} from '../../redux/actions';

import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';

import '../../components/DashboardGraph/dashboardgraph.scss';

import '../../assets/styles/table.scss';

import FilterWithTab from '../../components/FilterWithTab';

const Dashboard = () => {
  const dispatch = useDispatch();
  const [active, setActive] = useState('');
  const [kpi, setKpi] = useState();
  // const [listData, setListData] = useState([]);
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
  const [overlap, setOverlap] = useState(false);

  const { sidebarLoading, sidebarList } = useSelector((state) => {
    return state.sidebar;
  });
  const { aggregationData } = useSelector((state) => state.aggregation);
  const { linechartData } = useSelector((state) => state.lineChart);

  const { hierarchicalData } = useSelector((state) => state.hierarchial);

  const { rcaAnalysisLoading, rcaAnalysisData } = useSelector(
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
    getAllDashboardSidebar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getAllDashboardSidebar = () => {
    dispatch(getDashboardSidebar());
  };

  useEffect(() => {
    if (sidebarList && sidebarList.length !== 0 && kpi === undefined) {
      setActive(sidebarList[0]?.name);
      setKpi(sidebarList[0]?.id);
      //setListData(sidebarList);
    }

    if (dimensionData && dimensionData.length !== 0) {
      setActiveDimension(dimensionData?.dimensions[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sidebarList, dimensionData]);

  useEffect(() => {
    if (kpi !== undefined) {
      getAllAggregationData();
      getAllLinechart();
      getAllRCA();
      getAllDashboardDimension();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kpi, monthWeek.value, dimension.value, activeDimension]);

  // const onSearch = (e) => {
  //   e.preventDefault();
  //   if (e.target.value) {
  //     const options = {
  //       keys: ['name']
  //     };
  //     const fuse = new Fuse(sidebarList, options);
  //     const result = fuse.search(e.target.value);
  //     setListData(
  //       result.map((item) => {
  //         return item.item;
  //       })
  //     );
  //   } else {
  //     setListData(sidebarList);
  //   }
  // };

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

  useEffect(() => {
    if (linechartData) {
      plotLineChart();
    }
    if (rcaAnalysisData) {
      plotChart();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linechartData, rcaAnalysisData]);

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

    let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    // valueAxis.renderer.grid.template.disabled = true;

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

  const dispatchGetAllDashboardDimension = () => {
    dispatch(getAllDashboardDimension(kpi));
  };

  const handleDimensionChange = (data) => {
    if (data.value === 'singledimension') {
      dispatchGetAllDashboardDimension();
    }
  };
  console.log('parent');
  if (sidebarLoading) {
    return (
      <div className="loader loader-page">
        <div className="loading-text">
          <p>loading</p>
          <span></span>
        </div>
      </div>
    );
  } else {
    return (
      <div>
        {/* Page Navigation */}
        <div className="page-navigation">
          {/* Breadcrumb */}
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link to="/">Dashboard </Link>
              </li>
              <li className="breadcrumb-item">
                <Link to="/"> Test Dashboard 1 </Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                AutoRCA
              </li>
            </ol>
          </nav>
          {/* Back */}
          <div className="backnavigation">
            <Link to="/">
              <img src={rightarrow} alt="Back" />
              <span>Test Dashboard 1</span>{' '}
            </Link>
          </div>
        </div>

        {/* explore wrapper */}
        <div className="explore-wrapper">
          {/* filter section */}
          <div className="filter-section">
            {sidebarList && (
              <FilterWithTab
                setKpi={setKpi}
                data={sidebarList}
                active={active}
                setActive={setActive}
              />
            )}
            {/* <div className="common-filter-section">
              
              <div className="filter-layout">
                {sidebarList && <h3>List of KPI’s ({sidebarList.length})</h3>}
                <div className="form-group icon search-filter">
                  <input
                    type="text"
                    className="form-control h-40"
                    placeholder="Search KPI"
                    //onChange={(e) => onSearch(e)}
                  />
                  <span>
                    <img src={Search} alt="Search Icon" />
                  </span>
                </div>
              </div>
            
              <div className="filter-layout filter-tab">
                <ul>
                  {listData &&
                    listData.length !== 0 &&
                    listData.map((item) => {
                      return (
                        <li
                          key={uuidv4()}
                          className={active === item.name ? 'active' : ''}
                          onClick={() => {
                            setActive(item.name);
                            setKpi(item.id);
                          }}>
                          {item.name}
                          <img src={GreenArrow} alt="GreenArrow Icon" />
                        </li>
                      );
                    })}
                </ul>
              </div>
            </div>
          */}
          </div>{' '}
          {/* Graph Section*/}
          <div className="graph-section">
            <Dashboardgraph
              kpi={kpi}
              aggregationData={aggregationData}
              setOverlap={setOverlap}
              overlap={overlap}
              setMonthWeek={setMonthWeek}
              monthWeek={monthWeek}
              dimension={dimension}
              setCollapse={setCollapse}
              collapse={collapse}
              setDimension={setDimension}
              handleDimensionChange={handleDimensionChange}
              dimensionData={dimensionData}
              dimensionLoading={dimensionLoading}
              setActiveDimension={setActiveDimension}
              activeDimension={activeDimension}
              rcaAnalysisData={rcaAnalysisData}
              rcaAnalysisLoading={rcaAnalysisLoading}
              hierarchicalData={hierarchicalData}
            />
          </div>
        </div>
      </div>
    );
  }
};

export default Dashboard;
