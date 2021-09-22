import React, { useEffect, useState } from 'react';

import Select from 'react-select';

import { useDispatch, useSelector } from 'react-redux';

import { useHistory, useParams } from 'react-router-dom';

import Slack from '../../assets/images/table/slack.svg';
import Email from '../../assets/images/alerts/email.svg';
import Edit from '../../assets/images/disable-edit.svg';

import './kpialertdestinationform.scss';
import { createKpiAlert, updateKpiAlert } from '../../redux/actions';
//import { toastMessage } from '../../utils/toast-helper';
import TagsInput from 'react-tagsinput';

import 'react-tagsinput/react-tagsinput.css';
const customSingleValue = ({ data }) => (
  <div className="input-select">
    <div className="input-select__single-value">
      {data.icon && <span className="input-select__icon">{data.icon}</span>}
      <span>{data.label}</span>
    </div>
  </div>
);
const option = [
  {
    label: (
      <div className="optionlabel">
        <img src={Slack} alt="datasource" />
        Slack
      </div>
    ),
    value: 'slack'
  },
  {
    label: (
      <div className="optionlabel">
        <img src={Email} alt="datasource" />
        Email
      </div>
    ),
    value: 'email'
  }
];

const KpiAlertDestinationForm = ({
  event,
  setEventSteps,
  setKpiSteps,
  setAlertFormData,
  alertFormData,
  kpiAlertMetaInfo
}) => {
  const dispatch = useDispatch();
  const [resp, setresp] = useState([]);
  const history = useHistory();
  const kpiId = useParams().id;
  const path = history.location.pathname.split('/');
  //createKpiAlertData
  const { createKpiAlertLoading, updateKpiAlertLoading } = useSelector(
    (state) => {
      return state.alert;
    }
  );

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

  useEffect(() => {
    if (path[2] === 'edit') {
      setresp(
        alertFormData?.alert_channel_conf?.[alertFormData.alert_channel] || []
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onBack = () => {
    if (event) {
      setEventSteps(1);
    } else {
      setKpiSteps(1);
    }
  };

  const onKpiAlertSubmit = () => {
    var obj = { ...error };
    if (alertFormData.alert_channel === '') {
      obj['alert_channel'] = 'Enter Channel';
    }
    setError(obj);
    if (error.alert_channel === '') {
      if (path[2] === 'edit') {
        console.log('called');
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

  // useEffect(() => {
  //   if (createKpiAlertData && createKpiAlertData.status === 'success') {
  //     toastMessage({ type: 'success', message: 'Successfully created' });
  //   } else if (createKpiAlertData && createKpiAlertData.status === 'failure') {
  //     toastMessage({ type: 'success', message: 'Failed to create' });
  //   }
  // }, [createKpiAlertData]);

  const handleChange = (tags) => {
    setresp(tags);
    setAlertFormData((prev) => {
      return {
        ...prev,
        alert_channel_conf: {
          [alertFormData['alert_channel']]: tags
        }
      };
    });
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
              setError({ ...error, alert_channel: '' });
            }}
          />
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

      <div className="form-group">
        <label>Add Recepients </label>
        {/* <Select isMulti classNamePrefix="selectcategory" placeholder="Select" /> */}
        <div className="editable-field">
          <TagsInput
            value={resp}
            onChange={(e) => handleChange(e)}
            placeholder="Add Recepients"
          />
          {path[2] === 'edit' &&
            editableStatus('alert_channnel') === 'sensitive' &&
            editAndSaveButton('alert_channel')}
        </div>
      </div>
      <div className="add-options-wrapper options-spacing">
        <div className="add-options">
          <label>+ Add Another Channel</label>
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
