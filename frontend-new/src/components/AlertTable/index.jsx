import React from 'react';

import { Link } from 'react-router-dom';

import Slack from '../../assets/images/slack.svg';
import Rectangle from '../../assets/images/rectangle.svg';

import '../../assets/styles/table.scss';
import './alerttable.scss';

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
          <td>12/06/2021</td>
          <td>
            <div className="alert-status">
              <label>Active</label>
              <div className="form-check form-switch overlap-check">
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
              <Link>
                <div
                  className="table-action-icon"
                  data-bs-toggle="tooltip"
                  data-bs-placement="bottom"
                  title="Slack">
                  <img src={Slack} alt="Edit" className="action-normal" />
                </div>
              </Link>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  );
};

export default AlertTable;
