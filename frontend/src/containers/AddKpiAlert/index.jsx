import React, { useEffect, useState } from 'react';

import { Link, useHistory } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';

import rightarrow from '../../assets/images/rightarrow.svg';

import KpiAlertConfigurationForm from '../../components/KpiAlertConfigurationForm';
import KpiAlertDestinationForm from '../../components/KpiAlertDestinationForm';

import { kpiAlertMetaInfo } from '../../redux/actions';

const AddKpiAlert = () => {
  const [steps, setSteps] = useState(1);
  const dispatch = useDispatch();
  const history = useHistory();

  const path = history.location.pathname.split('/');

  const [alertFormData, setAlertFormData] = useState({
    alert_name: '',
    alert_type: 'KPI Alert',
    data_source: 0,
    alert_query: '',
    alert_settings: '',
    kpi: 1,
    kpi_alert_type: 'Anomaly',
    severity_cutoff_score: 1,
    alert_message: '',
    alert_frequency: '',
    alert_channel: '',
    alert_channel_conf: '{}',
    daily_digest: false
  });

  const { kpiAlertMetaInfoData } = useSelector((state) => {
    return state.alert;
  });

  useEffect(() => {
    if (path[2] === 'edit') {
      dispatch(kpiAlertMetaInfo());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  return (
    <>
      {/* Page Navigation */}
      <div className="page-navigation">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/alerts"> Alerts </Link>
            </li>
            {path[2] !== 'edit' && (
              <li className="breadcrumb-item">
                <Link to="/alerts/new"> New Alert </Link>
              </li>
            )}
            <li className="breadcrumb-item active" aria-current="page">
              {path[2] !== 'edit'
                ? steps === 1
                  ? 'KPI Alert'
                  : ' Alert Destination'
                : steps === 1
                ? 'Edit KPI Alert'
                : 'Edit Alert Destination'}
            </li>
          </ol>
        </nav>
        {/* Back */}
        <div className="backnavigation">
          <Link to={`${path[2] === 'edit' ? '/alerts' : '/alerts/new'}`}>
            <img src={rightarrow} alt="Back" />
            <span>
              {' '}
              {path[2] !== 'edit'
                ? steps === 1
                  ? 'KPI Alert'
                  : ' Alert Destination'
                : steps === 1
                ? 'Edit KPI Alert'
                : 'Edit Alert Destination'}
            </span>
          </Link>
        </div>
      </div>
      <div className="onboarding-steps">
        <ul>
          <li className={steps > 1 ? 'selected' : 'active'}>
            Alert Configuration
          </li>
          <li className={steps === 2 ? 'active' : ''}>Alert Destination</li>
        </ul>
      </div>
      {/* add KPI Alert form */}
      <div className="add-form-container">
        {steps === 1 ? (
          <KpiAlertConfigurationForm
            setSteps={setSteps}
            setAlertFormData={setAlertFormData}
            alertFormData={alertFormData}
            kpiAlertMetaInfo={kpiAlertMetaInfoData}
          />
        ) : (
          <KpiAlertDestinationForm
            setKpiSteps={setSteps}
            setAlertFormData={setAlertFormData}
            alertFormData={alertFormData}
            kpiAlertMetaInfo={kpiAlertMetaInfoData}
          />
        )}
      </div>
    </>
  );
};

export default AddKpiAlert;
