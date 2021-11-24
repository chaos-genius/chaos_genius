import React from 'react';

import More from '../../assets/images/more.svg';
import Moreactive from '../../assets/images/more-active.svg';
import Edit from '../../assets/images/edit.svg';
import EditActive from '../../assets/images/datasourceedit-active.svg';
import DeleteActive from '../../assets/images/delete-active.svg';

import './dashboardcards.scss';
import { formatDate } from '../../utils/date-helper';

const Dashboardcards = ({ dashboardList }) => {
  return (
    <div className="dashboard-card-container">
      {dashboardList &&
        dashboardList.map((dashboard) => {
          return (
            <div className="dashboardcard">
              <div className="header-card">
                <div className="header-content">
                  <h3>{dashboard.name}</h3>
                  <span>
                    Last modified: {formatDate(dashboard?.last_modified)}
                  </span>
                </div>
                <div className="more-dropdown dropstart">
                  <div
                    data-bs-toggle="dropdown"
                    className="dropdown-image"
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
                      <img src={Edit} alt="Edit" className="action-disable" />
                      <img
                        src={EditActive}
                        alt="Edit"
                        className="action-active"
                      />
                      Edit
                    </li>
                    <li className="delete-item">
                      <img src={DeleteActive} alt="Delete" />
                      Delete
                    </li>
                  </ul>
                </div>
              </div>
              <div className="body-card">
                <div className="body-content">
                  <span>No of KPI’s</span>
                  <h5>{dashboard.kpi_count}</h5>
                </div>
                <div className="body-content created-on-content">
                  <span>Created On</span>
                  <h5>{formatDate(dashboard?.created_at)}</h5>
                </div>
              </div>
            </div>
          );
        })}
    </div>
  );
};
export default Dashboardcards;
