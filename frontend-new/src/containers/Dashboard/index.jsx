import React, { useState, useEffect } from 'react';

import { useSelector, useDispatch } from 'react-redux';

import { Link, useHistory } from 'react-router-dom';

import './dashboard.scss';

import rightarrow from '../../assets/images/rightarrow.svg';
import Setting from '../../assets/images/setting.svg';

import Dashboardgraph from '../../components/DashboardGraph';
import FilterWithTab from '../../components/FilterWithTab';
import Anomaly from '../../components/Anomaly';

import { getDashboardSidebar } from '../../redux/actions';

const Dashboard = () => {
  const dispatch = useDispatch();
  const [active, setActive] = useState('');
  const [kpi, setKpi] = useState();

  const location = useHistory().location.pathname.split('/');

  const { sidebarLoading, sidebarList } = useSelector((state) => {
    return state.sidebar;
  });

  useEffect(() => {
    getAllDashboardSidebar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getAllDashboardSidebar = () => {
    dispatch(getDashboardSidebar());
  };

  useEffect(() => {
    if (sidebarList && sidebarList.length !== 0 && kpi === undefined) {
      setActive(sidebarList[0]?.name);
      setKpi(sidebarList[0]?.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sidebarList]);

  if (sidebarLoading) {
    return (
      <div className="loader loader-page">
        <div className="loading-text">
          <p>loading</p>
          <span></span>
        </div>
      </div>
    );
  } else {
    return (
      <div>
        {/* Page Navigation */}
        <div className="page-navigation">
          {/* Breadcrumb */}
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link to="/">Dashboard </Link>
              </li>
              <li className="breadcrumb-item">
                <Link to="/"> Test Dashboard 1 </Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                AutoRCA
              </li>
            </ol>
          </nav>
          {/* Back */}
          <div className="backnavigation">
            <Link to="/">
              <img src={rightarrow} alt="Back" />
              <span>Test Dashboard 1</span>{' '}
            </Link>
          </div>
        </div>

        {/* explore wrapper */}
        <div className="explore-wrapper">
          {/* filter section */}
          <div className="filter-section">
            {sidebarList && (
              <FilterWithTab
                setKpi={setKpi}
                data={sidebarList}
                active={active}
                setActive={setActive}
              />
            )}
          </div>

          {/* Graph Section*/}
          <div className="graph-section">
            {/* Dashboard Header */}
            <div className="dashboard-layout dashboard-header-tab">
              <div className="dashboard-subheader">
                <div className="common-tab">
                  <ul>
                    <Link to="/dashboard/autorca">
                      <li className={location[2] === 'autorca' ? 'active' : ''}>
                        AutoRCA
                      </li>
                    </Link>
                    <Link to="/dashboard/anomolies">
                      <li
                        className={location[2] === 'anomolies' ? 'active' : ''}>
                        Anomolies
                      </li>
                    </Link>
                  </ul>
                </div>
                <div className="common-option">
                  <button className="btn grey-button">
                    <img src={Setting} alt="Setting" />
                    <span>Settings</span>
                  </button>
                </div>
              </div>
            </div>
            {location[2] === 'autorca' && kpi && <Dashboardgraph kpi={kpi} />}
            {location[2] === 'anomolies' && kpi && <Anomaly kpi={kpi} />}
          </div>
        </div>
      </div>
    );
  }
};

export default Dashboard;
