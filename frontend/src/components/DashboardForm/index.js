import React, { useEffect, useState } from 'react';

import { useHistory, useParams } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';

import Select from 'react-select';
import {
  getAllKpiExplorer,
  getUpdateDashboard,
  getCreateDashboard,
  getEditDashboard
} from '../../redux/actions';
// import ModalPopUp from '../Modal';

const DashboardForm = () => {
  // const [modal, setModal] = useState('false');
  const dispatch = useDispatch();

  const history = useHistory();
  const path = history.location.pathname.split('/');

  const dashboardId = useParams().id;

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
  const {
    editDashboard,
    createDashboardLoading,
    updateDashboardLoading,
    createDashboard
  } = useSelector((state) => state.DashboardHome);

  useEffect(() => {
    dispatch(getAllKpiExplorer());
    if (path[2] === 'edit') {
      dispatch(getEditDashboard({ dashboard_id: dashboardId }));
    }
  }, []);

  useEffect(() => {
    if (editDashboard && path[2] === 'edit') {
      var arr = [];
      editDashboard.kpis.map((item) => arr.push(item.kpi));
      setFormData({
        ...formData,
        dashboardname: editDashboard?.name,
        kpi: arr
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editDashboard]);

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

  // useEffect(() => {
  //   if (createDashboard) {
  //     console.log(createDashboard);
  //     history.push('/dashboard');
  //   }
  // }, [createDashboard]);

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
      if (path[2] === 'edit') {
        const payload = {
          dashboard_name: formData.dashboardname,
          kpi_list: formData.kpi
        };
        dispatch(getUpdateDashboard(dashboardId, payload));
      } else {
        const dashboardData = {
          dashboard_name: formData.dashboardname,
          kpi_list: formData.kpi
        };
        dispatch(getCreateDashboard(dashboardData));
      }
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
            value={formData.dashboardname}
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
          <Select classNamePrefix="selectcategory" placeholder="Select" />
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
            value={
              formData.kpi.length !== 0
                ? formData.kpi.map((el) => {
                    return {
                      label: kpiExplorerList.find((list) => list.id === el)
                        ?.name,
                      value: el
                    };
                  })
                : []
            }
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
              <p>Enter KPI</p>
            </div>
          ) : null}
        </div>
        <div className="form-action">
          {/* <button className="btn black-button" onClick={() => handleSubmit()}>
            <span>Add Dashboard</span>
          </button> */}

          <button
            className={
              createDashboardLoading || updateDashboardLoading
                ? 'btn black-button btn-loading'
                : 'btn black-button'
            }
            onClick={() => {
              handleSubmit();
            }}>
            <div className="btn-spinner">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <span>Loading...</span>
            </div>
            <div className="btn-content">
              {path[2] === 'edit' ? (
                <span>Save Changes</span>
              ) : (
                <span>Add Dashboard</span>
              )}
            </div>
          </button>
        </div>
        {/* <ModalPopUp isOpen={modal} /> */}
      </>
    );
  }
};
export default DashboardForm;
