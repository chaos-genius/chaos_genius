import React, { useState, useEffect, useContext } from 'react';

import { Link } from 'react-router-dom';
import Modal from 'react-modal';
import Noresult from '../Noresult';

import Edit from '../../assets/images/edit.svg';
import EditActive from '../../assets/images/datasourceedit-active.svg';
import Alert from '../../assets/images/alert.svg';
import AlertActive from '../../assets/images/alert-active.svg';
import DeleteActive from '../../assets/images/delete-active.svg';
import Close from '../../assets/images/close.svg';
import More from '../../assets/images/more.svg';
import Sync from '../../assets/images/sync.svg';
import Moreactive from '../../assets/images/more-active.svg';
import { CustomContent, CustomActions } from '../../utils/toast-helper';
// import Viewlog from '../../assets/images/viewlog.svg';
// import ViewlogActive from '../../assets/images/viewlog-active.svg';

import '../../assets/styles/table.scss';
import '../Modal/modal.scss';
import './datasourcetable.scss';

import { formatDateTime } from '../../utils/date-helper';

import { deleteDatasource, setSyncSchema } from '../../redux/actions';

import { useDispatch, useSelector } from 'react-redux';

import { v4 as uuidv4 } from 'uuid';
import { useToast } from 'react-toast-wnm';
import { connectionContext } from '../context';
import { CustomTooltip } from '../../utils/tooltip-helper';

const DataSourceTable = ({ tableData, changeData, search }) => {
  const dispatch = useDispatch();
  const connectionType = useContext(connectionContext);
  const toast = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState('');

  const { deleteDataSourceResponse } = useSelector((state) => state.dataSource);

  const closeModal = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    if (deleteDataSourceResponse && deleteDataSourceResponse.status) {
      customToast({
        type: 'success',
        header: 'Data source deleted successfully.',
        description: deleteDataSourceResponse.msg
      });
      changeData((prev) => !prev);
    } else if (
      deleteDataSourceResponse &&
      deleteDataSourceResponse.status === false
    ) {
      customToast({
        type: 'error',
        header: 'Failed to Delete',
        description: deleteDataSourceResponse.msg
      });
    }
    setIsOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [changeData, deleteDataSourceResponse]);

  const onDelete = (datasource) => {
    const payload = {
      data_source_id: datasource.id
    };
    dispatch(deleteDatasource(payload));
  };

  const datasourceIcon = (type) => {
    let textHtml = '';
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

  const handleSync = (datasource) => {
    dispatch(setSyncSchema(datasource));
  };

  const customToast = (data) => {
    const { type, header, description } = data;
    toast({
      autoDismiss: true,
      enableAnimation: true,
      delay: type === 'success' ? '5000' : '30000',
      backgroundColor: type === 'success' ? '#effaf5' : '#FEF6F5',
      borderRadius: '6px',
      color: '#222222',
      position: 'bottom-right',
      minWidth: '240px',
      width: 'auto',
      boxShadow: '4px 6px 32px -2px rgba(226, 226, 234, 0.24)',
      padding: '17px 14px',
      height: 'auto',
      border: type === 'success' ? '1px solid #60ca9a' : '1px solid #FEF6F5',
      type: type,
      actions: <CustomActions />,
      content: (
        <CustomContent
          header={header}
          description={description}
          failed={type === 'success' ? false : true}
        />
      )
    });
  };

  return (
    <>
      <table className="table">
        <thead>
          <tr>
            <th>Data Connection Name</th>
            <th>Data Source Type</th>
            <th>No of KPIs</th>
            <th>Status</th>
            <th>Last Sync</th>
            <th>Created On</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {tableData && tableData.length !== 0
            ? tableData.map((datasource) => {
                const dataSourceStatusObj = {
                  className: 'live-status',
                  status: 'Live'
                };
                if (!datasource?.is_third_party) {
                  if (datasource?.sync_status) {
                    if (datasource.sync_status === 'Completed') {
                      dataSourceStatusObj.className = 'live-status';
                      dataSourceStatusObj.status = 'Live';
                    } else if (datasource.sync_status === 'In Progress') {
                      dataSourceStatusObj.className = 'in-progress-status';
                      dataSourceStatusObj.status = 'In Progress';
                    } else {
                      dataSourceStatusObj.className = 'broken-status';
                      dataSourceStatusObj.status = 'Broken';
                    }
                  } else {
                    dataSourceStatusObj.className = 'broken-status';
                    dataSourceStatusObj.status = 'Broken';
                  }
                } else {
                  dataSourceStatusObj.className =
                    datasource?.active === true
                      ? 'live-status'
                      : 'broken-status';
                  dataSourceStatusObj.status =
                    datasource?.active === true ? 'Live' : 'Broken';
                }
                return (
                  <tr key={uuidv4()}>
                    <td className="name-tooltip">
                      <span>{CustomTooltip(datasource.name)}</span>
                    </td>
                    <td>
                      <div className="source-type">
                        {connectionType
                          ? datasourceIcon(datasource.connection_type)
                          : '-'}
                      </div>
                    </td>
                    <td>{datasource.kpi_count || '-'}</td>
                    <td>
                      <div className={dataSourceStatusObj.className}>
                        <span>{dataSourceStatusObj.status}</span>
                      </div>
                    </td>
                    <td className="date-column-formated">
                      {formatDateTime(datasource.last_sync, true)}
                    </td>
                    <td className="date-column-formated">
                      {formatDateTime(datasource.created_at, true)}
                    </td>
                    <td>
                      {/* dropdown */}
                      <div className={' more-dropdown dropdown '}>
                        <div
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                          aria-haspopup="true">
                          <img
                            src={More}
                            alt="More"
                            className="moreoption"
                            data-bs-toggle="tooltip"
                            data-bs-placement="bottom"
                            title="Actions"
                          />
                          <img
                            src={Moreactive}
                            alt="More"
                            className="moreoption-active"
                            data-bs-toggle="tooltip"
                            data-bs-placement="bottom"
                            title="Actions"
                          />
                        </div>
                        <ul className="dropdown-menu">
                          <Link to="/alerts">
                            <li>
                              <img
                                src={Alert}
                                alt="Alert"
                                className="action-disable"
                              />
                              <img
                                src={AlertActive}
                                alt="Alert"
                                className="action-active"
                              />
                              Set Alerts
                            </li>
                          </Link>
                          {datasource && !datasource?.is_third_party && (
                            <li
                              onClick={() => {
                                handleSync(datasource);
                              }}>
                              <img src={Sync} alt="Sync Schema" />
                              Sync Schema
                            </li>
                          )}
                          <Link to={`/datasource/edit/${datasource.id}`}>
                            <li>
                              <img
                                src={Edit}
                                alt="Edit"
                                className="action-disable"
                              />
                              <img
                                src={EditActive}
                                alt="Edit"
                                className="action-active"
                              />
                              Edit
                            </li>
                          </Link>

                          <li
                            className="delete-item"
                            onClick={() => {
                              setIsOpen(true);
                              setData(datasource);
                            }}>
                            <img src={DeleteActive} alt="Delete" />
                            Delete
                          </li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                );
              })
            : tableData &&
              tableData !== '' && (
                <tr className="empty-table">
                  <td colSpan={7}>
                    <Noresult text={search} title="Data source" />
                  </td>
                </tr>
              )}
        </tbody>
      </table>

      <Modal
        portalClassName="deletemodal"
        isOpen={isOpen}
        shouldCloseOnOverlayClick={false}
        className="deleteModal">
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
    </>
  );
};
export default DataSourceTable;
