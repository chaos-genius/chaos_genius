import React from 'react';
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

const EventAlertForm = () => {
  return (
    <div>
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
        <div className="radio-group">
          <div className="form-check active">
            <input
              type="radio"
              name="setting"
              id="newentry"
              className="form-check-input"></input>
            <label hrmlFor="newentry">New Entry</label>
          </div>
          <div className="form-check">
            <input
              type="radio"
              name="setting"
              id="allchanges"
              className="form-check-input"></input>
            <label htmlFor="allchanges">All Changes</label>
          </div>
          <div className="form-check">
            <input
              type="radio"
              name="setting"
              id="alwayssend"
              className="form-check-input"></input>
            <label htmlFor="alwayssend">Always Send</label>
          </div>
        </div>
      </div>
      <div className="form-group ">
        <label>Message Body *</label>
        <textarea placeholder="Enter Message Here"></textarea>
      </div>
      <div className="form-action">
        <button className="btn black-button">
          <span>Add Alert</span>
        </button>
      </div>
    </div>
  );
};
export default EventAlertForm;
