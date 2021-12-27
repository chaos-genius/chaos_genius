import React, { useState, useEffect, useContext } from 'react';

import { Link } from 'react-router-dom';
import Modal from 'react-modal';
import Tooltip from 'react-tooltip-lite';
import Noresult from '../Noresult';

import Edit from '../../assets/images/edit.svg';
import EditActive from '../../assets/images/datasourceedit-active.svg';
import Alert from '../../assets/images/alert.svg';
import AlertActive from '../../assets/images/alert-active.svg';
import DeleteActive from '../../assets/images/delete-active.svg';
import Close from '../../assets/images/close.svg';
import More from '../../assets/images/more.svg';
import Moreactive from '../../assets/images/more-active.svg';
import { CustomContent, CustomActions } from '../../utils/toast-helper';
// import Viewlog from '../../assets/images/viewlog.svg';
// import ViewlogActive from '../../assets/images/viewlog-active.svg';

import '../../assets/styles/table.scss';
import '../Modal/modal.scss';
import './datasourcetable.scss';

import { formatDateTime } from '../../utils/date-helper';

import { deleteDatasource } from '../../redux/actions';

import { useDispatch, useSelector } from 'react-redux';

import { v4 as uuidv4 } from 'uuid';
import { useToast } from 'react-toast-wnm';
import { connectionContext } from '../context';

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
    dispatch(deleteDatasource(payload, customToast));
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
            <th>Status</th>
            <th>Data Source Type</th>
            <th>No of KPIs</th>
            <th>Last Sync</th>
            <th>Created On</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {tableData && tableData.length !== 0
            ? tableData.map((datasource) => {
                return (
                  <tr key={uuidv4()}>
                    <td className="name-tooltip">
                      <Tooltip
                        className="tooltip-name"
                        direction="right"
                        content={<span>{datasource.name}</span>}>
                        <span>{datasource.name}</span>
                      </Tooltip>
                    </td>
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
                        {connectionType
                          ? datasourceIcon(datasource.connection_type)
                          : '-'}
                      </div>
                    </td>
                    <td>{datasource.kpi_count || '-'}</td>
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
                          {/* <li>
                          <img
                            src={Viewlog}
                            alt="View Log"
                            className="action-disable"
                          />
                          <img
                            src={ViewlogActive}
                            alt="View Log"
                            className="action-active"
                          />
                          View Logs
                        </li> */}
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
