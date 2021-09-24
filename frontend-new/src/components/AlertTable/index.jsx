import React, { useEffect } from 'react';

import { Link } from 'react-router-dom';

// import Modal from 'react-modal';

import '../../assets/styles/table.scss';
import './alerttable.scss';

import Slack from '../../assets/images/table/slack.svg';
import Asana from '../../assets/images/table/asana.svg';
import Datadog from '../../assets/images/table/datadog.svg';
import Email from '../../assets/images/table/email.svg';
import Noresult from '../Noresult';
import More from '../../assets/images/more.svg';
import Moreactive from '../../assets/images/more-active.svg';
import Edit from '../../assets/images/edit.svg';
import EditActive from '../../assets/images/datasourceedit-active.svg';
// import DeleteActive from '../../assets/images/delete-active.svg';
// import Close from '../../assets/images/close.svg';

import { useDispatch, useSelector } from 'react-redux';

import { formatDate } from '../../utils/date-helper';
// import { kpiAlertDisable } from '../../redux/actions';

import { toastMessage } from '../../utils/toast-helper';

import store from '../../redux/store';

const RESET_ACTION = {
  type: 'RESET_ALERT_DATA_Data'
};

const AlertTable = ({ alertData, alertSearch, changeData }) => {
  const dispatch = useDispatch();

  // const [isOpen, setIsOpen] = useState(false);
  // const [data, setData] = useState('');

  // const closeModal = () => {
  //   setIsOpen(false);
  // };
  const { kpiAlertDisableData } = useSelector((state) => {
    return state.alert;
  });

  // const onDelete = (id) => {
  //   dispatch(kpiAlertDisable(id));
  // };
  useEffect(() => {
    store.dispatch(RESET_ACTION);
  }, [dispatch]);

  useEffect(() => {
    if (kpiAlertDisableData && kpiAlertDisableData.status === 'success') {
      // setIsOpen(false);
      changeData((prev) => !prev);
      toastMessage({ type: 'success', message: kpiAlertDisableData.message });
    } else if (kpiAlertDisableData && kpiAlertDisableData === 'failure') {
      toastMessage({ type: 'error', message: kpiAlertDisableData.message });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kpiAlertDisableData]);

  return (
    <div className="table-responsive">
      <table className="table">
        <thead>
          <tr>
            <th>Alert Name</th>
            <th>Alert Type</th>
            <th>Last Modified</th>
            <th>Status</th>
            {/* <th className="cursor-pointer">
              Triggered */}
            {/* <img src={Rectangle} alt="down arrow" /> */}
            {/* </th> */}
            <th>Channel</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {alertData && alertData.length !== 0
            ? alertData.map((alert) => {
                return (
                  <tr>
                    <td>{alert.alert_name || '-'}</td>
                    <td className="date-column-formated">
                      {alert.alert_type || '-'}
                    </td>
                    <td className="date-column-formated">
                      {formatDate(alert.last_sync) || '-'}
                    </td>
                    <td>
                      <div className="alert-status">
                        <label>{alert.active ? 'Active' : 'InActive'}</label>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="removeoverlap"
                            defaultChecked={alert.active}
                          />
                        </div>
                      </div>
                    </td>
                    {/* <td>{alert.severity_cutoff_score || '-'}</td> */}
                    <td>
                      <div className="table-actions">
                        <div className="table-action-icon">
                          <img
                            src={
                              alert.alert_channel === 'slack'
                                ? Slack
                                : alert.alert_channel === 'email'
                                ? Email
                                : alert.alert_channel === 'asana'
                                ? Asana
                                : Datadog
                            }
                            alt={alert.alert_channel}
                          />
                        </div>
                      </div>
                    </td>
                    <td>
                      <div
                        className={
                          alertData.length !== 1
                            ? ' more-dropdown dropdown '
                            : ' more-dropdown '
                        }>
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
                          <Link to={`/alerts/edit/kpi-alert/${alert.id}`}>
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
                          {/* <li
                          className="delete-item"
                          onClick={() => {
                            setIsOpen(true);
                            setData(alert);
                          }}>
                          <img src={DeleteActive} alt="Delete" />
                          Delete
                        </li> */}
                        </ul>
                      </div>
                    </td>
                  </tr>
                );
              })
            : alertData !== '' && (
                <tr className="empty-table">
                  <td colSpan={6}>
                    <Noresult text={alertSearch} title="Alerts" />
                  </td>
                </tr>
              )}
        </tbody>
      </table>
      {/* <Modal
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
                onClick={() => onDelete(data.id)}>
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      </Modal> */}
    </div>
  );
};

export default AlertTable;
