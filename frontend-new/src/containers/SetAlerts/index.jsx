import React from 'react';

import { Link, useHistory } from 'react-router-dom';

import Plus from '../../assets/images/plus.svg';
import DisablePlus from '../../assets/images/disableplus.svg';
import EventAlert from '../../assets/images/alerts/eventalert.svg';
import KpiAlert from '../../assets/images/alerts/kpialert.svg';
import rightarrow from '../../assets/images/rightarrow.svg';

import './setalerts.scss';

const SetAlerts = () => {
  const history = useHistory();
  return (
    <>
      <div className="heading-option alert-heading">
        {/* Page Navigation */}
        <div className="page-navigation">
          {/* Breadcrumb */}
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link to="/alerts">Alerts</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                New Alert
              </li>
            </ol>
          </nav>
          {/* Back */}
          <div className="backnavigation">
            <Link to="/alerts">
              <img src={rightarrow} alt="Back" />
              <span>New Alert</span>
            </Link>
          </div>
        </div>
      </div>
      <div className="setAlerts">
        <div className="common-heading">
          <h3>Select Alert Type</h3>
        </div>
        <div className="common-container">
          <div className="alerts-card">
            <img src={EventAlert} alt="Event Alert" />
            <h3>Event Alert</h3>
            <p>Tap ‘New Alert‘ button below to add your first alert</p>{' '}
            <div className="alert-button">
              {/* added disable button */}
              <button
                className="btn black-button"
                disabled
                onClick={() => history.push('/alerts/new/event-alert')}>
                <img src={DisablePlus} alt="Plus" />
                <span>New Alert</span>
              </button>
            </div>
            <h5>Soon</h5>
          </div>
          <div className="alerts-card">
            <img src={KpiAlert} alt="Kpi Alert" />
            <h3>KPI Alert</h3>
            <p>Tap ‘New Alert‘ button below to add your first alert</p>
            <div className="alert-button">
              <button
                className="btn black-button"
                onClick={() => history.push('/alerts/new/kpi-alert')}>
                <img src={Plus} alt="Plus" />
                <span>New Alert</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default SetAlerts;
