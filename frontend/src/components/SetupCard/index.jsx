import React from 'react';
import { useHistory } from 'react-router-dom';

import './setupcard.scss';
import DataSource from '../../assets/images/setupcard/data-source.svg';
import DataSourceActive from '../../assets/images/setupcard/data-source-active.svg';
import Succestick from '../../assets/images/setupcard/success-tick.svg';
import Alerts from '../../assets/images/setupcard/alerts.svg';
import AlertsActive from '../../assets/images/setupcard/alerts-active.svg';
import Analytics from '../../assets/images/setupcard/analytics.svg';
import AnalyticsActive from '../../assets/images/setupcard/analytics-active.svg';
import Kpi from '../../assets/images/setupcard/kpi.svg';
import KpiActive from '../../assets/images/setupcard/kpi-active.svg';

const description = [
  'Select the Data Sources you want to add',
  'Define the KPIs you want to monitor and analyse',
  'Setup Anomaly Detection & Deepdrills for your KPIs',
  'Setup Alerts to get notified on changes in events & KPIs'
];

const viewText = [
  'View Data sources',
  'View KPI',
  'view Analysis',
  'View Alerts'
];

const SetupCard = ({ heading, step, buttonText, active }) => {
  const history = useHistory();

  const onNavigate = () => {
    if (active === 'completed') {
      if (step === 1) {
        history.push('/datasource');
      } else if (step === 2) {
        history.push('/kpiexplorer');
      } else if (step === 3) {
        history.push('/dashboard/0/deepdrills');
      } else if (step === 4) {
        history.push('/alerts');
      }
    } else {
      if (step === 4) {
        history.push('/alerts');
      } else {
        history.push(`/onboarding/${step}`);
      }
    }
  };

  return (
    <div
      className={
        active === 'completed'
          ? 'setup-card'
          : active === 'pending'
          ? 'setup-card active'
          : 'setup-card'
      }>
      {step === 1 ? (
        <>
          <img src={DataSource} className="in-active" alt="DataSource" />
          <img
            src={DataSourceActive}
            className="active"
            alt="DataSourceActive"
          />
        </>
      ) : step === 2 ? (
        <>
          <img src={Kpi} className="in-active" alt="KPI" />
          <img src={KpiActive} className="active" alt="KpiActive" />
        </>
      ) : step === 3 ? (
        <>
          <img src={Analytics} className="in-active" alt="Analytics" />
          <img src={AnalyticsActive} className="active" alt="AnalyticsActive" />
        </>
      ) : (
        <>
          <img src={Alerts} className="in-active" alt="Alerts" />
          <img src={AlertsActive} className="active" alt="AlertsActive" />
        </>
      )}
      <h1>
        {heading}{' '}
        {active === 'completed' && (
          <img src={Succestick} alt="success tik"></img>
        )}
      </h1>

      <p>{description[step - 1]}</p>
      <button
        className="btn black-button"
        disabled={
          active === 'completed' ? false : active === 'pending' ? false : true
        }
        onClick={() => onNavigate()}>
        <span>{active === 'completed' ? viewText[step - 1] : buttonText}</span>
      </button>
      {heading === 'Setup Smart Alert' && <label>Optional</label>}
    </div>
  );
};

export default SetupCard;
