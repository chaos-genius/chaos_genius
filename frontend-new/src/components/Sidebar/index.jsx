import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './sidebar.scss';
import logo from '../../assets/images/logo.svg';
import home from '../../assets/images/sidebar/home.svg';
import homeactive from '../../assets/images/sidebar/home-active.svg';
import dashboard from '../../assets/images/sidebar/dashboard.svg';
import dashboardactive from '../../assets/images/sidebar/dashboard-active.svg';
import kpi from '../../assets/images/sidebar/kpiexplorer.svg';
import kpiactive from '../../assets/images/sidebar/kpiexplorer-active.svg';
import anomolies from '../../assets/images/sidebar/anomolies.svg';
import anomoliesactive from '../../assets/images/sidebar/anomolies-active.svg';
import datasource from '../../assets/images/sidebar/datasource.svg';
import datasourceactive from '../../assets/images/sidebar/datasource-active.svg';
import alerts from '../../assets/images/sidebar/alerts.svg';
import alertsactive from '../../assets/images/sidebar/alerts-active.svg';

const Sidebar = () => {
  const [active, setActive] = useState('home');
  return (
    <div className="sidebar-menu">
      <div className="sidebar-logo">
        <Link to="/">
          <img src={logo} alt="Logo" />
        </Link>
      </div>
      <div className="sidebar-options">
        <ul>
          <li className={active === 'home' ? 'active' : ''}>
            <Link to="/" onClick={() => setActive('home')}>
              <img src={active === 'home' ? homeactive : home} alt="Home" />
              <span>Home</span>
            </Link>
          </li>
          <li className={active === 'dashboard' ? 'active' : ''}>
            <Link to="/dashboard" onClick={() => setActive('dashboard')}>
              <img
                src={active === 'dashboard' ? dashboardactive : dashboard}
                alt="Dashboard"
              />
              <span>Dashboard</span>
            </Link>
          </li>
          <li className={active === 'kpi' ? 'active' : ''}>
            <Link to="/kpi" onClick={() => setActive('kpi')}>
              <img
                src={active === 'kpi' ? kpiactive : kpi}
                alt="KPI Explorer"
              />
              <span>KPI Explorer</span>
            </Link>
          </li>
          <li className={active === 'anomolies' ? 'active' : ''}>
            <Link to="/" onClick={() => setActive('anomolies')}>
              <img
                src={active === 'anomolies' ? anomoliesactive : anomolies}
                alt="Anomolies"
              />
              <span>Anomolies</span>
            </Link>
          </li>
        </ul>
        <ul>
          <li className={active === 'datasource' ? 'active' : ''}>
            <Link to="/datasource" onClick={() => setActive('datasource')}>
              <img
                src={active === 'datasource' ? datasourceactive : datasource}
                alt="Data Source"
              />
              <span>Data Source</span>
            </Link>
          </li>
          <li
            className={
              active === 'alerts' ? 'alert-option active' : 'alert-option'
            }>
            <Link to="/" onClick={() => setActive('alerts')}>
              <img
                src={active === 'alerts' ? alertsactive : alerts}
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
