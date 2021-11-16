import React from 'react';

import { Link } from 'react-router-dom';

import Select from 'react-select';

import Plus from '../../assets/images/plus.svg';
import Search from '../../assets/images/search.svg';
import Dashboardcards from '../../components/Dashboardcards';

import './dashboardconfigure.scss';

const Dashboardconfigure = () => {
  return (
    <>
      <div className="heading-option">
        <div className="heading-title">
          <h3>Dashboard</h3>
        </div>
        <div className="option-button">
          <Link to="/kpiexplorer/add" className="btn green-variant-button">
            <img src={Plus} alt="Add" />
            <span>New Dashboard</span>
          </Link>
        </div>
      </div>{' '}
      <div className="dashboard-options">
        <div className="form-group icon">
          <input
            type="text"
            className="form-control h-40"
            placeholder="Search dashboard"
          />
          <span>
            <img src={Search} alt="Search Icon" />
          </span>
        </div>{' '}
        <Select
          // options={data}
          classNamePrefix="selectcategory"
          placeholder="last modified"
          isSearchable={false}
        />
      </div>
      <div className="dashboard-card-wrapper">
        <Dashboardcards />
      </div>
    </>
  );
};

export default Dashboardconfigure;
