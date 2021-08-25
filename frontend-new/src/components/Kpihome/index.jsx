import React from 'react';

import Select from 'react-select';

import Search from '../../assets/images/search.svg';
import Graph from '../../assets/images/kpi-graph.svg';
import Up from '../../assets/images/up.svg';
// import Down from '../../assets/images/down.svg';

import './kpihome.scss';

const data = [
  {
    value: 'mom',
    label: 'Current Month on Last Month'
  },
  {
    value: 'wow',
    label: 'Current Week on Last Week'
  }
];

const Kpihome = () => {
  return (
    <>
      <div className="heading-option">
        <div className="heading-title">
          <h3>My KPIs</h3>
          <p>Lorem ipsum is a dummy text</p>
        </div>
      </div>
      <div className="homepage-setup-card-wrapper">
        <div className="homepage-options">
          <Select
            // value={monthWeek}
            options={data}
            classNamePrefix="selectcategory"
            placeholder="Sort by"
            isSearchable={false}
          />
          <div className="homepage-search-dropdown">
            <div className="form-group icon search-filter">
              <input
                type="text"
                className="form-control h-40"
                placeholder="Search KPI"
              />
              <span>
                <img src={Search} alt="Search Icon" />
              </span>
            </div>
            <Select
              // value={monthWeek}
              options={data}
              classNamePrefix="selectcategory"
              placeholder="Current week on last week"
              isSearchable={false}
            />
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-content kpi-content-change">
            <h3>Average Engagement</h3>
            <label>(Mins)</label>
          </div>
          <div className="kpi-content">
            <label>This Week</label>
            <span>123452</span>
          </div>
          <div className="kpi-content">
            <label>Previous Week</label>
            <span>123876</span>
          </div>
          <div className="kpi-content">
            <label>Change</label>
            <span>
              1232
              <label className="high-change">
                <img src={Up} alt="High" />
                33%
              </label>
            </span>
          </div>
          <div className="kpi-content">
            <label>Anomalies</label>
            <span>
              10 <label className="anomalies-period">(last week)</label>
            </span>
          </div>
          <div className="kpi-content kpi-graph">
            <img src={Graph} alt="Graph" />
          </div>
          <div className="kpi-content kpi-details">Details</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-content kpi-content-change">
            <h3>New Spotify Streams</h3>
            <label>(Customers Tracking)</label>
          </div>
          <div className="kpi-content">
            <label>This Week</label>
            <span>7980</span>
          </div>
          <div className="kpi-content">
            <label>Previous Week</label>
            <span>6520</span>
          </div>
          <div className="kpi-content">
            <label>Change</label>
            <span>
              1460
              <label className="high-change">
                <img src={Up} alt="High" />
                19%
              </label>
            </span>
          </div>
          <div className="kpi-content">
            <label>Anomalies</label>
            <span>
              15 <label className="anomalies-period">(last week)</label>
            </span>
          </div>
          <div className="kpi-content kpi-graph">
            <img src={Graph} alt="Graph" />
          </div>
          <div className="kpi-content kpi-details">Details</div>
        </div>
      </div>
    </>
  );
};

export default Kpihome;
