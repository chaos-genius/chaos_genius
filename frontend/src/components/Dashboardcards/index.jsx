import React from 'react';

import More from '../../assets/images/more.svg';
import Moreactive from '../../assets/images/more-active.svg';
import Edit from '../../assets/images/edit.svg';
import EditActive from '../../assets/images/datasourceedit-active.svg';
import DeleteActive from '../../assets/images/delete-active.svg';

import './dashboardcards.scss';

const Dashboardcards = () => {
  return (
    <div className="dashboard-card-container">
      <div className="dashboardcard">
        <div className="header-card">
          <div className="header-content">
            <h3>Ecommerce</h3>
            <span>Last modified: 12 Oct, 2021</span>
          </div>
          <div className="more-dropdown dropstart">
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
                <img src={Edit} alt="Edit" className="action-disable" />
                <img src={EditActive} alt="Edit" className="action-active" />
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
            <h5>24</h5>
          </div>
          <div className="body-content created-on-content">
            <span>Created On</span>
            <h5>09 Oct, 2021</h5>
          </div>
        </div>
      </div>
      <div className="dashboardcard">
        <div className="header-card">
          <div className="header-content">
            <h3>Marketing</h3>
            <span>Last modified: 11 Oct, 2021</span>
          </div>
          <div className="more-dropdown dropstart">
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
                <img src={Edit} alt="Edit" className="action-disable" />
                <img src={EditActive} alt="Edit" className="action-active" />
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
            <h5>32</h5>
          </div>
          <div className="body-content created-on-content">
            <span>Created On</span>
            <h5>09 Oct, 2021</h5>
          </div>
        </div>
      </div>
      <div className="dashboardcard">
        <div className="header-card">
          <div className="header-content">
            <h3>Finance</h3>
            <span>Last modified: 10 Oct, 2021</span>
          </div>
          <div className="more-dropdown dropstart">
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
                <img src={Edit} alt="Edit" className="action-disable" />
                <img src={EditActive} alt="Edit" className="action-active" />
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
            <h5>40</h5>
          </div>
          <div className="body-content created-on-content">
            <span>Created On</span>
            <h5>02 Oct, 2021</h5>
          </div>
        </div>
      </div>
      <div className="dashboardcard">
        <div className="header-card">
          <div className="header-content">
            <h3>Customer Service</h3>
            <span>Last modified: 10 Oct, 2021</span>
          </div>
          <div className="more-dropdown dropstart">
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
                <img src={Edit} alt="Edit" className="action-disable" />
                <img src={EditActive} alt="Edit" className="action-active" />
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
          <div className="body-content created-on-content">
            <span>No of KPI’s</span>
            <h5>19</h5>
          </div>
          <div className="body-content">
            <span>Created On</span>
            <h5>25 Sep, 2021</h5>
          </div>
        </div>
      </div>
      <div className="dashboardcard">
        <div className="header-card">
          <div className="header-content">
            <h3>Revenue</h3>
            <span>Last modified: 10 Oct, 2021</span>
          </div>
          <div className="more-dropdown dropstart">
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
                <img src={Edit} alt="Edit" className="action-disable" />
                <img src={EditActive} alt="Edit" className="action-active" />
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
          <div className="body-content created-on-content">
            <span>No of KPI’s</span>
            <h5>24</h5>
          </div>
          <div className="body-content">
            <span>Created On</span>
            <h5>25 Sep, 2021</h5>
          </div>
        </div>
      </div>
      <div className="dashboardcard">
        <div className="header-card">
          <div className="header-content">
            <h3>Sales</h3>
            <span>Last modified: 10 Oct, 2021</span>
          </div>
          <div className="more-dropdown dropstart">
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
                <img src={Edit} alt="Edit" className="action-disable" />
                <img src={EditActive} alt="Edit" className="action-active" />
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
            <h5>33</h5>
          </div>
          <div className="body-content created-on-content">
            <span>Created On</span>
            <h5>20 Sep, 2021</h5>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Dashboardcards;
