import React from 'react';

import Select from 'react-select';
import Tooltip from 'react-tooltip-lite';

import Help from '../../assets/images/help.svg';

import './analystics.scss';

const modalOptions = [
  { value: 'prophet', label: 'Prophet' },
  { value: 'Standard Deviation', label: 'Standard Deviation' },
  { value: 'NeuralProphet ', label: 'NeuralProphet ' },
  { value: 'Greykite ', label: 'Greykite ' }
];

const sensitivityOptions = [
  { value: 'High', label: 'High' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Low', label: 'Low' }
];

const frequencyOptions = [
  { value: 'daily', label: 'Daily' },
  { value: 'hourly', label: 'Hourly' }
];

const Analystics = () => {
  return (
    <>
      <div className="dashboard-subheader">
        <div className="common-tab configure-tab">
          <ul>
            <li>Configure Anomoly Detector for Selected KPI</li>
          </ul>
        </div>
      </div>
      <div className="form-container">
        <div className="form-group">
          <label>Time Window</label>
          <input
            type="text"
            className="form-control"
            placeholder="90 Days"
            disabled
          />
        </div>
        <div className="form-group">
          <label>Model Frequency</label>
          <input
            type="text"
            className="form-control"
            placeholder="Daily"
            disabled
          />
        </div>
        <div className="form-group">
          <label>Select a Model</label>
          <Select
            options={modalOptions}
            classNamePrefix="selectcategory"
            placeholder="select"
            isSearchable={false}
          />
        </div>
        <div className="form-group">
          <label className="help-label">
            Sensitivity
            <Tooltip
              className="sensitivity-tooltip"
              direction="right"
              content={
                <span>
                  High sensitivity leads to high granularity detection leading
                  and higher number of alerts
                </span>
              }>
              <img src={Help} alt="Help" />
            </Tooltip>
          </label>
          <Select
            options={sensitivityOptions}
            classNamePrefix="selectcategory"
            placeholder="select"
            isSearchable={false}
          />
        </div>
        <div className="form-group">
          <label className="help-label">
            Time Series Frequency
            <Tooltip
              className="timeseriesfrequency-tooltip"
              direction="right"
              content={
                <span>
                  time series granularity to be considered for anomaly detection
                </span>
              }>
              <img src={Help} alt="Help" />
            </Tooltip>
          </label>
          <Select
            options={frequencyOptions}
            classNamePrefix="selectcategory"
            placeholder="select"
            isSearchable={false}
          />
        </div>
        <div className="form-group">
          <label>Expected Seasonality in Data</label>
          <div className="seasonality-setting">
            <div className="form-check check-box">
              <input
                className="form-check-input"
                type="checkbox"
                value="Monthly"
              />
              <label for="Monthly">Monthly</label>
            </div>
            <div className="form-check check-box">
              <input
                className="form-check-input"
                type="checkbox"
                value="Weekly"
              />
              <label for="Weekly">Weekly</label>
            </div>
            <div className="form-check check-box">
              <input
                className="form-check-input"
                type="checkbox"
                value="Daily"
              />
              <label for="Daily">Daily</label>
            </div>
          </div>
        </div>
        <div className="form-action analystics-button">
          <button className="btn black-button">
            <span>Set Up</span>
          </button>
        </div>
      </div>
    </>
  );
};
export default Analystics;
