import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Select from 'react-select';
import { getAllKpiExplorer, getCreateDashboard } from '../../redux/actions';
// import ModalPopUp from '../Modal';

const DashboardForm = () => {
  // const [modal, setModal] = useState('false');
  const dispatch = useDispatch();
  const [kpiOption, setKpiOption] = useState([]);

  const [formData, setFormData] = useState({
    dashboardname: '',
    kpi: []
  });

  const [errorMsg, setErrorMsg] = useState({
    dashboardname: false,
    kpi: false
  });
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

  const handleSubmit = () => {
    if (formData.dashboardname === '') {
      setErrorMsg((prev) => {
        return {
          ...prev,
          dashboardname: true
        };
      });
    }
    if (formData.kpi.length === 0) {
      setErrorMsg((prev) => {
        return {
          ...prev,
          kpi: true
        };
      });
    }
    if (formData.dashboardname && formData.kpi) {
      // const dashboardData = {
      //   dashboard_name: formData.dashboardname,
      //   kpi_list: formData.kpi
      // };
      // dispatch(getCreateDashboard(dashboardData));
    }
  };

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
            onChange={(e) => {
              setFormData({ ...formData, dashboardname: e.target.value });
              setErrorMsg((prev) => {
                return {
                  ...prev,
                  dashboardname: false
                };
              });
            }}
          />
          {errorMsg.dashboardname === true ? (
            <div className="connection__fail">
              <p>Enter Dashboard name</p>
            </div>
          ) : null}
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
            menuPlacement="top"
            closeMenuOnSelect={false}
            blurInputOnSelect={false}
            onChange={(e) => {
              setFormData({
                ...formData,
                kpi: e.map((el) => el.value)
              });
              setErrorMsg((prev) => {
                return {
                  ...prev,
                  kpi: false
                };
              });
            }}
          />
          {errorMsg.kpi === true ? (
            <div className="connection__fail">
              <p>Select KPI</p>
            </div>
          ) : null}
        </div>
        <div className="form-action">
          <button className="btn black-button" onClick={() => handleSubmit()}>
            <span>Add Dashboard</span>
          </button>
        </div>
        {/* <ModalPopUp isOpen={modal} /> */}
      </>
    );
  }
};
export default DashboardForm;
