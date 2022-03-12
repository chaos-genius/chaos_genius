import React, { useEffect, useState } from 'react';

import { useHistory } from 'react-router-dom';
import Search from '../../assets/images/search.svg';
import GreenArrow from '../../assets/images/green-arrow.svg';

import Fuse from 'fuse.js';

import { v4 as uuidv4 } from 'uuid';

import store from '../../redux/store';
import { CustomTooltip } from '../../utils/tooltip-helper';
import { debuncerReturn } from '../../utils/simple-debouncer';

const RESET = {
  type: 'RESET_DATA'
};

const RESET_DATA = {
  type: 'RESET_CONFIG'
};
const RESET_AGGREGATION = {
  type: 'RESET_AGGREGATION'
};
const RESET_LINECHART = {
  type: 'RESET_LINECHART'
};
const RESET_HIERARCHIAL_DATA = {
  type: 'RESET_HIERARCHIAL_DATA'
};
const DashboardFilter = ({ kpi, data, setActive, tabs, dashboard }) => {
  const history = useHistory();
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

  const handleClick = (item) => {
    if (item.id.toString() !== kpi.toString()) {
      store.dispatch(RESET_AGGREGATION);
      store.dispatch(RESET_LINECHART);
      store.dispatch(RESET_HIERARCHIAL_DATA);
      store.dispatch({ type: 'RESET_DASHBOARD_RCA' });
      store.dispatch({ type: 'RESET_ANOMALY' });
      store.dispatch(RESET);
      store.dispatch(RESET_DATA);
      setActive(item.name);
      history.push(`/dashboard/${dashboard}/${tabs}/${item.id}`);
    }
  };

  const debounce = (func) => debuncerReturn(func, 500);

  return (
    <div className="common-filter-section">
      <div className="filter-layout">
        {searchData && <h3>List of KPI's ({searchData.length})</h3>}
        <div className="form-group icon search-filter">
          <input
            type="text"
            className="form-control h-40"
            placeholder="Search KPI"
            onChange={debounce(onSearch)}
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
                  onClick={() => handleClick(item)}>
                  <div className="filter-tooltipcontent">
                    <label className="name-tooltip">
                      {CustomTooltip(item.name)}
                    </label>{' '}
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

export default DashboardFilter;
