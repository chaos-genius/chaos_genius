import React from 'react';

import '../../assets/styles/table.scss';
import './alerttable.scss';

import Slack from '../../assets/images/table/slack.svg';
import Asana from '../../assets/images/table/asana.svg';
import Datadog from '../../assets/images/table/datadog.svg';
import Rectangle from '../../assets/images/table/downarrow.svg';
import Email from '../../assets/images/table/gmail.svg';
import Noresult from '../Noresult';
import More from '../../assets/images/more.svg';
import Moreactive from '../../assets/images/more-active.svg';
import Edit from '../../assets/images/edit.svg';
import EditActive from '../../assets/images/datasourceedit-active.svg';
import DeleteActive from '../../assets/images/delete-active.svg';

import { formatDate } from '../../utils/date-helper';

const AlertTable = ({ alertData, alertSearch }) => {
  return (
    <div className="table-responsive">
      <table className="table">
        <thead>
          <tr>
            <th>Alert Name</th>
            <th>Alert Type</th>
            <th>Last Modified</th>
            <th>Status</th>
            <th className="cursor-pointer">
              Triggered <img src={Rectangle} alt="down arrow" />
            </th>
            <th>Channel</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {alertData && alertData.length !== 0 ? (
            alertData.map((alert) => {
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
                      <label>Active</label>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="removeoverlap"
                          checked={alert.active}
                        />
                      </div>
                    </div>
                  </td>
                  <td>{alert.severity_cutoff_score || '-'}</td>
                  <td>
                    <div className="table-actions">
                      <div className="table-action-icon">
                        <img
                          src={
                            alert.alert_alert_channel === 'slack'
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
                    <div className="more-dropdown">
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

                        <li className="delete-item" onClick={() => {}}>
                          <img src={DeleteActive} alt="Delete" />
                          Delete
                        </li>
                      </ul>
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr className="empty-table">
              <td colSpan={6}>
                <Noresult text={alertSearch} title="Alerts" />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AlertTable;
