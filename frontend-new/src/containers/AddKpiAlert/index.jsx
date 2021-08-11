import React, { useState } from 'react';

import { Link } from 'react-router-dom';

import rightarrow from '../../assets/images/rightarrow.svg';

import KpiAlertConfigurationForm from '../../components/KpiAlertConfigurationForm';

const AddKpiAlert = () => {
  const [alert, setAlert] = useState('configuration');
  return (
    <>
      {/* Page Navigation */}
      <div className="page-navigation">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/alerts"> Alerts </Link>
            </li>
            <li className="breadcrumb-item">
              <Link to="/new-alert"> New Alert </Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              KPI Alert
            </li>
          </ol>
        </nav>
        {/* Back */}
        <div className="backnavigation">
          <Link to="/new-alert">
            <img src={rightarrow} alt="Back" />
            <span>KPI Alert</span>
          </Link>
        </div>
      </div>
      <div className="onboarding-steps">
        <ul>
          <li
            className={alert === 'configuration' ? 'active' : ''}
            onClick={() => setAlert('configuration')}>
            Alert Configuration
          </li>
          <li
            className={alert === 'destination' ? 'active' : ''}
            onClick={() => setAlert('destination')}>
            Alert Destination
          </li>
        </ul>
      </div>
      {/* add KPI Alert form */}
      <div className="add-form-container">
        {alert === 'configuration' ? <KpiAlertConfigurationForm /> : null}
      </div>
    </>
  );
};
export default AddKpiAlert;
