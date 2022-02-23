import React from 'react';

import { Link, useHistory } from 'react-router-dom';
import { env } from '../../env';
import Plus from '../../assets/images/plus.svg';
import EventAlert from '../../assets/images/alerts/eventalert.svg';
import KpiAlert from '../../assets/images/alerts/kpialert.svg';
import rightarrow from '../../assets/images/rightarrow.svg';

import './setalerts.scss';

const SetAlerts = () => {
  const history = useHistory();
  const EVENT_ALERT_FLAG = env.REACT_APP_EVENT_ALERT;

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
                disabled={EVENT_ALERT_FLAG === 'false' ? true : false}
                onClick={() => history.push('/alerts/new/event-alert')}>
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
                <span>New Alert</span>
              </button>
            </div>
            {EVENT_ALERT_FLAG === 'false' && <h5>Soon</h5>}
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
