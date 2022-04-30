import React, { useState } from 'react';

import { Link, useHistory } from 'react-router-dom';

import rightarrow from '../../assets/images/rightarrow.svg';

import DataSourceForm from '../../components/DataSourceForm';
import AddFaq from '../../components/KpiFaq';
import KpiExplorerForm from '../../components/KpiExplorerForm';

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
          <li
            className={
              data[2] === '3' ? 'active' : data[2] >= '3' ? 'selected' : null
            }>
            Activate Analytics
          </li>
        </ul>
      </div>
      <>
        {data[2] === '1' ? (
          <div className="add-form-container">
            <DataSourceForm
              onboarding={true}
              setModal={setModal}
              setText={setText}
            />
          </div>
        ) : data[2] === '2' ? (
          <div className="add-kpi-wrapper">
            <div className="add-form-container kpi-form-container">
              <KpiExplorerForm
                onboarding={true}
                setModal={setModal}
                setText={setText}
              />
            </div>
            <div>
              <AddFaq />
            </div>
          </div>
        ) : data[2] === '3' ? (
          <Kpisetting onboarding={true} setModal={setModal} setText={setText} />
        ) : null}
      </>

      <ModalPopUp isOpen={modal} setIsOpen={setModal} text={text} />
    </>
  );
};

export default Onboarding;
