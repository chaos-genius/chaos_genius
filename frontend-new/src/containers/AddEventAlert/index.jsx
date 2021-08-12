import React from 'react';

import { Link } from 'react-router-dom';

import rightarrow from '../../assets/images/rightarrow.svg';

import EventAlertForm from '../../components/EventAlertForm';

const AddEventAlert = () => {
  return (
    <div>
      <div className="page-navigation">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/new-alert">Alerts / New Alert</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              Event Alert
            </li>
          </ol>
        </nav>
        {/* Back */}
        <div className="backnavigation">
          <Link to="/new-alert">
            <img src={rightarrow} alt="Back" />
            Event Alert
          </Link>
        </div>
      </div>
      <div className="add-form-container">
        <EventAlertForm />
      </div>
    </div>
  );
};
export default AddEventAlert;
