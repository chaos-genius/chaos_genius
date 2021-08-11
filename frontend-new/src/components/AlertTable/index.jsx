import React from 'react';

import { Link } from 'react-router-dom';

import Slack from '../../assets/images/table/slack.svg';
import Rectangle from '../../assets/images/table/downarrow.svg';

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
                <div className="table-action-icon">
                  <img src={Slack} alt="slack" className="action-normal" />
                </div>
              </Link>
            </div>
          </td>
        </tr>
        <tr>
          <td>Anamoly Detected</td>
          <td>Event Based</td>
          <td>12/06/2021</td>
          <td>
            <div className="alert-status">
              <label>InActive</label>
              <div className="form-check form-switch overlap-check">
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
              <Link>
                <div className="table-action-icon">
                  <img src={Slack} alt="" className="action-normal" />
                </div>
              </Link>
            </div>
          </td>
        </tr>
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
                <div className="table-action-icon">
                  <img src={Slack} alt="" className="action-normal" />
                </div>
              </Link>
            </div>
          </td>
        </tr>
        <tr>
          <td>Changes In DAU's</td>
          <td>Event Based</td>
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
                <div className="table-action-icon">
                  <img src={Slack} alt="" className="action-normal" />
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
