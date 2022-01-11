import React from 'react';

import Search from '../../assets/images/search.svg';
import Dropdown from '../../assets/images/dropdownlist.svg';
import Fuse from 'fuse.js';
import './homefilter.scss';
import { useState } from 'react';
import { formatDateTime } from '../../utils/date-helper';
import { CustomTooltip } from '../../utils/tooltip-helper';

const Homefilter = ({ data, setDashboard, dashboard }) => {
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

  const onSort = (type) => {
    let value = data.sort(function (a, b) {
      if (type === 'alpha') {
        return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
      } else if (type === 'recent') {
        return formatDateTime(b.created_at) - formatDateTime(a.created_at);
      } else if (type === 'kpi') {
        return a.kpis.length < b.kpis.length
          ? -1
          : a.kpis.length > b.kpis.length
          ? 1
          : 0;
      } else {
        return [];
      }
    });
    setFilterData([...value]);
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
              <li onClick={() => onSort('alpha')}>Alphabetical</li>
              <li onClick={() => onSort('recent')}>Recently Modified</li>
              <li onClick={() => onSort('kpi')}>No of KPI’s</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="filter-layout filter-tab filter-scrollable">
        <ul>
          {filterData && filterData.length !== 0 ? (
            filterData.map((item) => {
              return (
                <li
                  className={dashboard === item.id ? 'active' : ''}
                  onClick={() => {
                    setDashboard(item.id);
                  }}>
                  <div className="filter-tooltipcontent">
                    {CustomTooltip(item.name)}
                  </div>
                  <span>{item?.kpis.length}</span>
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
