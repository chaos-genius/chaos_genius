import React from 'react';
import Search from '../../assets/images/search.svg';

const AlertFilter = () => {
  return (
    <div className="common-filter-section">
      <div className="filter-layout">
        <h3>Alert Name </h3>
        <div className="form-group icon search-filter">
          <input
            type="text"
            className="form-control h-40"
            placeholder="Search"
          />
          <span>
            <img src={Search} alt="Search Icon" />
          </span>
        </div>
      </div>
      <div className="filter-layout">
        <h3>Channel</h3>
        <div className="form-check check-box">
          <input
            className="form-check-input"
            type="checkbox"
            id="checkboxfilter1"
            name="checkboxfilter1"
          />
          <label className="form-check-label" htmlFor="checkboxfilter1">
            Slack
          </label>
        </div>
        <div className="form-check check-box">
          <input
            className="form-check-input"
            type="checkbox"
            id="checkboxfilter2"
            name="checkboxfilter2"
          />
          <label className="form-check-label" htmlFor="checkboxfilter2">
            Email
          </label>
        </div>
        <div className="form-check check-box">
          <input
            className="form-check-input"
            type="checkbox"
            id="checkboxfilter3"
            name="checkboxfilter3"
          />
          <label className="form-check-label" htmlFor="checkboxfilter3">
            Datadog
          </label>
        </div>
        <div className="form-check check-box">
          <input
            className="form-check-input"
            type="checkbox"
            id="checkboxfilter4"
            name="checkboxfilter4"
          />
          <label className="form-check-label" htmlFor="checkboxfilter4">
            Asana
          </label>
        </div>
      </div>
      <div className="filter-layout">
        <h3>Status</h3>
        <div className="form-check check-box">
          <input
            className="form-check-input"
            type="checkbox"
            id="checkboxfilter6"
            name="checkboxfilter6"
          />
          <label className="form-check-label" htmlFor="checkboxfilter6">
            Active
          </label>
        </div>
        <div className="form-check check-box">
          <input
            className="form-check-input"
            type="checkbox"
            id="checkboxfilter7"
            name="checkboxfilter7"
          />
          <label className="form-check-label" htmlFor="checkboxfilter7">
            In Active
          </label>
        </div>
      </div>
    </div>
  );
};

export default AlertFilter;
