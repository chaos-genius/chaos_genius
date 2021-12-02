import React, { useEffect } from 'react';

import { Link, useHistory } from 'react-router-dom';

import logo from '../../assets/images/logo.svg';
import home from '../../assets/images/sidebar/home.svg';
import homeactive from '../../assets/images/sidebar/home-active.svg';
import dashboard from '../../assets/images/sidebar/dashboard.svg';
import dashboardactive from '../../assets/images/sidebar/dashboard-active.svg';
import kpi from '../../assets/images/sidebar/kpiexplorer.svg';
import kpiactive from '../../assets/images/sidebar/kpiexplorer-active.svg';
//import anomolies from '../../assets/images/sidebar/anomolies.svg';
//import anomoliesactive from '../../assets/images/sidebar/anomolies-active.svg';
import datasource from '../../assets/images/sidebar/datasource.svg';
import datasourceactive from '../../assets/images/sidebar/datasource-active.svg';
import alerts from '../../assets/images/sidebar/alerts.svg';
import alertsactive from '../../assets/images/sidebar/alerts-active.svg';
import { useDispatch, useSelector } from 'react-redux';
import { getAllKpiExplorer } from '../../redux/actions';
import './sidebar.scss';

const Sidebar = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const location = history.location.pathname.split('/');

  const { kpiExplorerList } = useSelector((state) => state.kpiExplorer);

  useEffect(() => {
    if (location[1] !== 'kpiexplorer') {
      dispatch(getAllKpiExplorer());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  return (
    <div className="sidebar-menu">
      <div className="sidebar-logo">
        <Link to="/">
          <img src={logo} alt="Logo" />
        </Link>
      </div>
      <div className="sidebar-options">
        <ul>
          <li
            className={
              location[1] === '' || location[1] === 'onboarding' ? 'active' : ''
            }>
            <Link to="/">
              <img
                src={
                  location[1] === '' || location[1] === 'onboarding'
                    ? homeactive
                    : home
                }
                alt="Home"
              />
              <span>Home</span>
            </Link>
          </li>
          <li
            className={
              kpiExplorerList && kpiExplorerList.length === 0
                ? 'option-disabled'
                : location[1] === 'dashboard'
                ? 'active'
                : ''
            }>
            <div
              className="options"
              onClick={() => {
                if (kpiExplorerList && kpiExplorerList.length !== 0) {
                  history.push('/dashboard');
                }
              }}>
              <img
                src={location[1] === 'dashboard' ? dashboardactive : dashboard}
                alt="Dashboard"
              />
              <span>Dashboard</span>
            </div>
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
          {/* <li className={location[2] === 'anomaly' ? 'active' : ''}>
            <Link to="/dashboard/anomaly/kpi">
              <img
                src={location[2] === 'anomaly' ? anomoliesactive : anomolies}
                alt="Anomaly"
              />
              <span>Anomaly</span>
            </Link>
          </li> */}
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
    </div>
  );
};

export default Sidebar;
