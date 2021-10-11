import React from 'react';

import './waterfallcuts.scss';

const Waterfallcuts = () => {
  return (
    <div className="cuts-container">
      <div className="cuts-period">
        <h2>Previous Period</h2>
        <h3>April 2021</h3>
      </div>
      <div className="cuts-separator"></div>
      <div>
        <label>Gender = F</label>
        <label>Device = iOS</label>
      </div>
      <div className="cuts-separator"></div>
      <div>
        <label>Country = UK</label>
        <label>Member = Prime</label>
      </div>
      <div className="cuts-separator"></div>
      <div>
        <label>Day = Sunday</label>
      </div>
      <div className="cuts-separator"></div>
      <div>
        <label>Purchase_time = Morning</label>
      </div>
      <div className="cuts-separator"></div>
      <div className="cuts-period current-period">
        <h2>Current Period</h2>
        <h3>May 2021</h3>
      </div>
    </div>
  );
};

export default Waterfallcuts;
