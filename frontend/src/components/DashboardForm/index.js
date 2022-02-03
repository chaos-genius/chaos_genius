import React, { useEffect, useState } from 'react';

import { useHistory, useParams } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';

import Select from 'react-select';

import { useToast } from 'react-toast-wnm';

import { CustomContent, CustomActions } from '../../utils/toast-helper';

import {
  getAllKpiExplorer,
  getUpdateDashboard,
  getCreateDashboard,
  getEditDashboard
} from '../../redux/actions';
// import ModalPopUp from '../Modal';

const DashboardForm = ({ setText, setModal, onboarding }) => {
  const dispatch = useDispatch();

  const toast = useToast();

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
    createDashboard,
    updateDashboard
  } = useSelector((state) => state.DashboardHome);

  useEffect(() => {
    dispatch(getAllKpiExplorer());
    if (path[2] === 'edit') {
      dispatch(getEditDashboard({ dashboard_id: dashboardId }));
    } // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (editDashboard && path[2] === 'edit') {
      var arr = [];
      editDashboard.kpis.map((item) => arr.push(item));
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

  const customToast = (data) => {
    const { type, header, description } = data;
    toast({
      autoDismiss: true,
      enableAnimation: true,
      delay: type === 'success' ? '5000' : '30000',
      backgroundColor: type === 'success' ? '#effaf5' : '#FEF6F5',
      borderRadius: '6px',
      color: '#222222',
      position: 'bottom-right',
      minWidth: '240px',
      width: 'auto',
      boxShadow: '4px 6px 32px -2px rgba(226, 226, 234, 0.24)',
      padding: '17px 14px',
      height: 'auto',
      border: type === 'success' ? '1px solid #60ca9a' : '1px solid #FEF6F5',
      type: type,
      actions: <CustomActions />,
      content: (
        <CustomContent
          header={header}
          description={description}
          failed={type === 'success' ? false : true}
        />
      )
    });
  };

  useEffect(() => {
    if (
      createDashboard &&
      createDashboard.status === 'success' &&
      path[2] === 'add' &&
      onboarding !== true
    ) {
      history.push('/dashboard');
      customToast({
        type: 'success',
        header: 'Dashboard added successfully'
      });
    } else if (
      createDashboard &&
      createDashboard.status === 'failure' &&
      path[2] === 'add' &&
      onboarding !== true
    ) {
      customToast({
        type: 'failure',
        header: 'Failed to add dashboard',
        description: createDashboard.message
      });
    }
    if (
      createDashboard &&
      createDashboard.status === 'success' &&
      onboarding === true
    ) {
      setText('dashboard');
      setModal(true);
      customToast({
        type: 'success',
        header: 'Dashboard added successfully'
      });
    } else if (
      createDashboard &&
      createDashboard.status === 'failure' &&
      onboarding === true
    ) {
      customToast({
        type: 'failure',
        header: 'Failed to add dashboard',
        description: createDashboard.message
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createDashboard]);

  useEffect(() => {
    if (updateDashboard && updateDashboard.status === 'success') {
      customToast({
        type: 'success',
        header: 'Dashboard updated successfully'
      });
    } else if (updateDashboard && updateDashboard.status === 'failure') {
      customToast({
        type: 'failure',
        header: 'Failed to update dashboard',
        description: updateDashboard.message
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateDashboard]);

  const handleSubmit = () => {
    if (formData.dashboardname === '') {
      setErrorMsg((prev) => {
        return {
          ...prev,
          dashboardname: true
        };
      });
    }
    if (formData.dashboardname !== '') {
      if (path[2] === 'edit') {
        const payload = {
          dashboard_id: dashboardId,
          dashboard_name: formData.dashboardname,
          kpi_list: formData.kpi
        };
        dispatch(getUpdateDashboard(payload));
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
        {/* <div className="form-group">
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
        </div> */}
        <div className="form-group">
          <label>KPI </label>
          <Select
            isMulti
            options={kpiOption}
            classNamePrefix="selectcategory"
            placeholder="Select"
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
