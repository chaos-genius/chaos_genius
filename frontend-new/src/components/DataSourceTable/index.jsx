import React from 'react';

import '../../assets/styles/table.scss';

import GoogleAnalytics from '../../assets/images/googleanalytics.svg';
import GoogleSheet from '../../assets/images/googlesheets.svg';
import Postgre from '../../assets/images/postgre.svg';
import Amplitude from '../../assets/images/amplitude.svg';
import MySQL from '../../assets/images/mysql.svg';
//import Edit from '../../assets/images/edit.svg';
import Trash from '../../assets/images/trash.svg';

import { formatDate } from '../../utils/date-helper';

//import { deleteDatasource } from '../../redux/actions';

//import { dispatch ,useSelector } from 'react-redux';

import { v4 as uuidv4 } from 'uuid';

const DataSourceTable = ({ tableData }, props) => {
  // const dispatch = useDispatch();

  //const { deleteDatasourceResponse } = useSelector((state) => state.datasource);

  const onDelete = (datasource) => {
    // const payload = {
    //   data_source_id: datasource.id
    // };
    //dispatch(deleteDatasource(payload));
  };

  return (
    <table className="table">
      <thead>
        <tr>
          <th>Data Connection Name</th>
          <th>Status</th>
          <th>Data Source Type</th>
          <th>No of KPIs</th>
          <th>Last Sync</th>
          <th>Created On</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {tableData && tableData.length !== 0 ? (
          tableData.map((datasource) => {
            return (
              <tr key={uuidv4()}>
                <td>{datasource.name}</td>
                <td>
                  <div
                    className={
                      datasource.active ? 'live-status' : 'broken-status'
                    }>
                    <span>{datasource.active ? 'Live' : 'Broken'}</span>
                  </div>
                </td>
                <td>
                  <div className="source-type">
                    <img
                      src={
                        datasource.connection_type === 'Google Analytics'
                          ? GoogleAnalytics
                          : datasource.connection_type === 'Postgres'
                          ? Postgre
                          : datasource.connection_type === 'Google Sheets'
                          ? GoogleSheet
                          : datasource.connection_type === 'MySQL'
                          ? MySQL
                          : datasource.connection_type === 'Amplitude'
                          ? Amplitude
                          : ''
                      }
                      alt={datasource.connection_type}
                    />
                    <span>{datasource.connection_type}</span>
                  </div>
                </td>
                <td>{datasource.kpi_count || '-'}</td>
                <td>{formatDate(datasource.last_sync)}</td>
                <td>{formatDate(datasource.created_at)}</td>
                <td>
                  <div className="edit-information">
                    <img
                      src={Trash}
                      alt="delete"
                      onClick={() => onDelete(datasource)}
                    />
                  </div>
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
export default DataSourceTable;
