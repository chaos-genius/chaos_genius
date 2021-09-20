import React, { useEffect } from 'react';

import Select from 'react-select';

import { useDispatch, useSelector } from 'react-redux';

import Slack from '../../assets/images/table/slack.svg';
import Email from '../../assets/images/table/gmail.svg';

import './kpialertdestinationform.scss';
import { createKpiAlert } from '../../redux/actions';
import { toastMessage } from '../../utils/toast-helper';

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
  alertFormData
}) => {
  const dispatch = useDispatch();

  const { createKpiAlertData, createKpiAlertLoading } = useSelector((state) => {
    return state.alert;
  });

  const onBack = () => {
    if (event) {
      setEventSteps(1);
    } else {
      setKpiSteps(1);
    }
  };

  const onKpiAlertSubmit = () => {
    dispatch(createKpiAlert(alertFormData));
  };

  useEffect(() => {
    if (createKpiAlertData && createKpiAlertData.status === 'success') {
      toastMessage({ type: 'success', message: 'Successfully created' });
    } else if (createKpiAlertData && createKpiAlertData.status === 'failure') {
      toastMessage({ type: 'success', message: 'Failed to create' });
    }
  }, [createKpiAlertData]);

  return (
    <>
      <div className="form-group">
        <h5>Alert Destination</h5>
      </div>
      <div className="form-group">
        <label>Select Channel *</label>
        <Select
          options={option}
          classNamePrefix="selectcategory"
          placeholder="Select"
          components={{ SingleValue: customSingleValue }}
          onChange={(e) => {
            setAlertFormData({ ...alertFormData, alert_channel: e.value });
          }}
        />
      </div>

      <div className="form-group">
        <label>Add Recepients </label>
        <Select isMulti classNamePrefix="selectcategory" placeholder="Select" />
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
            createKpiAlertLoading
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
            <span>Add Alert</span>
          </div>
        </button>
      </div>
    </>
  );
};

export default KpiAlertDestinationForm;
