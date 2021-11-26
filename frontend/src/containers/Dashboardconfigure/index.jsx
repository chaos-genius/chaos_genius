import React, { useEffect, useState } from 'react';

import { Link } from 'react-router-dom';

import Select from 'react-select';

import Plus from '../../assets/images/plus.svg';
import Search from '../../assets/images/search.svg';
import Dashboardcards from '../../components/Dashboardcards';

import './dashboardconfigure.scss';

import { useDispatch } from 'react-redux';

import { getDashboard } from '../../redux/actions';
import EmptyDashboard from '../../components/EmptyDashboard';

import Fuse from 'fuse.js';

const dashboardList = [
  {
    active: true,
    created_at: 'Tue, 23 Nov 2021 05:53:54 GMT',
    id: 11,
    kpi_count: 5,
    last_modified: 'Tue, 23 Nov 2021 08:57:00 GMT',
    name: 'first_dashboard_modified'
  },
  {
    active: true,
    created_at: 'Tue, 23 Nov 2021 09:12:40 GMT',
    id: 12,
    kpi_count: 5,
    last_modified: 'Tue, 23 Nov 2021 09:12:40 GMT',
    name: 'second_dashboard'
  },
  {
    active: true,
    created_at: 'Tue, 23 Nov 2021 09:13:05 GMT',
    id: 13,
    kpi_count: 5,
    last_modified: 'Tue, 23 Nov 2021 09:13:05 GMT',
    name: 'third_dashboard'
  }
];

const Dashboardconfigure = () => {
  const dispatch = useDispatch();
  const [dashboardData, setDashboardData] = useState(dashboardList);
  // const { dashboardLis } = useSelector((state) => {
  //   return state.DashboardHome;
  // });

  useEffect(() => {
    dispatch(getDashboard());
  }, [dispatch]);

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

  return (
    <>
      <div className="heading-option">
        <div className="heading-title">
          <h3>Dashboard</h3>
        </div>
        <div className="option-button">
          <Link to="/dashboard/add" className="btn green-variant-button">
            <img src={Plus} alt="Add" />
            <span>New Dashboard</span>
          </Link>
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
                onChange={(e) => onSearch(e)}
              />
              <span>
                <img src={Search} alt="Search Icon" />
              </span>
            </div>{' '}
            <Select
              // options={data}
              classNamePrefix="selectcategory"
              placeholder="last modified"
              isSearchable={false}
            />
          </div>
          <div className="dashboard-card-wrapper">
            <Dashboardcards dashboardList={dashboardData} />
          </div>
        </>
      ) : (
        <div className="empty-dashboard-container">
          <EmptyDashboard />
        </div>
      )}
    </>
  );
};

export default Dashboardconfigure;
