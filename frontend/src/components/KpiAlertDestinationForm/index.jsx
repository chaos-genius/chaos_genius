import React, { useEffect, useState } from 'react';

import Select from 'react-select';

import { useDispatch, useSelector } from 'react-redux';

import { useHistory, useParams, Link } from 'react-router-dom';

import Slack from '../../assets/images/table/slack.svg';
import Email from '../../assets/images/alerts/email.svg';
import Edit from '../../assets/images/disable-edit.svg';

import './kpialertdestinationform.scss';

import { createKpiAlert, updateKpiAlert } from '../../redux/actions';
import { useToast } from 'react-toast-wnm';

import { CustomContent, CustomActions } from '../../utils/toast-helper';

import TagsInput from 'react-tagsinput';

import 'react-tagsinput/react-tagsinput.css';

import { getChannelStatus } from '../../redux/actions';
import store from '../../redux/store';
import { EMAIL_REGEX } from '../../utils/regex-helper';

const customSingleValue = ({ data }) => (
  <div className="input-select">
    <div className="input-select__single-value">
      {data.icon && <span className="input-select__icon">{data.icon}</span>}
      <span>{data.label}</span>
    </div>
  </div>
);
const RESET_ACTION = {
  type: 'RESET_ALERT_DATA_Data'
};

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

const KpiAlertDestinationForm = ({
  setKpiSteps,
  setAlertFormData,
  alertFormData,
  kpiAlertMetaInfo
}) => {
  const dispatch = useDispatch();

  const toast = useToast();
  const [resp, setresp] = useState([]);
  const history = useHistory();
  const kpiId = useParams().id;
  const path = history.location.pathname.split('/');
  const [option, setOption] = useState([]);
  const [channelName, setChannelName] = useState('');

  const {
    createKpiAlertLoading,
    updateKpiAlertLoading,
    createKpiAlertData,
    updateKpiAlertData,
    channelStatusData
  } = useSelector((state) => {
    return state.alert;
  });

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

  const [field, setField] = useState('');

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
        setChannelName(data?.config_setting.channel_name || ' ');
      }
    });
  }, [channelStatusData]);

  useEffect(() => {
    if (createKpiAlertData && createKpiAlertData.status === 'success') {
      history.push('/alerts');
      customToast({
        type: 'success',
        header: 'Successfully created'
      });
    } else if (createKpiAlertData && createKpiAlertData.status === 'failure') {
      customToast({
        type: 'error',
        header: 'Failed to create alert',
        description: createKpiAlertData.message
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createKpiAlertData]);

  useEffect(() => {
    if (updateKpiAlertData && updateKpiAlertData.status === 'success') {
      customToast({
        type: 'success',
        header: 'Successfully updated'
      });
    } else if (updateKpiAlertData && updateKpiAlertData.status === 'failure') {
      customToast({
        type: 'error',
        header: 'Failed to update selected alert',
        description: updateKpiAlertData.message
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateKpiAlertData]);

  const onBack = () => {
    store.dispatch(RESET_ACTION);
    setKpiSteps(1);
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

  const handleDigestClick = (e) => {
    setAlertFormData((prev) => {
      return {
        ...prev,
        daily_digest: e.target.value === 'true' //converting string to boolean
      };
    });
  };

  const customToast = (data) => {
    const { type, header, description } = data;
    toast({
      autoDismiss: true,
      enableAnimation: true,
      delay: type === 'success' ? '5000' : '30000',
      backgroundColor: type === 'success' ? '#effaf5' : '#FEF6F5',
      borderRadius: '6px',
      color: '#222222',
      position: 'bottom-right',
      minWidth: '240px',
      width: 'auto',
      boxShadow: '4px 6px 32px -2px rgba(226, 226, 234, 0.24)',
      padding: '17px 14px',
      height: 'auto',
      border: type === 'success' ? '1px solid #60ca9a' : '1px solid #FEF6F5',
      type: type,
      actions: <CustomActions />,
      content: (
        <CustomContent
          header={header}
          description={description}
          failed={type === 'success' ? false : true}
        />
      )
    });
  };

  const onKpiAlertSubmit = () => {
    var obj = { ...error };
    if (alertFormData.alert_channel === '') {
      obj['alert_channel'] = 'Enter Channel';
    }
    setError(obj);
    if (obj.alert_channel === '') {
      if (path[2] === 'edit') {
        dispatch(updateKpiAlert(kpiId, alertFormData));
      } else {
        dispatch(createKpiAlert(alertFormData));
      }
    }
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
            components={{ SingleValue: customSingleValue }}
            onChange={(e) => {
              setAlertFormData({ ...alertFormData, alert_channel: e.value });
              setField(e.value);
              setError({ ...error, alert_channel: '' });
            }}
          />

          {path[2] === 'edit' &&
            editableStatus('alert_channnel') === 'sensitive' &&
            editAndSaveButton('alert_channel')}
        </div>
        <div className="channel-tip">
          <p>
            Tip: Go to{' '}
            <Link to="/alerts/channelconfiguration">Channel configuration</Link>{' '}
            to connect channel
          </p>
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
            <TagsInput
              value={resp}
              inputProps={{
                className: 'react-tagsinput-input',
                placeholder: 'Add Recepients'
              }}
              onChange={(e) => handleChange(e, 'email')}
              validationRegex={EMAIL_REGEX}
              onValidationReject={() =>
                customToast({
                  type: 'error',
                  header: 'Invalid Email',
                  description: 'Please enter a valid email ID'
                })
              }
            />

            {path[2] === 'edit' &&
              editableStatus('alert_channnel') === 'sensitive' &&
              editAndSaveButton('alert_channel')}
          </div>
        </div>
      ) : field === 'slack' ? (
        <div className="form-group">
          <label>Channel name</label>
          <div className="editable-field">
            <input
              type="text"
              className="form-control"
              disabled={true}
              value={channelName}
            />
          </div>
        </div>
      ) : (
        ''
      )}
      <div className="form-group form-group-label-margin">
        <label>Send As *</label>

        <div className="alert-setting event-alert-send-setting">
          <div className="form-check">
            <input
              className="form-check-input"
              type="radio"
              id="individualalert"
              name="alert"
              value={false}
              checked={alertFormData.daily_digest === false ? true : false}
              onClick={(e) => handleDigestClick(e)}
            />
            <label
              className={`form-check-label ${
                alertFormData.daily_digest === false ? 'active' : ''
              } `}
              for="individualalert">
              individual alert
            </label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="radio"
              id="consolidatedalertsreport"
              name="alert"
              value={true}
              checked={alertFormData.daily_digest === false ? false : true}
              onClick={(e) => handleDigestClick(e)}
            />
            <label
              className={`form-check-label ${
                alertFormData.daily_digest === false ? '' : 'active'
              } `}
              for="consolidatedalertsreport">
              consolidated alerts report
            </label>
          </div>
        </div>
      </div>
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
          onClick={() => onKpiAlertSubmit()}>
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

export default KpiAlertDestinationForm;
