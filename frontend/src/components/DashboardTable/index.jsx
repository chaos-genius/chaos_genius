import React from 'react';

import Up from '../../assets/images/up.svg';
import Down from '../../assets/images/down.svg';

import '../../assets/styles/table.scss';
import { useState } from 'react';

const DashboardTable = ({ rcaAnalysisData }) => {
  const [overlap, setOverlap] = useState(false);

  return (
    <>
      <div className="common-subsection">
        <div className="subsection-heading">
          <h3>Top Drivers</h3>
        </div>

        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            id="removeoverlap"
            value={overlap}
            onChange={(e) => {
              setOverlap((prev) => !prev);
            }}
          />
          <label className="form-check-label" htmlFor="removeoverlap">
            Remove Overlap
          </label>
        </div>
      </div>
      <div className="common-drilldown-table table-section">
        {overlap ? (
          <div class="table-responsive">
            <table className="table">
              <thead>
                {rcaAnalysisData && rcaAnalysisData?.chart !== undefined ? (
                  <tr>
                    <th>Subgroup</th>
                    <th>Data Points in group</th>
                    <th>Non Overlapping data points</th>
                    <th>Full Impact</th>
                    <th>Non Overlap Impact</th>
                  </tr>
                ) : (
                  <tr>loading</tr>
                )}
              </thead>
              <tbody>
                {rcaAnalysisData &&
                  rcaAnalysisData?.chart?.chart_table.length !== 0 &&
                  rcaAnalysisData?.chart?.chart_table
                    .slice(0, 10)
                    .map((data, index) => {
                      return (
                        <tr key={index}>
                          <td className="date-column-formated">
                            {data.string}
                          </td>
                          <td className="date-column-formated">
                            {data.indices_in_group}
                          </td>
                          <td className="date-column-formated">
                            {data.non_overlap_indices}
                          </td>
                          <td className="date-column-formated">
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
                          <td className="date-column-formated">
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
              </tbody>
            </table>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table ">
              <thead>
                {
                  <tr>
                    {rcaAnalysisData &&
                      rcaAnalysisData.data_columns !== undefined &&
                      rcaAnalysisData.data_columns.map((data, index) => {
                        return <th key={index}>{data.title}</th>;
                      })}
                  </tr>
                }
              </thead>
              <tbody>
                {rcaAnalysisData &&
                  rcaAnalysisData.data_table.slice(0, 50).map((data, index) => {
                    return (
                      <tr key={index}>
                        <td className="date-column-formated">
                          {data.subgroup}
                        </td>
                        <td className="date-column-formated">{data.g1_agg}</td>
                        <td className="date-column-formated">
                          {data.g1_count}
                        </td>
                        <td className="date-column-formated">{data.g1_size}</td>
                        <td className="date-column-formated">{data.g2_agg}</td>
                        <td className="date-column-formated">
                          {data.g2_count}
                        </td>
                        <td className="date-column-formated">{data.g2_size}</td>
                        <td className="date-column-formated">
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
          </div>
        )}
      </div>
    </>
  );
};
export default DashboardTable;
