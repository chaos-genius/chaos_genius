import React from 'react';

import { Link, useHistory } from 'react-router-dom';

import rightarrow from '../../assets/images/rightarrow.svg';
import AlertsForm from '../../components/AlertsForm';

const AddAlerts = () => {
  const history = useHistory();
  const data = history.location.pathname.split('/');

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
              <Link to="/alerts/channelconfiguration">
                Channel Configuration
              </Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              {data[4] !== 'edit'
                ? data[3] === 'slack'
                  ? 'Slack Setup'
                  : 'Email Setup'
                : data[3] === 'slack'
                ? 'Edit Slack Connection'
                : 'Edit Email Connection'}
            </li>
          </ol>
        </nav>
        {/* Back */}

        <div className="backnavigation">
          <Link to="/alerts/channelconfiguration">
            <img src={rightarrow} alt="Back" />
            <span>
              {' '}
              {data[4] !== 'edit'
                ? data[3] === 'slack'
                  ? 'Slack Setup'
                  : 'Email Setup'
                : data[3] === 'slack'
                ? 'Edit Slack Connection'
                : 'Edit Email Connection'}
            </span>
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
