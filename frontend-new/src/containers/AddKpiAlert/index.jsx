import React, { useState } from 'react';

import { Link } from 'react-router-dom';

import rightarrow from '../../assets/images/rightarrow.svg';

import KpiAlertConfigurationForm from '../../components/KpiAlertConfigurationForm';
import KpiAlertDestinationForm from '../../components/KpiAlertDestinationForm';

const AddKpiAlert = () => {
  const [steps, setSteps] = useState(1);
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
              {steps === 1 ? 'KPI Alert' : ' Alert Destination'}
            </li>
          </ol>
        </nav>
        {/* Back */}
        <div className="backnavigation">
          <Link to="/new-alert">
            <img src={rightarrow} alt="Back" />
            <span> {steps === 1 ? 'KPI Alert' : ' Alert Destination'}</span>
          </Link>
        </div>
      </div>
      <div className="onboarding-steps">
        <ul>
          <li className={steps > 1 ? 'selected' : 'active'}>
            Alert Configuration
          </li>
          <li className={steps === 2 ? 'active' : ''}>Alert Destination</li>
        </ul>
      </div>
      {/* add KPI Alert form */}
      <div className="add-form-container">
        {steps === 1 ? (
          <KpiAlertConfigurationForm setSteps={setSteps} />
        ) : (
          <KpiAlertDestinationForm setKpiSteps={setSteps} />
        )}
      </div>
    </>
  );
};
export default AddKpiAlert;
