import React, { useEffect } from 'react';

import { Link } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';

import Slack from '../../assets/images/alerts/slack.svg';
import Gmail from '../../assets/images/alerts/gmail.svg';
import Datadog from '../../assets/images/alerts/datadog.svg';
import Asana from '../../assets/images/alerts/asana.svg';
import Teams from '../../assets/images/alerts/teams.svg';
import Succestick from '../../assets/images/setupcard/success-tick.svg';
import '../SetupCard/setupcard.scss';
import { getChannelStatus } from '../../redux/actions';
import store from '../../redux/store';

const RESET_ACTION = {
  type: 'RESET_EMAIL_DATA'
};

const AlertsCard = () => {
  const dispatch = useDispatch();

  const { channelStatusData } = useSelector((state) => {
    return state.alert;
  });

  useEffect(() => {
    store.dispatch(RESET_ACTION);
    dispatch(getChannelStatus());
  }, [dispatch]);

  const statusChecking = (type) => {
    var bool = false;
    channelStatusData &&
      channelStatusData.find((status) => {
        if (status.name === type) {
          bool = status.active;
        }
        return '';
      });
    return bool;
  };

  return (
    <>
      <div className="setup-card">
        <img src={Slack} className="in-active" alt="Slack" />
        <h1>
          Slack
          {statusChecking('slack') && (
            <img src={Succestick} alt="success tik"></img>
          )}
        </h1>
        <p>Select the data you want to monitor and analyse</p>
        <Link to="/alerts/slack">
          {/* <button className="btn black-button">
            <span>Edit Slack Connection</span>
          </button> */}
          <button
            className={
              statusChecking('slack') ? 'btn black-button' : 'btn white-button'
            }>
            <span>
              {statusChecking('slack')
                ? 'Edit Slack Connection'
                : 'Connect Slack'}
            </span>
          </button>
        </Link>
      </div>
      <div className="setup-card">
        <img src={Gmail} className="in-active" alt="Gmail" />

        <h1>
          Email
          {statusChecking('email') && (
            <img src={Succestick} alt="success tik"></img>
          )}
        </h1>

        <p>Select the data you want to monitor and analyse</p>
        <Link to="/alerts/email">
          <button
            className={
              statusChecking('email') ? 'btn black-button' : 'btn white-button'
            }>
            <span>
              {statusChecking('email')
                ? 'Edit Email Connection'
                : 'Connect Email'}
            </span>
          </button>
        </Link>
      </div>
      <div className="setup-card">
        <img src={Datadog} className="in-active" alt="Datadog" />
        <h1>
          Datadog{' '}
          {statusChecking('datadog') && (
            <img src={Succestick} alt="success tik"></img>
          )}
        </h1>
        <p>Select the data you want to monitor and analyse</p>
        <button
          className={
            statusChecking('datadog') ? 'btn black-button' : 'btn white-button'
          }>
          <span>
            {statusChecking('datadog')
              ? 'Edit Datadog Connection'
              : 'Connect Datadog'}
          </span>
        </button>
      </div>
      <div className="setup-card">
        <img src={Asana} className="in-active" alt="Asana" />
        <h1>
          Asana{' '}
          {statusChecking('asana') && (
            <img src={Succestick} alt="success tik"></img>
          )}
        </h1>
        <p>Select the data you want to monitor and analyse</p>
        <button
          className={
            statusChecking('asana') ? 'btn black-button' : 'btn white-button'
          }>
          <span>
            {statusChecking('asana')
              ? 'Edit Asana Connection'
              : 'Connect Asana'}
          </span>
        </button>
      </div>
      <div className="setup-card">
        <img src={Teams} className="in-active" alt="Teams" />
        <h1>
          Teams
          {statusChecking('teams') && (
            <img src={Succestick} alt="success tik"></img>
          )}
        </h1>
        <p>Select the data you want to monitor and analyse</p>
        <button
          className={
            statusChecking('teams') ? 'btn black-button' : 'btn white-button'
          }>
          <span>
            {statusChecking('teams')
              ? 'Edit Teams Connection'
              : 'Connect Teams'}
          </span>
        </button>
        <h3>Soon</h3>
      </div>
    </>
  );
};

export default AlertsCard;
