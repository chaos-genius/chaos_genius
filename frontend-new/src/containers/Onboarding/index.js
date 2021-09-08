import React, { useState } from 'react';

import { Link, useHistory } from 'react-router-dom';

import rightarrow from '../../assets/images/rightarrow.svg';

import DataSourceForm from '../../components/DataSourceForm';
import KpiExplorerForm from '../../components/KpiExplorerForm';
//import DashboardForm from '../../components/DashboardForm';
// import FilterAnalystics from '../../components/FilterAnalystics';
// import Analystics from '../../components/Analystics';
import Kpisetting from '../KpiSetting';

import './onboarding.scss';
import ModalPopUp from '../../components/Modal';

const Onboarding = () => {
  const history = useHistory();

  const data = history.location.pathname.split('/');

  const [modal, setModal] = useState(false);
  const [text, setText] = useState('');

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
            <li className="breadcrumb-item active" aria-current="page">
              {data[2] === '1'
                ? 'Add Data Sources'
                : data[2] === '2'
                ? 'Add KPI'
                : data[2] === '3'
                ? 'Activate Analytics'
                : data[2] === '4'
                ? 'Add Dashboard'
                : null}
            </li>
          </ol>
        </nav>
        {/* Back */}
        <div className="backnavigation">
          <Link to="/">
            <img src={rightarrow} alt="Back" />
            <span>
              {data[2] === '1'
                ? 'Add Data Sources'
                : data[2] === '2'
                ? 'Add KPI'
                : data[2] === '3'
                ? 'Activate Analytics'
                : data[2] === '4'
                ? 'Add Dashboard'
                : null}
            </span>
          </Link>
        </div>
      </div>
      <div className="onboarding-steps">
        <ul>
          <li
            className={
              data[2] === '1' ? 'active' : data[2] >= '1' ? 'selected' : null
            }>
            Add Datasource
          </li>
          <li
            className={
              data[2] === '2' ? 'active' : data[2] >= '2' ? 'selected' : null
            }>
            Add KPI
          </li>
          {/* <li
            className={
              data[2] === '4' ? 'active' : data[2] >= '4' ? 'selected' : null
            }>
            Create Dashboard
          </li> */}
          <li
            className={
              data[2] === '3' ? 'active' : data[2] >= '3' ? 'selected' : null
            }>
            Activate Analytics
          </li>
        </ul>
      </div>
      {data[2] !== '3' ? (
        <div className="add-form-container">
          {data[2] === '1' ? (
            <DataSourceForm
              onboarding={true}
              setModal={setModal}
              setText={setText}
            />
          ) : data[2] === '2' ? (
            <KpiExplorerForm
              onboarding={true}
              setModal={setModal}
              setText={setText}
            />
          ) : // data[2] === '3' ? (
          //   <DashboardForm />
          // ) :
          null}
        </div>
      ) : (
        // <div className="explore-wrapper">
        //   {/* filter section */}
        //   <div className="filter-section">
        //     <FilterAnalystics />
        //   </div>
        //   {/* table section */}
        //   <div className="table-section">
        //     <Analystics />
        //   </div>
        // </div>
        <Kpisetting onboarding={true} setModal={setModal} setText={setText} />
      )}

      <ModalPopUp isOpen={modal} setIsOpen={setModal} text={text} />
    </>
  );
};

export default Onboarding;
