import React, { useState, useEffect } from 'react';

import Select from 'react-select';
import Tooltip from 'react-tooltip-lite';
import Modal from 'react-modal';

import moment from 'moment';

import TimePicker from 'rc-time-picker';
import 'rc-time-picker/assets/index.css';

import Help from '../../assets/images/help.svg';
import Close from '../../assets/images/close.svg';
import Success from '../../assets/images/successful.svg';

import './analystics.scss';

import { kpiSettingSetup, kpiEditSetup } from '../../redux/actions';
import { useDispatch, useSelector } from 'react-redux';

import { toastMessage } from '../../utils/toast-helper';
import { ToastContainer, toast } from 'react-toastify';

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

const Analystics = ({ kpi, setAnalystics, onboarding }) => {
  const dispatch = useDispatch();

  const [modelName, setModalName] = useState('');
  const [Sensitivity, setSensitivity] = useState('');
  const [frequency, setFrequency] = useState('');
  const [seasonality, setSeasonality] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);

  const [schedule, setSchedule] = useState(moment());

  const [error, setError] = useState({
    modelName: '',
    sensitivity: '',
    frequency: ''
  });

  const { kpiEditData, kpiEditLoading, kpiSettingLoading, kpiSettingData } =
    useSelector((state) => {
      return state.setting;
    });

  useEffect(() => {
    dispatch(kpiEditSetup(kpi));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kpi]);

  useEffect(() => {
    if (kpiEditData && kpiEditData?.anomaly_params !== null) {
      setSensitivity(kpiEditData?.anomaly_params?.sensitivity || '');
      setModalName(kpiEditData?.anomaly_params?.model_name || '');
      setFrequency(kpiEditData?.anomaly_params?.frequency || '');
      setSeasonality(kpiEditData?.anomaly_params?.seasonality || []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kpiEditData]);

  useEffect(() => {
    if (kpiSettingData && kpiSettingData.status === 'success' && onboarding) {
      setAnalystics(true);
    } else if (
      kpiSettingData &&
      kpiSettingData.status === 'failure' &&
      onboarding
    ) {
      toastMessage({ type: 'error', message: 'Failed to Add' });
    } else if (kpiSettingData && kpiSettingData.status === 'success') {
      toastMessage({ type: 'success', message: 'Successfully updated' });
    } else if (kpiSettingData && kpiSettingData.status === 'failure') {
      toastMessage({ type: 'error', message: 'Failed to update' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kpiSettingData]);

  const onSettingSave = () => {
    var obj = { ...error };

    if (modelName === '') {
      obj['modelName'] = 'Enter Model';
    }
    if (Sensitivity === '') {
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
          sensitivity: Sensitivity,
          seasonality: seasonality,
          frequency: frequency,
          scheduler_params: { time: schedule.format('HH:mm:00') }
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
      setSeasonality(seasonality.filter((item) => item !== e.target.value));
    }
  };

  const closeModal = () => {
    setModalOpen(false);
  };
  const handleValueChange = (data) => {
    setSchedule(data);
  };

  if (kpiEditLoading) {
    return (
      <div className="load">
        <div className="preload"></div>
      </div>
    );
  } else {
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
              value={{ value: modelName, label: modelName }}
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
              value={{ value: Sensitivity, label: Sensitivity }}
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
                    time series granularity to be considered for anomaly
                    detection
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
              value={{ value: frequency, label: frequency }}
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
            <label>Schedule</label>

            <TimePicker
              onChange={handleValueChange}
              defaultValue={schedule}
              className="time-picker"
              focusOnOpen={true}
              showSecond={false}
            />
          </div>
          <div className="form-group">
            <label>Expected Seasonality in Data</label>
            <div className="seasonality-setting">
              <div className="form-check check-box">
                <input
                  className="form-check-input"
                  type="checkbox"
                  value="M"
                  checked={seasonality.includes('M')}
                  name="Month"
                  id="monthly"
                  onChange={(e) => {
                    onSeasonalityChange(e);
                  }}
                />
                <label htmlFor="monthly">Monthly</label>
              </div>
              <div className="form-check check-box">
                <input
                  className="form-check-input"
                  type="checkbox"
                  value="W"
                  name="week"
                  id="weekly"
                  checked={seasonality.includes('W')}
                  onChange={(e) => {
                    onSeasonalityChange(e);
                  }}
                />
                <label htmlFor="weekly">Weekly</label>
              </div>

              <div className="form-check check-box">
                <input
                  className="form-check-input"
                  type="checkbox"
                  value="D"
                  name="daily"
                  id="daily"
                  checked={seasonality.includes('D')}
                  onChange={(e) => {
                    onSeasonalityChange(e);
                  }}
                />
                <label htmlFor="daily">Daily</label>
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
        <Modal
          isOpen={isModalOpen}
          shouldCloseOnOverlayClick={false}
          portalClassName="anomaly-setting-modal">
          <div className="modal-close" onClick={() => closeModal()}>
            <img src={Close} alt="Close" />
          </div>
          <div className="modal-body">
            <div className="modal-success-image">
              <img src={Success} alt="Success" />
            </div>
            <div className="modal-contents">
              <h3>You have successfully updated</h3>
            </div>
          </div>
        </Modal>
        <ToastContainer
          position={toast.POSITION.BOTTOM_RIGHT}
          autoClose={5000}
        />
      </>
    );
  }
};
export default Analystics;
