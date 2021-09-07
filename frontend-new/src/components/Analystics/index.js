import React, { useState } from 'react';

import Select from 'react-select';
import Tooltip from 'react-tooltip-lite';

import Help from '../../assets/images/help.svg';

import './analystics.scss';
import { kpiSettingSetup } from '../../redux/actions';
import { useDispatch, useSelector } from 'react-redux';

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

const Analystics = ({ kpi }) => {
  const dispatch = useDispatch();
  const [modelName, setModalName] = useState('');
  const [sensitivity, setSensitivity] = useState('');
  const [frequency, setFrequency] = useState('');
  const [seasonality, setSeasonality] = useState([]);
  const [error, setError] = useState({
    modelName: '',
    sensitivity: '',
    frequency: ''
  });
  const { kpiSettingLoading } = useSelector((state) => {
    return state.setting;
  });

  const onSettingSave = () => {
    var obj = { ...error };

    if (modelName === '') {
      obj['modelName'] = 'Enter Model';
    }
    if (sensitivity === '') {
      obj['sensitivity'] = 'Enter Sensitivity';
    }
    if (frequency === '') {
      obj['frequency'] = 'Enter Frequency';
    }
    setError(obj);
    if (
      obj.modelName === '' &&
      obj.sensitivity === '' &&
      obj.frequency === ''
    ) {
      const data = {
        anomaly_params: {
          anomaly_period: 90,
          model_name: modelName,
          sensitivity: sensitivity,
          seasonality: seasonality,
          frequency: frequency,
          scheduler_params: {
            time: '1 minute'
          }
        }
      };
      dispatch(kpiSettingSetup(kpi, data));
    }
  };

  const onSeasonalityChange = (e) => {
    if (e.target.checked) {
      let selected = seasonality.concat(e.target.value);
      setSeasonality(selected);
    } else if (e.target.checked === false) {
      const index = seasonality.indexOf(e.target.value);
      if (index > -1) {
        seasonality.splice(index, 1);
      }
    }
  };

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
            onChange={(e) => {
              setModalName(e.value);
              setError({ ...error, modelName: '' });
            }}
          />
          {error.modelName && (
            <div className="connection__fail">
              <p>{error.modelName}</p>
            </div>
          )}
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
            onChange={(e) => {
              setSensitivity(e.value);
              setError({ ...error, sensitivity: '' });
            }}
          />
          {error.sensitivity && (
            <div className="connection__fail">
              <p>{error.sensitivity}</p>
            </div>
          )}
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
            onChange={(e) => {
              setFrequency(e.value);
              setError({ ...error, frequency: '' });
            }}
          />
          {error.frequency && (
            <div className="connection__fail">
              <p>{error.frequency}</p>
            </div>
          )}
        </div>
        <div className="form-group">
          <label>Expected Seasonality in Data</label>
          <div className="seasonality-setting">
            <div className="form-check check-box">
              <input
                className="form-check-input"
                type="checkbox"
                value="M"
                name="Month"
                onChange={(e) => {
                  onSeasonalityChange(e);
                }}
              />
              <label for="Monthly">Monthly</label>
            </div>
            <div className="form-check check-box">
              <input
                className="form-check-input"
                type="checkbox"
                value="W"
                name="week"
                onChange={(e) => {
                  onSeasonalityChange(e);
                }}
              />
              <label for="Weekly">Weekly</label>
            </div>
            <div className="form-check check-box">
              <input
                className="form-check-input"
                type="checkbox"
                value="D"
                name="daily"
                onChange={(e) => {
                  onSeasonalityChange(e);
                }}
              />
              <label for="Daily">Daily</label>
            </div>
          </div>
        </div>
        <div className="form-action analystics-button">
          <button
            className={
              kpiSettingLoading
                ? 'btn black-button btn-loading'
                : 'btn black-button'
            }
            onClick={() => {
              onSettingSave();
            }}>
            <div className="btn-spinner">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <span>Loading...</span>
            </div>
            <div className="btn-content">
              <span>Set Up</span>
            </div>
          </button>
        </div>
      </div>
    </>
  );
};
export default Analystics;
