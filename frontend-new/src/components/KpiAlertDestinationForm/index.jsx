import React from 'react';

import Select from 'react-select';

import './kpialertdestinationform.scss';
import Slack from '../../assets/images/table/slack.svg';
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
    value: 'Slack'
  }
];
const KpiAlertDestinationForm = ({ event, setEventSteps, setKpiSteps }) => {
  const onBack = () => {
    if (event) {
      setEventSteps(1);
    } else {
      setKpiSteps(1);
    }
  };
  return (
    <div>
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
        <button className="btn black-button">
          <span>Add Alert</span>
        </button>
      </div>
    </div>
  );
};

export default KpiAlertDestinationForm;
