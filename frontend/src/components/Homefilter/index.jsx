import React from 'react';

import Search from '../../assets/images/search.svg';
import Dropdown from '../../assets/images/dropdownlist.svg';

import './homefilter.scss';

const Homefilter = ({ data }) => {
  return (
    <div className="common-filter-section">
      <div className="filter-layout">
        <h3>Dashboards</h3>
        <div className="filter-form-dropdown">
          <div className="form-group icon search-filter">
            <input
              type="text"
              className="form-control h-40"
              placeholder="Search Dashboard"
            />
            <span>
              <img src={Search} alt="Search Icon" />
            </span>
          </div>
          <div className="filter-dropdown more-dropdown dropdown">
            <div
              className="filter-dropdown-image"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              aria-haspopup="true">
              <img src={Dropdown} alt="List" />
            </div>{' '}
            <ul className="dropdown-menu">
              <li>Alphabetical</li>
              <li>Recently added</li>
              <li>No of KPI’s</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="filter-layout filter-tab filter-scrollable">
        <ul>
          <li className="active">
            Marketing <span>42</span>
          </li>
          <li>
            Revenue <span>12</span>
          </li>
          {data && data.length !== 0 ? (
            data.map((item) => {
              return (
                <li>
                  {item.name} <span>{item.id}</span>
                </li>
              );
            })
          ) : (
            <div className="empty-content">No Data Found</div>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Homefilter;
