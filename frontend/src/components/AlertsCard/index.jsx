import React, { useEffect } from 'react';

import { Link } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';

import Slack from '../../assets/images/alerts/slack.svg';
import Email from '../../assets/images/alerts/email.svg';
import Webhook from '../../assets/images/alerts/webhook.svg';
import Succestick from '../../assets/images/setupcard/success-tick.svg';

import '../SetupCard/setupcard.scss';

import { getChannelStatus } from '../../redux/actions';
import store from '../../redux/store';

const RESET_ACTION = {
  type: 'RESET_EMAIL_DATA'
};

const AlertsCard = () => {
  const dispatch = useDispatch();

  const { channelStatusLoading, channelStatusData } = useSelector((state) => {
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

  if (channelStatusLoading) {
    return (
      <div className="load loader-page">
        <div className="preload"></div>
      </div>
    );
  } else {
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
          <p>Update the configuration for the channel to receive alerts</p>
          <Link
            to={
              statusChecking('slack')
                ? '/alerts/channelconfiguration/slack/edit'
                : '/alerts/channelconfiguration/slack'
            }>
            <button
              className={
                statusChecking('slack')
                  ? 'btn black-button'
                  : 'btn white-button'
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
          <img src={Email} className="in-active" alt="Email" />

          <h1>
            Email
            {statusChecking('email') && (
              <img src={Succestick} alt="success tik"></img>
            )}
          </h1>

          <p>Update the configuration for the channel to receive alerts</p>
          <Link
            to={
              statusChecking('email')
                ? '/alerts/channelconfiguration/email/edit'
                : '/alerts/channelconfiguration/email'
            }>
            <button
              className={
                statusChecking('email')
                  ? 'btn black-button'
                  : 'btn white-button'
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
          <img src={Webhook} className="in-active" alt="webhook" />
          <h1>
            Webhook{' '}
            {statusChecking('webhook') && (
              <img src={Succestick} alt="success tik"></img>
            )}
          </h1>
          <p>Update the configuration for the channel to receive alerts</p>
          <button
            disabled
            className={
              statusChecking('webhook')
                ? 'btn black-button'
                : 'btn white-button'
            }>
            <span>
              {statusChecking('webhook')
                ? 'Edit Webhook Connection'
                : 'Connect Webhook'}
            </span>
          </button>
          <h3>Soon</h3>
        </div>
      </>
    );
  }
};

export default AlertsCard;
