import React, { useState, useEffect } from 'react';

import { useHistory } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';

import Slack from '../../assets/images/alerts/slack.svg';
import Email from '../../assets/images/alerts/gmail.svg';
import Edit from '../../assets/images/disable-edit.svg';

import {
  getAllAlertEmail,
  getEditChannel,
  getEmailMetaInfo,
  getSlackMetaInfo
} from '../../redux/actions';
import { toastMessage } from '../../utils/toast-helper';
import { ToastContainer, toast } from 'react-toastify';
const AlertsForm = () => {
  const history = useHistory();

  const data = history.location.pathname.split('/');

  const {
    emailLoading,
    editLoading,
    emailData,
    editData,
    emailMetaInfoData,
    emailMetaInfoLoading,
    slackMetaInfoData,
    slackMetaInfoLoading
  } = useSelector((state) => {
    return state.alert;
  });

  const dispatch = useDispatch();
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookUrlError, setWebhookUrlError] = useState(false);
  const [editedWebhookUrl, setEditedWebhookUrl] = useState('');
  const [slackEdit, setSlackEdit] = useState(true);

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

  const [enabled, setEnabled] = useState({
    smtp: true,
    port: true,
    username: true,
    password: true,
    emailsender: true
  });

  const [sensitiveData, setSensitveData] = useState({
    smtp: '',
    port: '',
    username: '',
    password: '',
    emailsender: ''
  });

  useEffect(() => {
    if (data[4] === 'edit') {
      dispatch(getSlackMetaInfo());
      if (data[3] === 'slack') {
        dispatch(
          getEditChannel({
            config_name: 'slack'
          })
        );
      } else if (data[3] === 'email') {
        dispatch(getEmailMetaInfo());
        dispatch(
          getEditChannel({
            config_name: 'email'
          })
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (data[3] === 'email' && editData) {
      var obj = { ...email };
      obj['port'] = editData?.config_setting?.port || '';
      obj['emailsender'] = editData?.config_setting?.sender_email || '';
      obj['smtp'] = editData?.config_setting?.server || '';
      setEmail(obj);
    } else if (data[3] === 'slack' && editData) {
      setWebhookUrl(editData?.config_setting?.webhookUrl || null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editData]);

  useEffect(() => {
    if (emailData && emailData.status === 'success') {
      toastMessage({ type: 'success', message: 'Successfully updated' });
    } else if (emailData && emailData.status === 'failed') {
      toastMessage({ type: 'error', message: 'Failed to update' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailData]);

  const validateEmail = (email) => {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/; //eslint-disable-line
    return re.test(String(email).toLowerCase());
  };

  const alertHandler = () => {
    if (data[3] === 'email') {
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
    } else if (data[3] === 'slack') {
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
    if (enabled[name]) {
      setEmail((prev) => {
        return {
          ...prev,
          [name]: e.target.value
        };
      });
      setEmailError((prev) => {
        return {
          ...prev,
          [name]: ''
        };
      });
    } else {
      setEmailError((prev) => {
        return {
          ...prev,
          [name]: ''
        };
      });
      setSensitveData((prev) => {
        return { ...prev, [name]: e.target.value };
      });
    }
  };

  const onSaveInput = (name) => {
    setEmail({ ...email, [name]: sensitiveData[name] });
    setEnabled({ ...enabled, [name]: true });
  };

  const onCancelInput = (name) => {
    setEnabled({ ...enabled, [name]: true });
    setSensitveData({ ...sensitiveData, [name]: '' });
  };

  const dispatchGetAllAlertEmail = (data) => {
    dispatch(getAllAlertEmail(data));
  };

  const editableStatus = (type) => {
    var status = '';
    emailMetaInfoData &&
      emailMetaInfoData.length !== 0 &&
      emailMetaInfoData.fields.find((field) => {
        if (field.name === type) {
          status =
            field.is_editable && field.is_sensitive
              ? 'sensitive'
              : field.is_editable
              ? 'editable'
              : '';
        }
        return '';
      });
    return status;
  };

  const editAndSaveButton = (name) => {
    return (
      <>
        {enabled[name] ? (
          <button
            className="btn black-button"
            onClick={() => setEnabled({ ...enabled, [name]: false })}>
            <img src={Edit} alt="Edit" />
            <span>Edit</span>
          </button>
        ) : (
          <>
            <button
              className="btn black-button"
              onClick={() => onSaveInput(name)}>
              <span>Save</span>
            </button>
            <button
              className="btn black-secondary-button"
              onClick={() => onCancelInput(name)}>
              <span>Cancel</span>
            </button>
          </>
        )}
      </>
    );
  };

  const slackEditableStatus = (type) => {
    var status = '';
    slackMetaInfoData &&
      slackMetaInfoData.length !== 0 &&
      slackMetaInfoData.fields.find((field) => {
        if (field.name === type) {
          status =
            field.is_editable && field.is_sensitive
              ? 'sensitive'
              : field.is_editable
              ? 'editable'
              : '';
        }
        return '';
      });
    return status;
  };

  if (editLoading || emailMetaInfoLoading || slackMetaInfoLoading) {
    return (
      <div className="load">
        <div className="preload"></div>
      </div>
    );
  } else {
    return (
      <>
        {data[3] === 'slack' ? (
          <>
            <div className="form-group form-title-image">
              <img src={Slack} alt="Slack" />
            </div>
            <div className="form-group">
              <label>Webhook URL *</label>
              <div className="editable-field">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter Webhook URL"
                  value={slackEdit ? webhookUrl : editedWebhookUrl}
                  disabled={
                    data[4] === 'edit'
                      ? slackEditableStatus('webhook_url') === 'editable'
                        ? false
                        : slackEditableStatus('webhook_url') === 'sensitive'
                        ? slackEdit
                        : true
                      : false
                  }
                  onChange={(e) => {
                    if (slackEdit) {
                      setWebhookUrl(e.target.value);
                      setWebhookUrlError(false);
                    } else {
                      setEditedWebhookUrl(e.target.value);
                    }
                  }}
                />
                {data[4] === 'edit' &&
                  slackEditableStatus('webhook_url') === 'sensitive' &&
                  (slackEdit ? (
                    <button
                      className="btn black-button"
                      onClick={() => setSlackEdit(false)}>
                      <img src={Edit} alt="Edit" />
                      <span>Edit</span>
                    </button>
                  ) : (
                    <>
                      <button
                        className="btn black-button"
                        onClick={() => {
                          setWebhookUrl(editedWebhookUrl);
                          setSlackEdit(true);
                        }}>
                        <span>Save</span>
                      </button>
                      <button
                        className="btn black-secondary-button"
                        onClick={() => {
                          setSlackEdit(true);
                          setEditedWebhookUrl('');
                        }}>
                        <span>Cancel</span>
                      </button>
                    </>
                  ))}
              </div>
              {webhookUrlError && (
                <div className="connection__fail">
                  <p>Enter Webhook URL</p>
                </div>
              )}
            </div>
          </>
        ) : data[3] === 'email' ? (
          <>
            <div className="form-group form-title-image">
              <img src={Email} alt="Email" />
            </div>
            <div className="form-group">
              <label>SMTP server *</label>
              <div className="editable-field">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter SMTP server"
                  name="smtp"
                  value={enabled.smtp ? email.smtp : sensitiveData.smtp}
                  disabled={
                    data[4] === 'edit'
                      ? editableStatus('server') === 'editable'
                        ? false
                        : editableStatus('server') === 'sensitive'
                        ? enabled.smtp
                        : true
                      : false
                  }
                  onChange={(e) => {
                    onChangeHandler(e);
                  }}
                />
                {data[4] === 'edit' &&
                  editableStatus('server') === 'sensitive' &&
                  editAndSaveButton('server')}
              </div>
              {emailError.smtp !== '' ? (
                <div className="connection__fail">
                  <p>{emailError.smtp}</p>
                </div>
              ) : null}
            </div>
            <div className="form-group">
              <label>Port *</label>
              <div className="editable-field">
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  placeholder="Enter Port"
                  name="port"
                  disabled={
                    data[4] === 'edit'
                      ? editableStatus('port') === 'editable'
                        ? false
                        : editableStatus('port') === 'sensitive'
                        ? enabled.port
                        : true
                      : false
                  }
                  value={enabled.port ? email.port : sensitiveData.port}
                  onChange={(e) => {
                    onChangeHandler(e);
                  }}
                />
                {data[4] === 'edit' &&
                  editableStatus('port') === 'sensitive' &&
                  editAndSaveButton('port')}
              </div>
              {emailError.port !== '' ? (
                <div className="connection__fail">
                  <p>{emailError.port}</p>
                </div>
              ) : null}
            </div>
            <div className="form-group">
              <label>Username *</label>
              <div className="editable-field">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter Username"
                  name="username"
                  disabled={
                    data[4] === 'edit'
                      ? editableStatus('username') === 'editable'
                        ? false
                        : editableStatus('username') === 'sensitive'
                        ? enabled.username
                        : true
                      : false
                  }
                  value={
                    enabled.username ? email.username : sensitiveData.username
                  }
                  onChange={(e) => {
                    onChangeHandler(e);
                  }}
                />
                {data[4] === 'edit' &&
                  editableStatus('username') === 'sensitive' &&
                  editAndSaveButton('username')}
              </div>
              {emailError.username !== '' ? (
                <div className="connection__fail">
                  <p>{emailError.username}</p>
                </div>
              ) : null}
            </div>
            <div className="form-group">
              <label>Password *</label>
              <div className="editable-field">
                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter Password"
                  name="password"
                  value={
                    enabled.password ? email.password : sensitiveData.password
                  }
                  disabled={
                    data[4] === 'edit'
                      ? editableStatus('password') === 'editable'
                        ? false
                        : editableStatus('password') === 'sensitive'
                        ? enabled.password
                        : true
                      : false
                  }
                  onChange={(e) => {
                    onChangeHandler(e);
                  }}
                />
                {data[4] === 'edit' &&
                  editableStatus('password') === 'sensitive' &&
                  editAndSaveButton('password')}
              </div>
              {emailError.password !== '' ? (
                <div className="connection__fail">
                  <p>Enter password</p>
                </div>
              ) : null}
            </div>
            <div className="form-group">
              <label>Email Sender *</label>
              <div className="editable-field">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter Email"
                  name="emailsender"
                  value={
                    enabled.emailsender
                      ? email.emailsender
                      : sensitiveData.emailsender
                  }
                  disabled={
                    data[4] === 'edit'
                      ? editableStatus('sender_email') === 'editable'
                        ? false
                        : editableStatus('sender_email') === 'sensitive'
                        ? enabled.emailsender
                        : true
                      : false
                  }
                  onChange={(e) => {
                    onChangeHandler(e);
                  }}
                />
                {data[4] === 'edit' &&
                  editableStatus('sender_email') === 'sensitive' &&
                  editAndSaveButton('emailsender')}
              </div>
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
        <ToastContainer
          position={toast.POSITION.BOTTOM_RIGHT}
          autoClose={5000}
        />
      </>
    );
  }
};
export default AlertsForm;
