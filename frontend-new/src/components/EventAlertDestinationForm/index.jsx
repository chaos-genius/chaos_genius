import React, { useState, useEffect } from 'react';

import Select from 'react-select';

import { useHistory, Link, useParams } from 'react-router-dom';

import Slack from '../../assets/images/table/slack.svg';
import Email from '../../assets/images/alerts/email.svg';
import Edit from '../../assets/images/disable-edit.svg';

import './eventalertdestinationform.scss';

import {
  getChannelStatus,
  createKpiAlert,
  updateKpiAlert
} from '../../redux/actions';

import ReactTagInput from '@pathofdev/react-tag-input';
import '@pathofdev/react-tag-input/build/index.css';
import { useDispatch, useSelector } from 'react-redux';

const customSingleValue = ({ data }) => (
  <div className="input-select">
    <div className="input-select__single-value">
      {data.icon && <span className="input-select__icon">{data.icon}</span>}
      <span>{data.label}</span>
    </div>
  </div>
);

const getOption = (channel) => {
  return {
    label: (
      <div className="optionlabel">
        <img src={channel === 'email' ? Email : Slack} alt="datasource" />
        {channel}
      </div>
    ),
    value: channel
  };
};

const EventAlertDestinationForm = ({
  setEventSteps,
  alertFormData,
  setAlertFormData,
  kpiAlertMetaInfo
}) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const kpiId = useParams().id;
  const path = history.location.pathname.split('/');

  const {
    createKpiAlertLoading,
    updateKpiAlertLoading,
    channelStatusData
  } = useSelector((state) => {
    return state.alert;
  });

  const [resp, setresp] = useState([]);
  const [option, setOption] = useState([]);
  const [field, setField] = useState('');
  const [channelName, setChannelName] = useState('');

  const [error, setError] = useState({
    alert_channel: '',
    add_recepients: ''
  });

  const [enabled, setEnabled] = useState({
    alert_channel: true,
    add_recepients: true
  });

  const [sensitiveData, setSensitveData] = useState({
    alert_channel: '',
    add_recepients: ''
  });

  const onBack = () => {
    setEventSteps(1);
  };

  useEffect(() => {
    dispatch(getChannelStatus());
  }, [dispatch]);

  useEffect(() => {
    if (path[2] === 'edit') {
      setField(alertFormData?.alert_channel);

      if (alertFormData?.alert_channel === 'email') {
        setresp(
          alertFormData?.alert_channel_conf?.[alertFormData.alert_channel] || []
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (channelStatusData && channelStatusData.length !== 0) {
      setOption(
        channelStatusData.map((channel) => {
          return getOption(channel.name);
        })
      );
    }
    channelStatusData.forEach((data) => {
      if (data.name === 'slack') {
        setChannelName(data?.config_setting.channel_name || '');
      }
    });
  }, [channelStatusData]);

  const handleChange = (tags) => {
    if (field === 'email') {
      setresp(tags);
      setAlertFormData((prev) => {
        return {
          ...prev,
          alert_channel_conf: {
            [alertFormData['alert_channel']]: tags
          }
        };
      });
    }
  };

  const validateEmail = (email) => {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/; //eslint-disable-line
    return re.test(String(email).toLowerCase());
  };

  const onSubmit = () => {
    var obj = { ...error };
    if (alertFormData.alert_channel === '') {
      obj['alert_channel'] = 'Enter Channel';
    }
    setError(obj);
    if (error.alert_channel === '') {
      if (path[2] === 'edit') {
        dispatch(updateKpiAlert(kpiId, alertFormData));
      } else {
        dispatch(createKpiAlert(alertFormData));
      }
    }
  };

  const editableStatus = (type) => {
    var status = '';
    kpiAlertMetaInfo &&
      kpiAlertMetaInfo.length !== 0 &&
      kpiAlertMetaInfo.fields.find((field) => {
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

  const onSaveInput = (name) => {
    setEnabled({ ...enabled, [name]: true });
  };

  const onCancelInput = (name) => {
    setEnabled({ ...enabled, [name]: true });
    setSensitveData({ ...sensitiveData, [name]: '' });
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

  return (
    <>
      <div className="form-group">
        <h5>Alert Destination</h5>
      </div>
      <div className="form-group">
        <label>Select Channel *</label>
        <div className="editable-field">
          <Select
            options={option}
            classNamePrefix="selectcategory"
            placeholder="Select"
            components={{ SingleValue: customSingleValue }}
            isDisabled={
              path[2] === 'edit'
                ? editableStatus('alert_channel') === 'editable'
                  ? false
                  : editableStatus('alert_channel') === 'sensitive'
                  ? enabled.alert_channel
                  : true
                : false
            }
            value={
              enabled.alert_channel
                ? alertFormData.alert_channel
                  ? {
                      label: (
                        <div className="optionlabel">
                          <img
                            src={
                              alertFormData.alert_channel === 'email'
                                ? Email
                                : Slack
                            }
                            alt="datasource"
                          />
                          {alertFormData.alert_channel}
                        </div>
                      ),
                      value: `${alertFormData.alert_channel}`
                    }
                  : 'none'
                : sensitiveData.alert_channel
            }
            onChange={(e) => {
              setAlertFormData({ ...alertFormData, alert_channel: e.value });
              setField(e.value);
              setError({ ...error, alert_channel: '' });
            }}
          />
        </div>
        <div className="channel-tip">
          <p>
            Tip: Go to{' '}
            <Link to="/alerts/channelconfiguration">Channel configuration</Link>{' '}
            to connect channel
          </p>
          {path[2] === 'edit' &&
            editableStatus('alert_channnel') === 'sensitive' &&
            editAndSaveButton('alert_channel')}
        </div>
        {error.alert_channel && (
          <div className="connection__fail">
            <p>{error.alert_channel}</p>
          </div>
        )}
      </div>
      {field === 'email' ? (
        <div className="form-group">
          <label>Add Recepients </label>
          <div className="editable-field">
            <ReactTagInput
              tags={resp}
              placeholder="Add Recepients"
              onChange={(newTags) => handleChange(newTags, 'email')}
              validator={(value) => {
                const isEmail = validateEmail(value);
                if (!isEmail) {
                }
                // Return boolean to indicate validity
                return isEmail;
              }}
            />
          </div>
        </div>
      ) : field === 'slack' ? (
        <div className="form-group">
          <label>Channel name</label>
          <div className="editable-field">
            <input
              type="text"
              className="form-control"
              placeholder="Channel Name"
              disabled={true}
              value={channelName}
            />
          </div>
        </div>
      ) : (
        ''
      )}
      {/* commented add another channel*/}
      {/*Add empty space div*/}
      <div className="add-options-wrapper options-spacing"></div>
      <div className="form-action alerts-button">
        <button className="btn white-button" onClick={() => onBack()}>
          <span>Back</span>
        </button>
        <button
          className={
            createKpiAlertLoading || updateKpiAlertLoading
              ? 'btn black-button btn-loading'
              : 'btn black-button'
          }
          onClick={() => onSubmit()}>
          <div className="btn-spinner">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <span>Loading...</span>
          </div>
          <div className="btn-content">
            <span>{path[2] === 'edit' ? 'Save changes' : 'Add Alert'} </span>
          </div>
        </button>
      </div>
    </>
  );
};

export default EventAlertDestinationForm;
