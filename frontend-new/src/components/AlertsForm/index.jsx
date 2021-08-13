import React from 'react';

import { Link } from 'react-router-dom';

import Slack from '../../assets/images/alerts/slack.svg';

const AlertsForm = () => {
  return (
    <>
      <div className="form-group form-title-image">
        <img src={Slack} alt="Slack" />
      </div>
      <div className="form-group">
        <label>Setting 1</label>
        <input type="text" className="form-control" />
      </div>
      <div className="form-group">
        <label>Setting 2</label>
        <input type="text" className="form-control" />
      </div>
      <div className="form-group">
        <label>Setting 3</label>
        <input type="text" className="form-control" />
      </div>
      <div className="form-action">
        <Link to="/alerts/channelconfiguration">
          {' '}
          <button className="btn white-button btn-spacing">
            <span>Cancel</span>
          </button>
        </Link>
        <button className="btn black-button">
          <span>Save Settings</span>
        </button>
      </div>
    </>
  );
};

export default AlertsForm;
