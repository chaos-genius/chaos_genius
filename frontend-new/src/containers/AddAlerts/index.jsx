import React from 'react';

import { Link } from 'react-router-dom';

import rightarrow from '../../assets/images/rightarrow.svg';
import AlertsForm from '../../components/AlertsForm';

const AddAlerts = () => {
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
            <li className="breadcrumb-item">Channel Configuration</li>
            <li className="breadcrumb-item active" aria-current="page">
              Slack Setup
            </li>
          </ol>
        </nav>
        {/* Back */}
        <div className="backnavigation">
          <Link to="/alerts">
            <img src={rightarrow} alt="Back" />
            <span>Slack Setup</span>
          </Link>
        </div>
      </div>
      <div className="add-form-container">
        <AlertsForm />
      </div>
    </>
  );
};

export default AddAlerts;
