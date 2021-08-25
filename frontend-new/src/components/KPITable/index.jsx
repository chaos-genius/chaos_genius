import React from 'react';

import { Link } from 'react-router-dom';

// import GoogleAnalytics from '../../assets/images/googleanalytics.svg';
// import GoogleSheet from '../../assets/images/googlesheets.svg';
// import Postgre from '../../assets/images/postgre.svg';
// import Amplitude from '../../assets/images/amplitude.svg';
// import MySQL from '../../assets/images/mysql.svg';
import Edit from '../../assets/images/edit.svg';
import EditActive from '../../assets/images/edit-active.svg';

import '../../assets/styles/table.scss';

import { v4 as uuidv4 } from 'uuid';
import Dimension from './dimension';

import { formatDate } from '../../utils/date-helper';

const KPITable = ({ kpiData, connectionType }) => {
  const datasourceIcon = (type) => {
    let textHtml;
    connectionType.find((item) => {
      if (item.name === type) {
        textHtml = item.icon;
      }
      return '';
    });
    return (
      <>
        <span
          dangerouslySetInnerHTML={{ __html: textHtml }}
          className="datasource-svgicon"
        />
        <span>{type || '-'}</span>
      </>
    );
  };

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
        {kpiData && connectionType && kpiData.length !== 0 ? (
          kpiData.map((kpi) => {
            return (
              <tr key={uuidv4()}>
                <td>{kpi.name}</td>
                <td>
                  {kpi.dimensions.length !== 0 ? (
                    <Dimension data={kpi.dimensions}></Dimension>
                  ) : (
                    '-'
                  )}
                </td>
                <td>
                  <div className="source-type">
                    {connectionType && datasourceIcon(kpi.connection_type)}
                  </div>
                </td>
                <td className="date-formated">
                  {formatDate(kpi.created_at) || '-'}
                </td>
                <td className="date-formated">
                  {formatDate(kpi.last_sync) || '-'}
                </td>
                <td>
                  <Link to={`/kpiexplorer/edit/${kpi.id}`}>
                    <div className="table-actions">
                      <div
                        className="table-action-icon"
                        data-bs-toggle="tooltip"
                        data-bs-placement="bottom"
                        title="Edit">
                        <img src={Edit} alt="Edit" className="action-normal" />
                        <img
                          src={EditActive}
                          alt="Edit"
                          className="action-active"
                        />
                      </div>
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
