import React, { useEffect, useState } from 'react';

import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Search from '../../assets/images/search.svg';
import GreenArrow from '../../assets/images/green-arrow.svg';

import Fuse from 'fuse.js';

import { v4 as uuidv4 } from 'uuid';

import store from '../../redux/store';

import { anomalySetting } from '../../redux/actions';

const RESET = {
  type: 'RESET_DATA'
};

const RESET_DATA = {
  type: 'RESET_CONFIG'
};

const DashboardFilter = ({
  kpi,
  data,
  setActive,
  tabs,
  SetKpiAggregate,
  dashboard
}) => {
  const history = useHistory();
  const dispatch = useDispatch();
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
                    dispatch(anomalySetting(item.id));
                    store.dispatch(RESET);
                    store.dispatch(RESET_DATA);
                    setActive(item.name);
                    SetKpiAggregate(item.aggregation);
                    // history.push(`/dashboard/${tabs}/${item.id}`);
                    history.push(`/dashboard/${dashboard}/${tabs}/${item.id}`);
                  }}>
                  {item.name}
                  <img src={GreenArrow} alt="Arrow" />
                </li>
              );

              // return (
              // <li
              //   key={uuidv4()}
              //   className={
              //     kpi.toString() === item.id.toString() ? 'active' : ''
              //   }
              //   onClick={() => {
              //     dispatch(anomalySetting(item.id));
              //     store.dispatch(RESET);
              //     store.dispatch(RESET_DATA);
              //     setActive(item.name);
              //     SetKpiAggregate(item.aggregation);
              //     // history.push(`/dashboard/${tabs}/${item.id}`);
              //     history.push(`/dashboard/${dashboard}/${tabs}/${item.id}`);
              //   }}>
              //   {item.name}
              //   <img src={GreenArrow} alt="Arrow" />
              // </li>
              // );
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
