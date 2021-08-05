import React from 'react';
import { useHistory } from 'react-router-dom';

import './setupcard.scss';
import DataSource from '../../assets/images/setupcard/data-source.svg';
import DataSourceActive from '../../assets/images/setupcard/data-source-active.svg';
import Succestick from '../../assets/images/setupcard/success-tick.svg';
const description = [
  'Select The Data You Want To Monitor And Analyse',
  'Define the KPIs you want to monitor and analyse',
  'Setup Anomaly Detection & AutoRCA for your KPIs',
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
      history.push(`/view`);
    } else {
      history.push(`/${heading}`);
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
      <img src={DataSource} className="in-active" alt="DataSource" />
      <img src={DataSourceActive} className="active" alt="DataSourceActive" />
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
