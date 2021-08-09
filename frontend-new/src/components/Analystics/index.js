import React, { useState } from 'react';

import './analystics.scss';

const Analystics = () => {
  const [tab, setTab] = useState('rca');
  return (
    <>
      <div className="dashboard-subheader">
        <div className="common-tab">
          <ul>
            <li
              className={tab === 'rca' ? 'active' : ''}
              onClick={() => setTab('rca')}>
              Configure AutoRCA
            </li>
            <li
              className={tab === 'anomoly' ? 'active' : ''}
              onClick={() => setTab('anomoly')}>
              Configure Anomoly Detector
            </li>
          </ul>
        </div>
      </div>
      <div className="form-container">
        <div className="form-group">
          <label>Select Time Window </label>
          <input type="text" className="form-control" />
        </div>
        <div className="form-group">
          <label>Frequency </label>
          <input type="text" className="form-control" />
        </div>
        {tab === 'anomoly' ? (
          <div className="form-group">
            <label>Baseline</label>
            <input type="text" className="form-control" />
          </div>
        ) : null}
        <div className="form-group">
          <label>Dimension level (max upto 3)</label>
          <input type="text" className="form-control" />
        </div>
        {tab === 'anomoly' ? (
          <div className="form-check check-box">
            <input className="form-check-input" type="checkbox" />
            <label className="form-check-label">Use historical data</label>
          </div>
        ) : null}
        <div className="form-check check-box">
          <input className="form-check-input" type="checkbox" />
          <label className="form-check-label">
            Use as default setting for all KPI’s
          </label>
        </div>
        <div className="form-action">
          <button className="btn black-button" disabled>
            <span>Set Up</span>
          </button>
        </div>
      </div>
    </>
  );
};
export default Analystics;
