import React from 'react';

import '../../assets/styles/table.scss';
import './alerttable.scss';

import Slack from '../../assets/images/table/slack.svg';
import Asana from '../../assets/images/table/asana.svg';
import Datadog from '../../assets/images/table/datadog.svg';
import Rectangle from '../../assets/images/table/downarrow.svg';

const AlertTable = () => {
  return (
    <table className="table">
      <thead>
        <tr>
          <th>Alert Name</th>
          <th>Alert Type</th>
          <th>
            Last Modified <img src={Rectangle} alt="down arrow" />
          </th>
          <th>Status</th>
          <th>
            Triggered <img src={Rectangle} alt="down arrow" />
          </th>
          <th>Channel</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Changes In DAU's</td>
          <td>KPI Based</td>
          <td className="date-contained">12/06/2021</td>
          <td>
            <div className="alert-status">
              <label>Active</label>
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="removeoverlap"
                />
              </div>
            </div>
          </td>
          <td>22</td>
          <td>
            <div className="table-actions">
              <div className="table-action-icon">
                <img src={Slack} alt="slack" />
              </div>
            </div>
          </td>
        </tr>
        <tr>
          <td>Changes In DAU's</td>
          <td>KPI Based</td>
          <td className="date-contained">12/06/2021</td>
          <td>
            <div className="alert-status">
              <label>Active</label>
              <div className="form-check form-switch ">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="removeoverlap"
                />
              </div>
            </div>
          </td>
          <td>22</td>
          <td>
            <div className="table-actions">
              <div className="table-action-icon">
                <img src={Slack} alt="slack" />
              </div>
              <div className="table-action-icon">
                <img src={Datadog} alt="data dog" />
              </div>
            </div>
          </td>
        </tr>
        <tr>
          <td>Anamoly Detected</td>
          <td>Event Based</td>
          <td className="date-contained">12/06/2021</td>
          <td>
            <div className="alert-status">
              <label>InActive</label>
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="removeoverlap"
                />
              </div>
            </div>
          </td>
          <td>16</td>
          <td>
            <div className="table-actions">
              <div className="table-action-icon">
                <img src={Slack} alt="" />
              </div>
            </div>
          </td>
        </tr>
        <tr>
          <td>Changes In DAU's</td>
          <td>KPI Based</td>
          <td className="date-contained">12/06/2021</td>
          <td>
            <div className="alert-status">
              <label>Active</label>
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="removeoverlap"
                />
              </div>
            </div>
          </td>
          <td>22</td>
          <td>
            <div className="table-actions">
              <div className="table-action-icon">
                <img src={Slack} alt="" />
              </div>
            </div>
          </td>
        </tr>
        <tr>
          <td>Changes In DAU's</td>
          <td>Event Based</td>
          <td className="date-contained">12/06/2021</td>
          <td>
            <div className="alert-status">
              <label>Active</label>
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="removeoverlap"
                />
              </div>
            </div>
          </td>
          <td>22</td>
          <td>
            <div className="table-actions">
              <div className="table-action-icon">
                <img src={Slack} alt="" />
              </div>

              <div className="table-action-icon">
                <img src={Asana} alt="" />
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  );
};

export default AlertTable;
