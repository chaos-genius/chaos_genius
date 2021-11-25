import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Select from 'react-select';
import { getAllKpiExplorer } from '../../redux/actions';
// import ModalPopUp from '../Modal';

const DashboardForm = () => {
  // const [modal, setModal] = useState('false');
  const dispatch = useDispatch();
  const [kpiOption, setKpiOption] = useState([]);
  const { isLoading, kpiExplorerList } = useSelector(
    (state) => state.kpiExplorer
  );

  useEffect(() => {
    dispatch(getAllKpiExplorer());
  }, [dispatch]);

  useEffect(() => {
    if (kpiExplorerList && kpiExplorerList.length !== 0) {
      setKpiOption(
        kpiExplorerList.map((kpi) => {
          return {
            label: kpi?.name,
            value: kpi?.id
          };
        })
      );
    }
  }, [kpiExplorerList]);

  if (isLoading) {
    return (
      <div className="load">
        <div className="preload"></div>
      </div>
    );
  } else {
    return (
      <>
        <div className="form-group">
          <label>Dashboard Name *</label>
          <input
            type="text"
            className="form-control"
            placeholder="Name of the dashboard"
            required
          />
        </div>
        <div className="form-group">
          <label>Select Team *</label>
          <Select
            // options={option.datasource}
            classNamePrefix="selectcategory"
            placeholder="Select"
          />
        </div>
        <div className="form-group">
          <label>Select Sub Team (Optional)</label>
          <Select
            // options={option.datasource}
            classNamePrefix="selectcategory"
            placeholder="Select"
          />
        </div>
        <div className="form-group">
          <label>Avg Order Value</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter Avg Order Value"
            required
          />
        </div>
        <div className="form-group">
          <label>KPI *</label>
          <Select
            isMulti
            options={kpiOption}
            classNamePrefix="selectcategory"
            placeholder="Select"
          />
        </div>
        <div className="form-action">
          <button className="btn black-button">
            <span>Add Dashboard</span>
          </button>
        </div>
        {/* <ModalPopUp isOpen={modal} /> */}
      </>
    );
  }
};
export default DashboardForm;
