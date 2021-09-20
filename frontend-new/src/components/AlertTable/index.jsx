import React from 'react';

import '../../assets/styles/table.scss';
import './alerttable.scss';

import Slack from '../../assets/images/table/slack.svg';
import Asana from '../../assets/images/table/asana.svg';
import Datadog from '../../assets/images/table/datadog.svg';
import Rectangle from '../../assets/images/table/downarrow.svg';
import Email from '../../assets/images/table/gmail.svg';
import Noresult from '../Noresult';
import { formatDate } from '../../utils/date-helper';

const AlertTable = ({ alertData, alertSearch }) => {
  return (
    <div class="table-responsive">
      {' '}
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
                          checked={alert.active || false}
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
