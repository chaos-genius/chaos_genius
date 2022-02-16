import React, { useEffect, useState } from 'react';

import { useHistory } from 'react-router-dom';
import Tooltip from 'react-tooltip-lite';
import Select from 'react-select';
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
import { debuncerReturn } from '../../utils/simple-debouncer';

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
  const history = useHistory();
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
          return a.kpis.length > b.kpis.length
            ? -1
            : a.kpis.length < b.kpis.length
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

  const debounce = () => debuncerReturn(onSearch, 500);

  const onSort = (type) => {
    let value = dashboardList.sort(function (a, b) {
      if (type.value === 'alpha') {
        return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
      } else if (type.value === 'recent') {
        return (
          formatDateTime(b.last_modified) - formatDateTime(a.last_modified)
        );
      } else if (type.value === 'kpi') {
        return a.kpis.length > b.kpis.length
          ? -1
          : a.kpis.length < b.kpis.length
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

          <div className="option-button">
            {!limited?.is_ee ? (
              <Tooltip
                className="tooltip-name"
                direction="left"
                content={<span>Only Available in Enterprise Edition</span>}>
                <button
                  onClick={() => history.push('/dashboard/add')}
                  className="btn green-variant-button"
                  disabled={!limited?.is_ee}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z"
                      stroke="#BDBDBD"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M6 8H10"
                      stroke="#BDBDBD"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M8 6V10"
                      stroke="#BDBDBD"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  <span>New Dashboard</span>
                </button>
              </Tooltip>
            ) : (
              <button
                onClick={() => history.push('/dashboard/add')}
                className="btn green-variant-button btn-active">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z"
                    stroke="#BDBDBD"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M6 8H10"
                    stroke="#BDBDBD"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M8 6V10"
                    stroke="#BDBDBD"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <span>New Dashboard</span>
              </button>
            )}
          </div>
        </div>{' '}
        {dashboardList && dashboardList.length !== 0 ? (
          <>
            <div className="dashboard-options">
              <div className="form-group icon">
                <input
                  type="text"
                  className="form-control h-40"
                  placeholder="Search dashboard"
                  onChange={debounce()}
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
