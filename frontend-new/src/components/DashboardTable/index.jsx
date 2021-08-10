import React, { useEffect } from 'react';

import { useSelector, useDispatch } from 'react-redux';

import Up from '../../assets/images/up.svg';
import Down from '../../assets/images/down.svg';

import '../../assets/styles/table.scss';

import {
  getDashboardRcaAnalysis,
  getAllDashboardHierarchical
} from '../../redux/actions';

const DashboardTable = ({ data, kpi, overlap, dimension, activeDimension }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    getAllRCA();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, kpi, dimension, activeDimension]);

  const getAllRCA = () => {
    if (dimension === 'multidimension') {
      dispatch(
        getDashboardRcaAnalysis(kpi, {
          timeline: data
        })
      );
    } else if (dimension === 'singledimension') {
      dispatch(
        getAllDashboardHierarchical(kpi, {
          timeline: data,
          dimension: activeDimension
        })
      );
    }
  };

  const { rcaAnalysisLoading, rcaAnalysisData } = useSelector(
    (state) => state.dashboard
  );
  const { hierarchialLoading, hierarchicalData } = useSelector(
    (state) => state.hierarchial
  );
  let tableData =
    !overlap && dimension === 'multidimension'
      ? rcaAnalysisData && rcaAnalysisData.data_table
      : null;
  let overlapData =
    overlap && dimension === 'multidimension'
      ? rcaAnalysisData && rcaAnalysisData.chart.chart_table
      : null;

  let singleDimensionData =
    dimension === 'singledimension'
      ? hierarchicalData && hierarchicalData.data_table
      : null;
  if (rcaAnalysisLoading) {
    return (
      <div className="loader">
        <div className="loading-text">
          <p>loading</p>
          <span></span>
        </div>
      </div>
    );
  } else {
    return (
      <table className="table ">
        <thead>
          {tableData ? (
            <tr>
              {rcaAnalysisData &&
                rcaAnalysisData.data_columns.map((data, index) => {
                  return <th key={index}>{data.title}</th>;
                })}
            </tr>
          ) : null}
          {overlapData ? (
            <tr>
              <th>Subgroup</th>
              <th>Data Points in group</th>
              <th>Non Overlapping data points</th>
              <th>Full Impact</th>
              <th>Non Overlap Impact</th>
            </tr>
          ) : null}
          {singleDimensionData &&
          activeDimension &&
          hierarchialLoading === false ? (
            <tr>
              <th>Subgroup Name</th>
              <th>Prev month Avg</th>
              <th>Prev month Size</th>
              <th>prev month Count</th>
              <th>Curr month Avg</th>
              <th>Curr month Size</th>
              <th>Curr month Count</th>
              <th>Impact</th>
            </tr>
          ) : null}
        </thead>
        <tbody>
          {tableData &&
            tableData.map((data, index) => {
              return (
                <tr key={index}>
                  <td>{data.subgroup}</td>
                  <td>{data.g1_agg}</td>
                  <td>{data.g1_count}</td>
                  <td>{data.g2_agg}</td>
                  <td>{data.g1_size}</td>
                  <td>{data.g2_count}</td>
                  <td>{data.g2_size}</td>
                  <td>
                    {data.impact > 0 ? (
                      <div className="connection__success">
                        <p>
                          <img src={Up} alt="High" />
                          {Math.abs(data.impact)}
                        </p>
                      </div>
                    ) : (
                      <div className="connection__fail">
                        <p>
                          <img src={Down} alt="Low" />
                          {Math.abs(data.impact)}
                        </p>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          {overlapData &&
            overlapData.map((data, index) => {
              return (
                <tr key={index}>
                  <td>{data.string}</td>
                  <td>{data.indices_in_group}</td>
                  <td>{data.non_overlap_indices}</td>
                  <td>
                    {data.impact_full_group > 0 ? (
                      <div className="connection__success">
                        <p>
                          <img src={Up} alt="High" />
                          {Math.abs(data.impact_full_group)}
                        </p>
                      </div>
                    ) : (
                      <div className="connection__fail">
                        <p>
                          <img src={Down} alt="Low" />
                          {Math.abs(data.impact_full_group)}
                        </p>
                      </div>
                    )}
                  </td>
                  <td>
                    {data.impact_non_overlap > 0 ? (
                      <div className="connection__success">
                        <p>
                          <img src={Up} alt="High" />
                          {Math.abs(data.impact_non_overlap)}
                        </p>
                      </div>
                    ) : (
                      <div className="connection__fail">
                        <p>
                          <img src={Down} alt="Low" />
                          {Math.abs(data.impact_non_overlap)}
                        </p>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          {singleDimensionData &&
            singleDimensionData.map((data, index) => {
              return (
                <tr key={index}>
                  <td>{data.subgroup}</td>
                  <td>{data.g1_agg}</td>
                  <td>{data.g1_count}</td>
                  <td>{data.g2_agg}</td>
                  <td>{data.g1_size}</td>
                  <td>{data.g2_count}</td>
                  <td>{data.g2_size}</td>
                  <td>
                    {data.impact > 0 ? (
                      <div className="connection__success">
                        <p>
                          <img src={Up} alt="High" />
                          {Math.abs(data.impact)}
                        </p>
                      </div>
                    ) : (
                      <div className="connection__fail">
                        <p>
                          <img src={Down} alt="Low" />
                          {Math.abs(data.impact)}
                        </p>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    );
  }
};
export default DashboardTable;
