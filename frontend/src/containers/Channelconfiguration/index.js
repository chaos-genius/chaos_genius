import React from 'react';

import { Link } from 'react-router-dom';

// import Request from '../../assets/images/request.svg';
import rightarrow from '../../assets/images/rightarrow.svg';

import AlertsCard from '../../components/AlertsCard';

import './channelconfiguration.scss';

const Channelconfiguration = () => {
  return (
    <>
      {/* common heading and options */}
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
                Channel Configuration
              </li>
            </ol>
          </nav>
          {/* Back */}
          <div className="backnavigation">
            <Link to="/alerts">
              <img src={rightarrow} alt="Back" />
              <span>Channel Configuration</span>
            </Link>
          </div>
        </div>
        {/* <div className="option-button">
          <Link to="/alerts/new" className="btn black-button">
            <img src={Request} alt="Request" />
            <span>Request a new channel</span>
          </Link>
        </div> */}
      </div>
      <div className="homepage-setup-card-wrapper">
        <AlertsCard />
      </div>
    </>
  );
};
export default Channelconfiguration;
