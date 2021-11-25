import React, { useEffect, useState } from 'react';

import { useHistory, useParams } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';

import Select from 'react-select';
import {
  getAllKpiExplorer
  // getCreateDashboard,
  // getEditDashboard
} from '../../redux/actions';
// import ModalPopUp from '../Modal';

const editDashboard = {
  dashboard: {
    active: true,
    created_at: 'Tue, 23 Nov 2021 05:53:54 GMT',
    id: 11,
    kpis: [
      {
        created_at: 'Tue, 23 Nov 2021 05:53:55 GMT',
        id: 17,
        kpi: 3
      },
      {
        created_at: 'Tue, 23 Nov 2021 05:53:55 GMT',
        id: 18,
        kpi: 4
      },
      {
        created_at: 'Tue, 23 Nov 2021 05:53:55 GMT',
        id: 19,
        kpi: 5
      },
      {
        created_at: 'Tue, 23 Nov 2021 08:57:00 GMT',
        id: 24,
        kpi: 10
      },
      {
        created_at: 'Tue, 23 Nov 2021 08:57:00 GMT',
        id: 25,
        kpi: 11
      }
    ],
    last_modified: 'Tue, 23 Nov 2021 08:57:00 GMT',
    name: 'first_dashboard_modified'
  },
  message: '',
  status: 'success'
};

const DashboardForm = () => {
  // const [modal, setModal] = useState('false');
  const dispatch = useDispatch();

  const history = useHistory();
  const data = history.location.pathname.split('/');

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
  // const { editDashboar } = useSelector((state) => state.DashboardHome);

  useEffect(() => {
    dispatch(getAllKpiExplorer());
  }, [dispatch]);

  // useEffect(() => {
  //   if (data[2] === 'edit') {
  //     dispatch(getEditDashboard(dashboardId));
  //   }
  // }, []);

  useEffect(() => {
    if (editDashboard && data[2] === 'edit' && editDashboard.dashboard) {
      const obj = { ...editDashboard };

      obj['dashboardname'] = editDashboard.dashboard.name || '';

      setFormData(obj);
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
