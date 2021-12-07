import React from 'react';

import Search from '../../assets/images/search.svg';
import Dropdown from '../../assets/images/dropdownlist.svg';
import Fuse from 'fuse.js';
import './homefilter.scss';
import { useState } from 'react';

const Homefilter = ({ data }) => {
  const [filterData, setFilterData] = useState(data);

  const onSearch = (event) => {
    if (event.target.value === '') {
      setFilterData(data);
    } else {
      const options = {
        keys: ['name']
      };

      const fuse = new Fuse(data, options);

      const result = fuse.search(event.target.value);
      setFilterData(
        result.map((item) => {
          return item.item;
        })
      );
    }
  };

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
              onChange={(e) => onSearch(e)}
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
          {filterData && filterData.length !== 0 ? (
            filterData.map((item) => {
              return (
                <li>
                  {item.name} <span>{item.kpi_count}</span>
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
