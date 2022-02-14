import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Modal from 'react-modal';
import { useDispatch } from 'react-redux';

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
import DeleteActive from '../../assets/images/delete-active.svg';
import Close from '../../assets/images/close.svg';
import { formatDateTime } from '../../utils/date-helper';

import store from '../../redux/store';
import {
  kpiAlertDisable,
  kpiAlertEnable,
  kpiAlertDeleteById
} from '../../redux/actions';
import { CustomTooltip } from '../../utils/tooltip-helper';

const RESET_ENABLE_DISABLE_DATA = {
  type: 'RESET_ENABLE_DISABLE_DATA'
};

const RESET_DELETE_DATA = {
  type: 'RESET_DELETE_DATA'
};

const AlertTable = ({ alertData, alertSearch }) => {
  const dispatch = useDispatch();

  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState({});

  const closeModal = () => {
    setIsOpen(false);
  };

  const onDelete = (data) => {
    setData(data);
    setIsOpen(true);
  };

  const onDeleteConfirmation = (id) => {
    store.dispatch(RESET_DELETE_DATA);
    dispatch(kpiAlertDeleteById(id));
    setIsOpen(false);
  };

  const onChecking = (alert) => {
    store.dispatch(RESET_ENABLE_DISABLE_DATA);
    store.dispatch({
      type: 'CHANGING_ALERT',
      data: { id: alert?.id, toggle: alert?.active }
    });
    if (alert.active === true) {
      onDisable(alert.id);
    } else if (alert.active === false) {
      onEnable(alert.id);
    }
  };

  const onDisable = (id) => {
    dispatch(kpiAlertDisable(id));
  };

  const onEnable = (id) => {
    dispatch(kpiAlertEnable(id));
  };

  return (
    <>
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
                    <td className="name-tooltip">
                      <span>{CustomTooltip(alert.alert_name)}</span>
                    </td>

                    <td className="date-column-formated">
                      {alert.alert_type || '-'}
                    </td>
                    <td className="date-column-formated">
                      {formatDateTime(alert.created_at, true) || '-'}
                    </td>
                    <td>
                      <div className="alert-status">
                        <label>{alert.active ? 'Active' : 'Inactive'}</label>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="removeoverlap"
                            checked={alert.active}
                            onChange={() => onChecking(alert)}
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
                        <ul className="dropdown-menu ">
                          <Link
                            to={
                              alert.alert_type === 'KPI Alert'
                                ? `/alerts/edit/kpi-alert/${alert.id}`
                                : `/alerts/edit/event-alert/${alert.id}`
                            }>
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
                            onClick={() => onDelete(alert)}>
                            <img src={DeleteActive} alt="Delete" />
                            Delete
                          </li>
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
                onClick={() => onDeleteConfirmation(data.id)}>
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AlertTable;
