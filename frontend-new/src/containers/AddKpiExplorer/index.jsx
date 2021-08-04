import React from 'react';

import { Link, useHistory } from 'react-router-dom';

import rightarrow from '../../assets/images/rightarrow.svg';
import KpiExplorerForm from '../../components/KpiExplorerForm';

const AddKpiExplorer = () => {
  const history = useHistory();
  const data = history.location.pathname.split('/');
  return (
    <div>
      {/* Page Navigation */}
      <div className="page-navigation">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/kpi">KPI Explorer </Link>
            </li>

            {data[2] === 'edit' ? (
              <li className="breadcrumb-item active" aria-current="page">
                Edit KPI
              </li>
            ) : (
              <li className="breadcrumb-item active" aria-current="page">
                Add KPI
              </li>
            )}
          </ol>
        </nav>
        {/* Back */}
        <div className="backnavigation">
          {data[2] === 'edit' ? (
            <Link to="/kpi">
              <img src={rightarrow} alt="Back" />
              <span>Edit KPI</span>
            </Link>
          ) : (
            <Link to="/kpi">
              <img src={rightarrow} alt="Back" />
              <span>Add KPI</span>
            </Link>
          )}
        </div>
      </div>
      {/* add DataSource form */}
      <div className="add-form-container">
        <KpiExplorerForm id={data[3]} />
      </div>
    </div>
  );
};

export default AddKpiExplorer;
