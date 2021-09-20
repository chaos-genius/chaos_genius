import React, { useState } from 'react';

import { Link } from 'react-router-dom';

import rightarrow from '../../assets/images/rightarrow.svg';

import KpiAlertConfigurationForm from '../../components/KpiAlertConfigurationForm';
import KpiAlertDestinationForm from '../../components/KpiAlertDestinationForm';

const AddKpiAlert = () => {
  const [steps, setSteps] = useState(1);

  const [alertFormData, setAlertFormData] = useState({
    alert_name: '',
    alert_type: 'KPI Alert',
    data_source: 1,
    alert_query: '',
    alert_settings: '',
    kpi: 1,
    kpi_alert_type: 'Anomaly',
    severity_cutoff_score: 1,
    alert_message: '',
    alert_frequency: '',
    alert_channel: '',
    alert_channel_conf: '{}'
  });

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
              <Link to="/alerts/new"> New Alert </Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              {steps === 1 ? 'KPI Alert' : ' Alert Destination'}
            </li>
          </ol>
        </nav>
        {/* Back */}
        <div className="backnavigation">
          <Link to="/alerts/new">
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
          <KpiAlertConfigurationForm
            setSteps={setSteps}
            setAlertFormData={setAlertFormData}
            alertFormData={alertFormData}
          />
        ) : (
          <KpiAlertDestinationForm
            setKpiSteps={setSteps}
            setAlertFormData={setAlertFormData}
            alertFormData={alertFormData}
          />
        )}
      </div>
    </>
  );
};
export default AddKpiAlert;
