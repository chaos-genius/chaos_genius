import React from 'react';

import Search from '../../assets/images/search.svg';
import GreenArrow from '../../assets/images/green-arrow.svg';

const FilterAnalystics = () => {
  return (
    <div className="common-filter-section">
      <div className="filter-layout">
        <h3>List of KPI’s (02)</h3>
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
      </div>
      <div className="filter-layout filter-tab">
        <ul>
          <li className="active">
            DAU’s <img src={GreenArrow} alt="Next" />
          </li>
          <li>
            Avg Engagements (min) <img src={GreenArrow} alt="Next" />
          </li>
        </ul>
      </div>
    </div>
  );
};

export default FilterAnalystics;
