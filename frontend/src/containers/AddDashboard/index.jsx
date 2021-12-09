import React from 'react';

import { Link, useHistory } from 'react-router-dom';

import rightarrow from '../../assets/images/rightarrow.svg';

import DashboardForm from '../../components/DashboardForm';

const AddDashboard = () => {
  const history = useHistory();

  const data = history.location.pathname.split('/');

  return (
    <>
      {/* Page Navigation */}
      <div className="page-navigation">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/dashboard">Dashboard </Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              {data[2] === 'edit' ? 'Edit Dashboard' : 'Add Dashboard'}
            </li>
          </ol>
        </nav>
        {/* Back */}
        <div className="backnavigation">
          <Link to="/dashboard">
            <img src={rightarrow} alt="Back" />
            {data[2] === 'edit' ? (
              <span>Edit Dashboard</span>
            ) : (
              <span>Add Dashboard</span>
            )}
          </Link>
        </div>
      </div>
      {/* add DataSource form */}
      <div className="add-form-container">
        <DashboardForm />
      </div>
    </>
  );
};

export default AddDashboard;
