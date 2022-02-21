import React from 'react';

import { Link, useHistory, useRouteMatch } from 'react-router-dom';
import { useSelector } from 'react-redux';
import home from '../../assets/images/sidebar/home.svg';
import homeactive from '../../assets/images/sidebar/home-active.svg';
import dashboard from '../../assets/images/sidebar/dashboard.svg';
import dashboardactive from '../../assets/images/sidebar/dashboard-active.svg';
import kpi from '../../assets/images/sidebar/kpiexplorer.svg';
import kpiactive from '../../assets/images/sidebar/kpiexplorer-active.svg';
import datasource from '../../assets/images/sidebar/datasource.svg';
import datasourceactive from '../../assets/images/sidebar/datasource-active.svg';
import alerts from '../../assets/images/sidebar/alerts.svg';
import alertsactive from '../../assets/images/sidebar/alerts-active.svg';

import './sidebar.scss';

const Sidebar = () => {
  const history = useHistory();
  const location = history.location.pathname.split('/');
  const match = useRouteMatch();
  const { versionSettingData } = useSelector((state) => state.VersionSetting);

  return (
    <div className="sidebar-menu">
      <div className="sidebar-options">
        <ul>
          <li
            className={
              location[1] === '' || location[1] === 'onboarding' ? 'active' : ''
            }>
            <Link to="/">
              <img
                src={
                  location[1] === '' ||
                  location[1] === 'onboarding' ||
                  match.path === '/:id'
                    ? homeactive
                    : home
                }
                alt="Home"
              />
              <span>Home</span>
            </Link>
          </li>
          <li className={location[1] === 'dashboard' ? 'active' : ''}>
            <Link to="/dashboard">
              {/* <div className="options"> */}
              <img
                src={location[1] === 'dashboard' ? dashboardactive : dashboard}
                alt="Dashboard"
              />
              <span>Dashboard</span>
              {/* </div> */}
            </Link>
          </li>
          <li className={location[1] === 'kpiexplorer' ? 'active' : ''}>
            <Link to="/kpiexplorer">
              <img
                src={location[1] === 'kpiexplorer' ? kpiactive : kpi}
                alt="KPI Explorer"
              />
              <span>KPI Explorer</span>
            </Link>
          </li>
        </ul>
        <ul>
          <li className={location[1] === 'datasource' ? 'active' : ''}>
            <Link to="/datasource">
              <img
                src={
                  location[1] === 'datasource' ? datasourceactive : datasource
                }
                alt="Data Source"
              />
              <span>Data Source</span>
            </Link>
          </li>
          <li
            className={
              location[1] === 'alerts' ? 'alert-option active' : 'alert-option'
            }>
            <Link to="/alerts">
              <img
                src={location[1] === 'alerts' ? alertsactive : alerts}
                alt="Alerts"
              />
              <label>3</label>
              <span>Alerts</span>
            </Link>
          </li>
        </ul>
      </div>
      <ul>
        <li className="common-watermark">
          <span>Version {versionSettingData && versionSettingData.main}</span>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
