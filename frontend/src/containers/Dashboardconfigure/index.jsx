import React, { useEffect, useState } from 'react';

import { Link } from 'react-router-dom';

import Select from 'react-select';

import Plus from '../../assets/images/plus.svg';
import Search from '../../assets/images/search.svg';
import Dashboardcards from '../../components/Dashboardcards';

import './dashboardconfigure.scss';

import { useDispatch, useSelector } from 'react-redux';

import { getDashboard } from '../../redux/actions';
import EmptyDashboard from '../../components/EmptyDashboard';

import Fuse from 'fuse.js';

import store from '../../redux/store';

import { formatDateTime } from '../../utils/date-helper';
import { getLocalStorage } from '../../utils/storage-helper';

const DASHBOARD_RESET = {
  type: 'DASHBOARD_RESET'
};

const sort = [
  {
    label: 'Alphabetical',
    value: 'alpha'
  },
  {
    label: 'Recently Modified',
    value: 'recent'
  },
  {
    label: 'No. of KPIs',
    value: 'kpi'
  }
];

const Dashboardconfigure = () => {
  const dispatch = useDispatch();
  const limited = getLocalStorage('GlobalSetting');
  const [dashboardData, setDashboardData] = useState([]);
  const [data, setData] = useState(false);
  const [sortValue, setSortValue] = useState({
    label: 'No. of KPIs',
    value: 'kpi'
  });
  const { dashboardListLoading, dashboardList } = useSelector((state) => {
    return state.DashboardHome;
  });

  useEffect(() => {
    store.dispatch(DASHBOARD_RESET);
    store.dispatch({ type: 'SIDEBAR_RESET' });
    dispatch(getDashboard());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  useEffect(() => {
    if (dashboardList) {
      setDashboardData(
        dashboardList.sort(function (a, b) {
          return a.kpis.length < b.kpis.length
            ? -1
            : a.kpis.length > b.kpis.length
            ? 1
            : 0;
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dashboardList]);

  const onSearch = (e) => {
    if (e.target.value !== '') {
      const options = {
        keys: ['name']
      };

      const fuse = new Fuse(dashboardList, options);

      const result = fuse.search(e.target.value);

      setDashboardData(
        result.map((item) => {
          return item.item;
        })
      );
    } else {
      setDashboardData(dashboardList);
    }
  };

  const onSort = (type) => {
    let value = dashboardList.sort(function (a, b) {
      if (type.value === 'alpha') {
        return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
      } else if (type.value === 'recent') {
        return (
          formatDateTime(b.last_modified) - formatDateTime(a.last_modified)
        );
      } else if (type.value === 'kpi') {
        return a.kpis.length < b.kpis.length
          ? -1
          : a.kpis.length > b.kpis.length
          ? 1
          : 0;
      } else {
        return [];
      }
    });
    setDashboardData([...value]);
  };

  if (dashboardListLoading) {
    return (
      <div className="load loader-page">
        <div className="preload"></div>
      </div>
    );
  } else {
    return (
      <>
        <div className="heading-option">
          <div className="heading-title">
            <h3>Dashboard</h3>
          </div>
          {limited?.is_ee && (
            <div className="option-button">
              <Link to="/dashboard/add" className="btn green-variant-button">
                <img src={Plus} alt="Add" />
                <span>New Dashboard</span>
              </Link>
            </div>
          )}
        </div>{' '}
        {dashboardList && dashboardList.length !== 0 ? (
          <>
            <div className="dashboard-options">
              <div className="form-group icon">
                <input
                  type="text"
                  className="form-control h-40"
                  placeholder="Search dashboard"
                  onChange={(e) => onSearch(e)}
                />
                <span>
                  <img src={Search} alt="Search Icon" />
                </span>
              </div>{' '}
              <div className="text">
                <span>Sort By</span>
                <Select
                  classNamePrefix="selectcategory"
                  options={sort}
                  value={sortValue}
                  isSearchable={false}
                  onChange={(e) => {
                    onSort(e);
                    setSortValue(e);
                  }}
                />
              </div>
            </div>
            <div className="dashboard-card-wrapper">
              <Dashboardcards
                dashboarddata={dashboardData}
                setChange={setData}
              />
            </div>
          </>
        ) : (
          dashboardList &&
          dashboardList !== '' && (
            <div className="empty-dashboard-container">
              <EmptyDashboard />
            </div>
          )
        )}
      </>
    );
  }
};

export default Dashboardconfigure;
