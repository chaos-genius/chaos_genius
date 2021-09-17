import React, { useState } from 'react';

import Select from 'react-select';

import './eventalertform.scss';

import Play from '../../assets/images/play-green.png';

const customSingleValue = ({ data }) => (
  <div className="input-select">
    <div className="input-select__single-value">
      {data.icon && <span className="input-select__icon">{data.icon}</span>}
      <span>{data.label}</span>
    </div>
  </div>
);

const EventAlertForm = ({ setSteps }) => {
  const [setting, setSetting] = useState('');
  const onSubmit = () => {
    setSteps(2);
  };
  return (
    <>
      <div className="form-group">
        <label>Name Of Your Alert *</label>
        <input
          type="text"
          className="form-control"
          placeholder="Enter Alert Name"
          required
        />
      </div>
      <div className="form-group">
        <label>Select Data Source*</label>
        <Select
          classNamePrefix="selectcategory"
          placeholder="Select Data Source"
          components={{ SingleValue: customSingleValue }}
        />
      </div>
      <div className="form-group query-form">
        <label>Query *</label>
        <textarea placeholder="Enter Query"></textarea>
        <div className="test-query-connection">
          <div className="test-query">
            <span>
              <img src={Play} alt="Play" />
              Test Query
            </span>
          </div>
        </div>
      </div>
      <div className="form-group">
        <label>Alert Frequency *</label>
        <Select classNamePrefix="selectcategory" placeholder="Daily" />
      </div>

      <div className="form-group">
        <label>Alert Settings *</label>
        <div className="alert-setting">
          <div className="form-check">
            <input
              className="form-check-input"
              type="radio"
              id="newentry"
              name="alert"
              value="newentry"
              onChange={(e) => {
                setSetting(e.target.value);
              }}
            />
            <label
              className={
                setting === 'newentry'
                  ? 'form-check-label active'
                  : 'form-check-label'
              }
              for="newentry">
              New Entry
            </label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="radio"
              id="allchanges"
              name="alert"
              value="allchanges"
              onChange={(e) => {
                setSetting(e.target.value);
              }}
            />
            <label
              className={
                setting === 'allchanges'
                  ? 'form-check-label active'
                  : 'form-check-label'
              }
              for="allchanges">
              All Changes
            </label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="radio"
              id="alwayssend"
              name="alert"
              value="alwayssend"
              onChange={(e) => setSetting(e.target.value)}
            />
            <label
              className={
                setting === 'alwayssend'
                  ? 'form-check-label active'
                  : 'form-check-label'
              }
              for="alwayssend">
              Always Send
            </label>
          </div>
        </div>
      </div>
      <div className="form-group ">
        <label>Message Body *</label>
        <textarea placeholder="Enter Message Here"></textarea>
      </div>
      <div className="form-action">
        <button className="btn black-button" onClick={() => onSubmit()}>
          <span>Next Step</span>
        </button>
      </div>
    </>
  );
};
export default EventAlertForm;
