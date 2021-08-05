import React from 'react';

import { Link } from 'react-router-dom';

import GoogleAnalytics from '../../assets/images/googleanalytics.svg';
import GoogleSheet from '../../assets/images/googlesheets.svg';
import Postgre from '../../assets/images/postgre.svg';
import Amplitude from '../../assets/images/amplitude.svg';
import MySQL from '../../assets/images/mysql.svg';
import Edit from '../../assets/images/edit.svg';

import '../../assets/styles/table.scss';

import { v4 as uuidv4 } from 'uuid';

const KPITable = ({ kpiData }) => {
  return (
    <table className="table">
      <thead>
        <tr>
          <th>KPI Name</th>
          <th>Dimensions</th>
          <th>Data Source Type</th>
          <th>Created On</th>
          <th>Last Modified</th>

          <th></th>
        </tr>
      </thead>
      <tbody>
        {kpiData && kpiData.length !== 0 ? (
          kpiData.map((kpi) => {
            return (
              <tr key={uuidv4()}>
                <td>{kpi.name}</td>
                <td>
                  <ul className="table-tips">
                    {kpi.dimensions &&
                      kpi.dimensions.map((dimension) => (
                        <li key={uuidv4()}>
                          <span>{dimension}</span>
                        </li>
                      ))}
                  </ul>
                </td>
                <td>
                  <div className="source-type">
                    <img
                      src={
                        kpi.datasourceType === 'Google Analytics'
                          ? GoogleAnalytics
                          : kpi.datasourceType === 'Postgres'
                          ? Postgre
                          : kpi.datasourceType === 'Google Sheets'
                          ? GoogleSheet
                          : kpi.datasourceType === 'MySQL'
                          ? MySQL
                          : kpi.datasourceType === 'Amplitude'
                          ? Amplitude
                          : '-'
                      }
                      alt={kpi.datasourceType}
                    />
                    <span>{kpi.datasourceType || '-'}</span>
                  </div>
                </td>
                <td>{kpi.created_at || '-'}</td>
                <td>{kpi.last_modified || '-'}</td>
                <td>
                  <Link to={`/kpiexplorer/edit/${kpi.id}`}>
                    {' '}
                    <div className="edit-information">
                      <img src={Edit} alt="Edit" />
                    </div>
                  </Link>
                </td>
              </tr>
            );
          })
        ) : (
          <tr className="empty-table">
            <td colSpan={5}>No Data Found</td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default KPITable;
