import React, { useState, useEffect } from 'react';

import { Link } from 'react-router-dom';
import Modal from 'react-modal';

// import GoogleAnalytics from '../../assets/images/googleanalytics.svg';
// import GoogleSheet from '../../assets/images/googlesheets.svg';
// import Postgre from '../../assets/images/postgre.svg';
// import Amplitude from '../../assets/images/amplitude.svg';
// import MySQL from '../../assets/images/mysql.svg';
import Edit from '../../assets/images/edit.svg';
import EditActive from '../../assets/images/edit-active.svg';
import Alert from '../../assets/images/alert.svg';
import AlertActive from '../../assets/images/alert-active.svg';
import Delete from '../../assets/images/delete.svg';
import DeleteActive from '../../assets/images/delete-active.svg';
import Close from '../../assets/images/close.svg';

import '../../assets/styles/table.scss';
import '../Modal/modal.scss';
import './datasourcetable.scss';

import { formatDate } from '../../utils/date-helper';

import { deleteDatasource } from '../../redux/actions';

import { useDispatch, useSelector } from 'react-redux';

import { v4 as uuidv4 } from 'uuid';

const DataSourceTable = ({ tableData, changeData, connectionType }) => {
  const dispatch = useDispatch();

  const { deleteDataSourceResponse } = useSelector((state) => state.dataSource);
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState('');

  const closeModal = () => {
    setIsOpen(false);
  };
  useEffect(() => {
    if (deleteDataSourceResponse) {
      changeData((prev) => !prev);
      setIsOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [changeData, deleteDataSourceResponse]);

  const onDelete = (datasource) => {
    const payload = {
      data_source_id: datasource.id
    };
    dispatch(deleteDatasource(payload));
  };
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
        {tableData && connectionType && tableData.length !== 0 ? (
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
                    {connectionType &&
                      datasourceIcon(datasource.connection_type)}
                  </div>
                </td>
                <td>{datasource.kpi_count || '-'}</td>
                <td className="date-formated">
                  {formatDate(datasource.last_sync)}
                </td>
                <td className="date-formated">
                  {formatDate(datasource.created_at)}
                </td>
                <td>
                  <div className="table-actions">
                    <Link to="/datasource/edit">
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
                    </Link>
                    <div
                      className="table-action-icon"
                      data-bs-toggle="tooltip"
                      data-bs-placement="bottom"
                      title="Delete"
                      onClick={() => {
                        setIsOpen(true);
                        setData(datasource);
                      }}>
                      <img
                        src={Delete}
                        alt="Delete"
                        className="action-normal"
                      />
                      <img
                        src={DeleteActive}
                        alt="Delete"
                        className="action-active"
                      />
                    </div>
                    <Link to="/alerts">
                      <div
                        className="table-action-icon"
                        data-bs-toggle="tooltip"
                        data-bs-placement="bottom"
                        title="Add Alert">
                        <img
                          src={Alert}
                          alt="Alert"
                          className="action-normal"
                        />
                        <img
                          src={AlertActive}
                          alt="Alert"
                          className="action-active"
                        />
                      </div>
                    </Link>
                  </div>
                </td>
              </tr>
            );
          })
        ) : (
          <tr className="empty-table">
            <td colSpan={7}>No Data Found</td>
          </tr>
        )}
      </tbody>
      <Modal isOpen={isOpen} shouldCloseOnOverlayClick={false}>
        <div className="modal-close">
          <img src={Close} alt="Close" onClick={closeModal} />
        </div>
        <div className="modal-body">
          <div className="modal-contents">
            <h3>Delete {data.name} ?</h3>
            <p>Are you sure you want to delete </p>
            <div className="next-step-navigate">
              <button className="btn white-button" onClick={closeModal}>
                <span>Cancel</span>
              </button>
              <button
                className="btn black-button"
                onClick={() => onDelete(data)}>
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </table>
  );
};
export default DataSourceTable;
