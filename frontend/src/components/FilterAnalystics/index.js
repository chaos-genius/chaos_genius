import React, { useState, useEffect } from 'react';

import Tooltip from 'react-tooltip-lite';
import Search from '../../assets/images/search.svg';
import GreenArrow from '../../assets/images/green-arrow.svg';

import Fuse from 'fuse.js';

import { v4 as uuidv4 } from 'uuid';
import { useParams } from 'react-router-dom';

const FilterAnalystics = ({ kpi, setKpi, data, onboarding }) => {
  const [listData, setListData] = useState(data);
  const [searchData, setSearchData] = useState(data);
  const dashboard = useParams().dashboard;

  console.log(listData);
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
  const handleClick = (item) => {
    setKpi(item.id);
    if (!onboarding) {
      window.history.pushState(
        '',
        '',
        `/#/dashboard/${dashboard}/settings/${item.id}`
      );
    }
  };
  return (
    <div className="common-filter-section">
      <div className="filter-layout">
        {searchData && <h3>List of KPI's ({searchData.length})</h3>}
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
                <li
                  key={uuidv4()}
                  className={
                    kpi.toString() === item.id.toString() ? 'active' : ''
                  }
                  onClick={() => {
                    handleClick(item);
                  }}>
                  <div className="filter-tooltipcontent">
                    <Tooltip
                      className="tooltip-name"
                      direction="right"
                      content={<span> {item.name}</span>}>
                      <label className="name-tooltip">{item.name}</label>
                    </Tooltip>
                  </div>
                  <img src={GreenArrow} alt="Arrow" />
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

export default FilterAnalystics;
