import React from 'react';

import { useHistory } from 'react-router-dom';

import Slack from '../../assets/images/alerts/slack.svg';
import Email from '../../assets/images/alerts/gmail.svg';

const AlertsForm = () => {
  const history = useHistory();
  const data = history.location.pathname.split('/');
  return (
    <>
      {data[2] === 'slack' ? (
        <>
          <div className="form-group form-title-image">
            <img src={Slack} alt="Slack" />
          </div>
          <div className="form-group">
            <label>Webhook URL *</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter Webhook URL"
            />
          </div>
        </>
      ) : data[2] === 'email' ? (
        <>
          <div className="form-group form-title-image">
            <img src={Email} alt="Email" />
          </div>
          <div className="form-group">
            <label>SMTP server *</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter SMTP server"
            />
          </div>
          <div className="form-group">
            <label>Port *</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter Port"
            />
          </div>
          <div className="form-group">
            <label>Username *</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter Username"
            />
          </div>
          <div className="form-group">
            <label>Password *</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter Password"
            />
          </div>
          <div className="form-group">
            <label>Email Sender *</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter Email"
            />
          </div>
        </>
      ) : null}

      <div className="form-action">
        {/* <Link to="/alerts/channelconfiguration">
          <button className="btn white-button btn-spacing">
            <span>Cancel</span>
          </button>
        </Link> */}
        <button className="btn black-button" disabled>
          <span>Save</span>
        </button>
      </div>
    </>
  );
};

export default AlertsForm;
