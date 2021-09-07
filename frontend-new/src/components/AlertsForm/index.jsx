import React, { useState, useEffect } from 'react';

import { useHistory } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';

import Slack from '../../assets/images/alerts/slack.svg';
import Email from '../../assets/images/alerts/gmail.svg';

import { getAllAlertEmail, getEditChannel } from '../../redux/actions';

const AlertsForm = () => {
  const history = useHistory();

  const data = history.location.pathname.split('/');

  const { emailLoading, editLoading, emailData, editData } = useSelector(
    (state) => {
      return state.alert;
    }
  );

  const dispatch = useDispatch();
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookUrlError, setWebhookUrlError] = useState(false);

  const [email, setEmail] = useState({
    smtp: '',
    port: '',
    username: '',
    password: '',
    emailsender: ''
  });
  const [emailError, setEmailError] = useState({
    smtp: '',
    port: '',
    username: '',
    password: '',
    emailsender: ''
  });

  useEffect(() => {
    if (data[3] === 'edit') {
      if (data[2] === 'slack') {
        dispatch(
          getEditChannel({
            config_name: 'slack'
          })
        );
      } else if (data[2] === 'email') {
        dispatch(
          getEditChannel({
            config_name: 'email'
          })
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  useEffect(() => {
    if (data[2] === 'email' && editData) {
      var obj = { ...email };
      obj['port'] = editData?.config_setting?.port || '';
      obj['emailsender'] = editData?.config_setting?.sender_email || '';
      obj['smtp'] = editData?.config_setting?.server || '';
      setEmail(obj);
    } else if (data[2] === 'slack' && editData) {
      setWebhookUrl(editData?.config_setting?.webhookUrl || null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editData]);

  useEffect(() => {
    if (emailData && emailData.status === 'success') {
      history.push('/alerts/channelconfiguration');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailData]);

  const validateEmail = (email) => {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/; //eslint-disable-line
    return re.test(String(email).toLowerCase());
  };

  const alertHandler = () => {
    if (data[2] === 'email') {
      var objectErr = { ...emailError };
      if (email.smtp === '') {
        // setEmailError((prev) => {
        //   return { ...prev, smtp: 'Enter SMTP server' };
        // });
        objectErr['smtp'] = 'Enter SMTP server';
      }
      if (email.port === '') {
        // setEmailError((prev) => {
        //   return { ...prev, port: 'Enter Port' };
        // });
        objectErr['port'] = 'Enter Port';
      }
      if (
        !(
          /^[1-9]\d*$/.test(email.port) &&
          1 <= 1 * email.port &&
          1 * email.port <= 65535
        ) &&
        email.port !== ''
      ) {
        // setEmailError((prev) => {
        //   return { ...prev, port: 'Enter Valid port' };
        // });
        objectErr['port'] = 'Enter Valid Port';
      }

      if (email.username === '') {
        // setEmailError((prev) => {
        //   return { ...prev, username: 'Enter Username' };
        // });
        objectErr['username'] = 'Enter Username';
      }
      if (email.password === '') {
        // setEmailError((prev) => {
        //   return { ...prev, password: 'Enter Password' };
        // });
        objectErr['password'] = 'Enter Password';
      }
      if (email.emailsender === '') {
        // setEmailError((prev) => {
        //   return { ...prev, emailsender: 'Enter Email' };
        // });
        objectErr['emailsender'] = 'Enter Email';
      }
      if (email.emailsender !== '' && !validateEmail(email.emailsender)) {
        // setEmailError((prev) => {
        //   return { ...prev, emailsender: 'Enter Valid Email' };
        // });
        objectErr['emailsender'] = 'Enter Valid Email';
      }
      setEmailError(objectErr);
      if (
        objectErr.smtp === '' &&
        objectErr.port === '' &&
        objectErr.username === '' &&
        objectErr.password === '' &&
        objectErr.emailsender === ''
      ) {
        const data = {
          config_name: 'email',
          config_settings: {
            server: email.smtp,
            port: email.port,
            username: email.username,
            password: email.password,
            sender_email: email.emailsender
          }
        };
        dispatchGetAllAlertEmail(data);
      }
    } else if (data[2] === 'slack') {
      console.log(webhookUrl);
      if (webhookUrl !== '' && webhookUrl !== null) {
        const slackData = {
          config_name: 'slack',
          config_settings: {
            webhook_url: webhookUrl
          }
        };
        dispatchGetAllAlertEmail(slackData);
      } else {
        setWebhookUrlError(true);
      }
    }
  };

  const onChangeHandler = (e) => {
    const { name } = e.target;
    setEmailError((prev) => {
      return {
        ...prev,
        [name]: ''
      };
    });
  };
  const dispatchGetAllAlertEmail = (data) => {
    dispatch(getAllAlertEmail(data));
  };

  if (editLoading) {
    return (
      <div className="loader">
        <div className="loading-text">
          <p>loading</p>
          <span></span>
        </div>
      </div>
    );
  } else {
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
                value={webhookUrl}
                onChange={(e) => {
                  setWebhookUrl(e.target.value);
                  setWebhookUrlError(false);
                }}
              />
              {webhookUrlError && (
                <div className="connection__fail">
                  <p>Enter Webhook URL</p>
                </div>
              )}
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
                name="smtp"
                value={email.smtp}
                onChange={(e) => {
                  setEmail((prev) => {
                    return { ...prev, smtp: e.target.value };
                  });
                  onChangeHandler(e);
                }}
              />
              {emailError.smtp !== '' ? (
                <div className="connection__fail">
                  <p>{emailError.smtp}</p>
                </div>
              ) : null}
            </div>
            <div className="form-group">
              <label>Port *</label>
              <input
                type="number"
                min="0"
                className="form-control"
                placeholder="Enter Port"
                name="port"
                value={email.port}
                onChange={(e) => {
                  setEmail((prev) => {
                    return { ...prev, port: e.target.value };
                  });
                  onChangeHandler(e);
                }}
              />
              {emailError.port !== '' ? (
                <div className="connection__fail">
                  <p>{emailError.port}</p>
                </div>
              ) : null}
            </div>
            <div className="form-group">
              <label>Username *</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter Username"
                name="username"
                value={email.username}
                onChange={(e) => {
                  setEmail((prev) => {
                    return { ...prev, username: e.target.value };
                  });
                  onChangeHandler(e);
                }}
              />
              {emailError.username !== '' ? (
                <div className="connection__fail">
                  <p>{emailError.username}</p>
                </div>
              ) : null}
            </div>
            <div className="form-group">
              <label>Password *</label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter Password"
                name="password"
                value={email.password}
                onChange={(e) => {
                  setEmail((prev) => {
                    return { ...prev, password: e.target.value };
                  });
                  onChangeHandler(e);
                }}
              />
              {emailError.password !== '' ? (
                <div className="connection__fail">
                  <p>Enter password</p>
                </div>
              ) : null}
            </div>
            <div className="form-group">
              <label>Email Sender *</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter Email"
                name="emailsender"
                value={email.emailsender}
                onChange={(e) => {
                  setEmail((prev) => {
                    return { ...prev, emailsender: e.target.value };
                  });
                  onChangeHandler(e);
                }}
              />
              {emailError.emailsender !== '' ? (
                <div className="connection__fail">
                  <p>{emailError.emailsender}</p>
                </div>
              ) : null}
            </div>
          </>
        ) : null}

        <div className="form-action">
          {/* <Link to="/alerts/channelconfiguration">
          <button className="btn white-button btn-spacing">
            <span>Cancel</span>
          </button>
        </Link> */}
          <button
            className={
              emailLoading ? 'btn black-button btn-loading' : 'btn black-button'
            }
            onClick={() => alertHandler()}>
            <div className="btn-spinner">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <span>Loading...</span>
            </div>
            <div className="btn-content">
              <span>Save</span>
            </div>
          </button>
        </div>
      </>
    );
  }
};
export default AlertsForm;
