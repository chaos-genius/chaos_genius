import React from 'react';

import Select from 'react-select';

import Setting from '../../assets/images/setting.svg';
import Toparrow from '../../assets/images/toparrow.svg';

import DashboardTable from '../DashboardTable';
import Dashboardgraphcard from '../DashboardGraphCard';

import './dashboardgraph.scss';

import '../../assets/styles/table.scss';
import SingleDimensionTable from './SingleDimensionTable';

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

const Dashboardgraph = ({
  aggregationData,
  monthWeek,
  setMonthWeek,
  dimension,
  setDimension,
  handleDimensionChange,
  dimensionData,
  dimensionLoading,
  setActiveDimension,
  activeDimension,
  setCollapse,
  collapse,
  hierarchicalData,
  setOverlap,
  overlap,
  rcaAnalysisData,
  rcaAnalysisLoading,
  kpi
}) => {
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
                          onClick={() => setActiveDimension(data)}>
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
                    overlap={overlap}
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
                {hierarchicalData ? (
                  <SingleDimensionTable hierarchicalData={hierarchicalData} />
                ) : (
                  <div className="loader loader-page">
                    <div className="loading-text">
                      <p>loading</p>
                      <span></span>
                    </div>
                  </div>
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
