import React, { useState } from 'react';

import Select from 'react-select';

import Anomoly from '../../assets/images/alerts/anomoly.svg';
import AnomolyActive from '../../assets/images/alerts/anomoly-active.svg';
import Static from '../../assets/images/alerts/static.svg';
import StaticActive from '../../assets/images/alerts/static-active.svg';

import './kpialertconfigurationform.scss';

const KpiAlertConfigurationForm = ({ setSteps }) => {
  const [type, setType] = useState('static');
  const [conditionType, setConditionType] = useState('');

  const onSubmit = () => {
    setSteps(2);
  };

  return (
    <>
      <div className="form-group">
        <h5>Alert Definition</h5>
      </div>
      <div className="form-group">
        <label>Select KPI*</label>
        <Select classNamePrefix="selectcategory" placeholder="Select" />
      </div>
      <div className="form-group">
        <label>Name of your Alert *</label>
        <input
          type="text"
          className="form-control"
          placeholder="Enter alert name"
          required
        />
      </div>
      <div className="form-group">
        <label>Alert Type *</label>
        <div className="alerts-type-container">
          <div
            className={
              type === 'anomoloy' ? 'alerts-type active' : 'alerts-type'
            }
            onClick={() => setType('anomoloy')}>
            <img src={Anomoly} alt="Anomoly" className="alert-image" />
            <img
              src={AnomolyActive}
              alt="Anomoly"
              className="alert-image-active"
            />
            <span>Anomoly</span>
          </div>
          <div
            className={type === 'static' ? 'alerts-type active' : 'alerts-type'}
            onClick={() => setType('static')}>
            <img src={Static} alt="Static" className="alert-image" />
            <img
              src={StaticActive}
              alt="Static"
              className="alert-image-active"
            />
            <span>Static</span>
          </div>
        </div>
      </div>
      <div className="form-group">
        <h5>Alert Condition</h5>
      </div>
      {type === 'static' ? (
        <>
          <div className="form-group">
            <label>Name of your Alert *</label>
            <div className="alert-condition">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  id="Spike"
                  name="alert"
                  value="spike"
                  onChange={(e) => {
                    setConditionType(e.target.value);
                  }}
                />
                <label
                  className={
                    conditionType === 'spike'
                      ? 'form-check-label active'
                      : 'form-check-label'
                  }
                  for="Spike">
                  Spike
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  id="Drop"
                  name="alert"
                  value="drop"
                  onChange={(e) => {
                    setConditionType(e.target.value);
                  }}
                />
                <label
                  className={
                    conditionType === 'drop'
                      ? 'form-check-label active'
                      : 'form-check-label'
                  }
                  for="Drop">
                  Drop
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  id="Both"
                  name="alert"
                  value="both"
                  onChange={(e) => setConditionType(e.target.value)}
                />
                <label
                  className={
                    conditionType === 'both'
                      ? 'form-check-label active'
                      : 'form-check-label'
                  }
                  for="Both">
                  Both
                </label>
              </div>
            </div>
          </div>
          <div className="form-group">
            <label>Deviation Value *</label>
            <div className="deviation-group">
              <input
                type="text"
                className="form-control"
                placeholder="Enter Value"
                required
              />

              <Select
                classNamePrefix="selectcategory"
                placeholder="Select Unit"
              />
            </div>
          </div>
        </>
      ) : null}
      <div className="form-group">
        <label>Alert Frequency *</label>
        <Select classNamePrefix="selectcategory" placeholder="Daily" />
      </div>
      <div className="form-group alert-textarea">
        <label>Message Body *</label>
        <textarea placeholder="Enter message here" />
      </div>
      <div className="form-action ">
        <button className="btn black-button" onClick={() => onSubmit()}>
          <span>Next Step</span>
        </button>
      </div>
    </>
  );
};

export default KpiAlertConfigurationForm;
