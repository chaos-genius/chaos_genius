import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Link, useHistory } from 'react-router-dom';

import rightarrow from '../../assets/images/rightarrow.svg';
import EventAlertDestinationForm from '../../components/EventAlertDestinationForm';

import EventAlertForm from '../../components/EventAlertForm';

import { kpiAlertMetaInfo } from '../../redux/actions';

const AddEventAlert = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  const path = history.location.pathname.split('/');

  const { kpiAlertMetaInfoData } = useSelector((state) => {
    return state.alert;
  });

  const [steps, setSteps] = useState(1);
  const [alertFormData, setAlertFormData] = useState({
    alert_name: '',
    alert_type: 'Event Alert',
    data_source: 0,
    alert_query: '',
    alert_settings: '',
    alert_message: '',
    alert_frequency: '',
    alert_channel: '',
    alert_channel_conf: '{}'
  });

  useEffect(() => {
    if (path[2] === 'edit') {
      dispatch(kpiAlertMetaInfo());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  return (
    <>
      <div className="page-navigation">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/alerts">Alerts </Link>
            </li>
            {path[2] !== 'edit' && (
              <li className="breadcrumb-item">
                <Link to="/alerts/new"> New Alert </Link>
              </li>
            )}
            <li className="breadcrumb-item active" aria-current="page">
              {path[2] !== 'edit'
                ? steps === 1
                  ? 'Event Alert'
                  : ' Alert Destination'
                : steps === 1
                ? 'Edit Event Alert'
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
                  ? 'Event Alert'
                  : ' Alert Destination'
                : steps === 1
                ? 'Edit Event Alert'
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
      <div className="add-form-container">
        {steps === 1 ? (
          <EventAlertForm
            setSteps={setSteps}
            setAlertFormData={setAlertFormData}
            alertFormData={alertFormData}
            kpiAlertMetaInfo={kpiAlertMetaInfoData}
          />
        ) : (
          <EventAlertDestinationForm
            setEventSteps={setSteps}
            setAlertFormData={setAlertFormData}
            alertFormData={alertFormData}
            kpiAlertMetaInfo={kpiAlertMetaInfoData}
          />
        )}
      </div>
    </>
  );
};
export default AddEventAlert;
