import React from 'react';

import Up from '../../assets/images/up.svg';
import Down from '../../assets/images/down.svg';

import '../../assets/styles/table.scss';

const DashboardTable = ({ hierarchicalData }) => {
  return (
    <div className="common-drilldown-table table-section">
      <table className="table ">
        <thead>
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
        </thead>
        <tbody>
          {hierarchicalData &&
            hierarchicalData?.data_table.length !== 0 &&
            hierarchicalData.data_table.map((data, index) => {
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
    </div>
  );
};
export default DashboardTable;
