import React from 'react';

import './analystics.scss';

const Analystics = () => {
  return (
    <>
      <div className="dashboard-subheader">
        <div className="common-tab">
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
      </div>
    </>
  );
};
export default Analystics;
