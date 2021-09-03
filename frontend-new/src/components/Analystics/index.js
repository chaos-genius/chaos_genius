import React from 'react';

import Select from 'react-select';

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
        <div className="form-group">
          <label>Select a Model</label>
          <Select
            classNamePrefix="selectcategory"
            placeholder="select"
            isSearchable={false}
          />
        </div>
        <div className="form-group">
          <label>Sensitivity</label>
          <Select
            classNamePrefix="selectcategory"
            placeholder="select"
            isSearchable={false}
          />
        </div>
        <div className="form-group">
          <label>Time Series Frequency</label>
          <Select
            classNamePrefix="selectcategory"
            placeholder="select"
            isSearchable={false}
          />
        </div>
      </div>
    </>
  );
};
export default Analystics;
