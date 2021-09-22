import React from 'react';

import { Link } from 'react-router-dom';

import Plus from '../../assets/images/plus.svg';
import EventAlert from '../../assets/images/alerts/eventalert.svg';
import KpiAlert from '../../assets/images/alerts/kpialert.svg';

import './setalerts.scss';

const SetAlerts = () => {
  return (
    <div className="setAlerts">
      <div className="common-heading">
        <h3>Select Alert Type</h3>
      </div>
      <div className="common-container">
        <div className="alerts-card">
          <img src={EventAlert} alt="Event Alert" />
          <h3>Event Alert</h3>
          <p>Tap ‘New Alert‘ button below to add your first alert</p>
          <div className="alert-button">
            <Link to="/alerts/new/event-alert">
              {/* added disable button */}
              <button className="btn black-button" disabled>
                <img src={Plus} alt="Plus" />
                <span>New Alert</span>
              </button>
            </Link>
          </div>
        </div>
        <div className="alerts-card">
          <img src={KpiAlert} alt="Kpi Alert" />
          <h3>KPI Alert</h3>
          <p>Tap ‘New Alert‘ button below to add your first alert</p>
          <div className="alert-button">
            <Link to="/alerts/new/kpi-alert">
              <button className="btn black-button">
                <img src={Plus} alt="Plus" />
                <span>New Alert</span>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SetAlerts;
