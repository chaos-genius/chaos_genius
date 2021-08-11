import React from 'react';

import Slack from '../../assets/images/setupcard/slack.svg';
import Gmail from '../../assets/images/setupcard/gmail.svg';
import Datadog from '../../assets/images/setupcard/datadog.svg';
import Asana from '../../assets/images/setupcard/asana.svg';
import Teams from '../../assets/images/setupcard/teams.svg';

import '../SetupCard/setupcard.scss';

const AlertsCard = () => {
  return (
    <>
      <div className="setup-card">
        <img src={Slack} className="in-active" alt="Slack" />
        <h1>Slack</h1>
        <p>Select the data you want to monitor and analyse</p>
        <button className="btn white-button">
          <span>Connect Slack</span>
        </button>
      </div>
      <div className="setup-card">
        <img src={Gmail} className="in-active" alt="Gmail" />
        <h1>Email</h1>
        <p>Select the data you want to monitor and analyse</p>
        <button className="btn white-button">
          <span>Connect Email</span>
        </button>
      </div>
      <div className="setup-card">
        <img src={Datadog} className="in-active" alt="Datadog" />
        <h1>Datadog</h1>
        <p>Select the data you want to monitor and analyse</p>
        <button className="btn white-button">
          <span>Connect Datadog</span>
        </button>
      </div>
      <div className="setup-card">
        <img src={Asana} className="in-active" alt="Asana" />
        <h1>Asana</h1>
        <p>Select the data you want to monitor and analyse</p>
        <button className="btn white-button">
          <span>Connect Asana</span>
        </button>
      </div>
      <div className="setup-card">
        <img src={Teams} className="in-active" alt="Teams" />
        <h1>Teams</h1>
        <p>Select the data you want to monitor and analyse</p>
        <button className="btn white-button btn-hidden">
          <span>Connect Teams</span>
        </button>
        <h3>Soon</h3>
      </div>
    </>
  );
};

export default AlertsCard;
