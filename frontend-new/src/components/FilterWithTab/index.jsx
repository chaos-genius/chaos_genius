import React, { useEffect, useState } from 'react';

import { Link } from 'react-router-dom';

import Search from '../../assets/images/search.svg';
import GreenArrow from '../../assets/images/green-arrow.svg';

import Fuse from 'fuse.js';

import { v4 as uuidv4 } from 'uuid';

const DashboardFilter = ({ setKpi, data, active, setActive }) => {
  //const [active, setActive] = useState('');
  const [listData, setListData] = useState(data);
  const [searchData, setSearchData] = useState(data);
  useEffect(() => {
    if (data) {
      setListData(data);
      setSearchData(data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);
  const onSearch = (e) => {
    if (e.target.value) {
      const options = {
        keys: ['name']
      };
      const fuse = new Fuse(listData, options);
      const result = fuse.search(e.target.value);
      setListData(
        result.map((item) => {
          return item.item;
        })
      );
    } else {
      setListData(searchData);
    }
  };
  return (
    <div className="common-filter-section">
      <div className="filter-layout">
        {searchData && <h3>List of KPI’s ({searchData.length})</h3>}
        <div className="form-group icon search-filter">
          <input
            type="text"
            className="form-control h-40"
            placeholder="Search KPI"
            onChange={(e) => onSearch(e)}
          />
          <span>
            <img src={Search} alt="Search Icon" />
          </span>
        </div>
      </div>
      <div className="filter-layout filter-tab">
        <ul>
          {listData && listData.length !== 0 ? (
            listData.map((item) => {
              return (
                <Link to={`/dashboard/autorca/${item.name}`}>
                  <li
                    key={uuidv4()}
                    className={active === item.name ? 'active' : ''}
                    onClick={() => {
                      setActive(item.name);
                      setKpi(item.id);
                    }}>
                    {item.name}
                    <img src={GreenArrow} alt="GreenArrow Icon" />
                  </li>
                </Link>
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

export default DashboardFilter;
