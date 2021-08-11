import React from 'react';
import { Link } from 'react-router-dom';
import Plus from '../../assets/images/plus.svg';
import Frame from '../../assets/images/channelconfig.svg';
import AlertTable from '../../components/AlertTable';
import './alert.scss';
import AlertFilter from '../../components/AlertFilter';

const Alert = () => {
  return (
    <div>
      {/* common heading and options */}
      <div className="heading-option">
        <div className="heading-title">
          <h3>Alerts</h3>
        </div>

        <div className="alert-option-button">
          <Link to="/alerts" className="btn white-button">
            <img src={Frame} alt="Add" />
            <span>Channel Configuration</span>
          </Link>
          <Link to="/alerts" className="btn green-variant-button">
            <img src={Plus} alt="Add" />
            <span>New Alert</span>
          </Link>
        </div>
      </div>

      {/* explore wrapper */}
      <div className="explore-wrapper">
        {/* filter section */}
        <div className="filter-section">
          <AlertFilter />
        </div>
        {/* table section */}
        <div className="table-section">
          <AlertTable />
        </div>
      </div>
    </div>
  );
};
export default Alert;
