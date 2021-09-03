import React from 'react';

import { Link } from 'react-router-dom';

import rightarrow from '../../assets/images/rightarrow.svg';

import FilterAnalystics from '../../components/FilterAnalystics';
import Analystics from '../../components/Analystics';

const Kpisetting = () => {
  return (
    <>
      {/* Page Navigation */}
      <div className="page-navigation">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/">Home</Link>
            </li>
            <li className="breadcrumb-item">
              <Link to="/">KPI Name</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              Settings
            </li>
          </ol>
        </nav>
        {/* Back */}
        <div className="backnavigation">
          <Link to="/">
            <img src={rightarrow} alt="Back" />
            <span>Settings</span>
          </Link>
        </div>
      </div>
      <div className="explore-wrapper">
        {/* filter section */}
        <div className="filter-section">
          <FilterAnalystics />
        </div>
        {/* table section */}
        <div className="table-section">
          <Analystics />
        </div>
      </div>
    </>
  );
};

export default Kpisetting;
