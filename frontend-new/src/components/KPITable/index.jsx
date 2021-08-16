import React from 'react';

import { Link } from 'react-router-dom';

import GoogleAnalytics from '../../assets/images/googleanalytics.svg';
import GoogleSheet from '../../assets/images/googlesheets.svg';
import Postgre from '../../assets/images/postgre.svg';
import Amplitude from '../../assets/images/amplitude.svg';
import MySQL from '../../assets/images/mysql.svg';
import Edit from '../../assets/images/edit-active.svg';

import '../../assets/styles/table.scss';

import { v4 as uuidv4 } from 'uuid';
import Dimension from './dimension';

import { formatDate } from '../../utils/date-helper';

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
                  <Dimension data={kpi.dimensions}></Dimension>
                </td>
                <td>
                  <div className="source-type">
                    <img
                      src={
                        kpi.connection_type === 'Google Analytics'
                          ? GoogleAnalytics
                          : kpi.connection_type === 'Postgres'
                          ? Postgre
                          : kpi.connection_type === 'Google Sheets'
                          ? GoogleSheet
                          : kpi.connection_type === 'MySQL'
                          ? MySQL
                          : kpi.connection_type === 'Amplitude'
                          ? Amplitude
                          : '-'
                      }
                      alt={kpi.connection_type}
                    />
                    <span>{kpi.connection_type || '-'}</span>
                  </div>
                </td>
                <td>{formatDate(kpi.created_at) || '-'}</td>
                <td>{formatDate(kpi.last_modified) || '-'}</td>
                <td>
                  <Link to={`/kpiexplorer/edit/${kpi.id}`}>
                    <div
                      className="edit-information"
                      data-bs-toggle="tooltip"
                      data-bs-placement="bottom"
                      title="Edit">
                      <img src={Edit} alt="Edit" />
                    </div>
                  </Link>
                </td>
              </tr>
            );
          })
        ) : (
          <tr className="empty-table">
            <td colSpan={6}>No Data Found</td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default KPITable;
