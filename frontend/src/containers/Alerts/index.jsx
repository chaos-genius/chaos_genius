import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';

import { useToast } from 'react-toast-wnm';
import Alertnotification from '../../assets/images/alerts/alert-notify.svg';

import Plus from '../../assets/images/plus.svg';
import Frame from '../../assets/images/table/channelconfig.svg';
import { CustomContent, CustomActions } from '../../utils/toast-helper';

import AlertTable from '../../components/AlertTable';

import './alerts.scss';
import AlertFilter from '../../components/AlertFilter';

import { getAllAlerts } from '../../redux/actions';

import { BASE_URL } from '../../utils/url-helper';

import Fuse from 'fuse.js';
import store from '../../redux/store';
import Noalert from '../../components/Noalert';

const RESET_ACTION = {
  type: 'RESET_ALERT_DATA_Data'
};
const RESET_ENABLE_DISABLE_DATA = {
  type: 'RESET_ENABLE_DISABLE_DATA'
};
const RESET_DELETE_DATA = {
  type: 'RESET_DELETE_DATA'
};
const RESET_QUERY_DATA = {
  type: 'EVENT_ALERT_QUERY_RESET'
};

const Alerts = () => {
  const dispatch = useDispatch();

  const toast = useToast();

  const {
    alertLoading,
    alertList,
    kpiAlertEnableData,
    kpiAlertDisableData,
    kpiAlertDeleteData,
    changingAlert
  } = useSelector((state) => state.alert);

  const [alertData, setAlertData] = useState(alertList);
  const [alertSearch, setAlertSearch] = useState('');
  const [alertFilter, setAlertFilter] = useState([]);
  const [alertStatusFilter, setAlertStatusFilter] = useState([]);
  const [data, setData] = useState(false);

  useEffect(() => {
    store.dispatch(RESET_ACTION);
    store.dispatch(RESET_ENABLE_DISABLE_DATA);
    store.dispatch(RESET_DELETE_DATA);
    store.dispatch(RESET_QUERY_DATA);
    dispatch(getAllAlerts());
  }, [dispatch, data]);

  useEffect(() => {
    if (alertSearch !== '') {
      searchAlert();
    } else {
      setAlertData(alertList);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alertSearch, alertList]);

  useEffect(() => {
    if (changingAlert !== undefined) {
      if (alertList) {
        const alert = alertList.findIndex((item) => {
          return item.id === changingAlert?.id;
        });
        if (alert >= 0) {
          alertList[alert].active = !changingAlert.toggle;
        }
      }
    }
    setAlertData(alertList);
    store.dispatch({ type: 'RESET_CHANGING_ALERT' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [changingAlert]);

  useEffect(() => {
    if (kpiAlertDisableData && kpiAlertDisableData.status === 'success') {
      // setIsOpen(false);
      customToast({
        type: 'success',
        header: 'Successfully Disabled'
      });

      store.dispatch(RESET_ENABLE_DISABLE_DATA);
    } else if (
      kpiAlertDisableData &&
      kpiAlertDisableData.status === 'failure'
    ) {
      customToast({
        type: 'error',
        header: 'Failed to disable selected alert',
        description: kpiAlertDisableData.message
      });
      store.dispatch(RESET_ENABLE_DISABLE_DATA);
    } else if (kpiAlertEnableData && kpiAlertEnableData.status === 'success') {
      customToast({
        type: 'success',
        header: 'Successfully Enabled'
      });
      store.dispatch(RESET_ENABLE_DISABLE_DATA);
    } else if (kpiAlertEnableData && kpiAlertEnableData.status === 'failure') {
      customToast({
        type: 'error',
        header: 'Failed to enable selected alert',
        description: kpiAlertEnableData.message
      });
      store.dispatch(RESET_ENABLE_DISABLE_DATA);
    } else if (kpiAlertDeleteData && kpiAlertDeleteData.status === 'success') {
      setData((prev) => !prev);
      customToast({
        type: 'success',
        header: 'Successfully Deleted'
      });
      store.dispatch(RESET_DELETE_DATA);
    } else if (kpiAlertDeleteData && kpiAlertDeleteData.status === 'failure') {
      customToast({
        type: 'error',
        header: 'Failed to delete selected alert',
        description: kpiAlertDeleteData.message
      });
      store.dispatch(RESET_DELETE_DATA);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kpiAlertDisableData, kpiAlertEnableData, kpiAlertDeleteData]);

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

  const searchAlert = () => {
    const options = {
      keys: ['alert_name']
    };

    const fuse = new Fuse(alertList, options);

    const result = fuse.search(alertSearch);
    setAlertData(
      result.map((item) => {
        return item.item;
      })
    );
  };

  useEffect(() => {
    const fetchFilter = () => {
      var arr = [];
      if (alertFilter.length === 0 && alertStatusFilter.length === 0) {
        setAlertData(alertList);
      } else if (alertFilter.length === 0 && alertStatusFilter.length !== 0) {
        alertStatusFilter.forEach((data) => {
          alertList.forEach((list) => {
            if (list.active && data === 'active') {
              arr.push(list);
            } else if (list.active === false && data === 'inactive') {
              arr.push(list);
            }
          });
        });
        setAlertData(arr);
      } else if (alertStatusFilter.length === 0 && alertFilter.length !== 0) {
        alertFilter &&
          alertFilter.forEach((data) => {
            alertList.forEach((list) => {
              if (list.alert_channel.toLowerCase() === data.toLowerCase()) {
                arr.push(list);
              }
            });
          });
        setAlertData(arr);
      } else if (alertStatusFilter.length !== 0 && alertFilter.length !== 0) {
        alertStatusFilter.forEach((status) => {
          alertFilter.forEach((channel) => {
            alertList.forEach((list) => {
              if (
                list.active === true &&
                status === 'active' &&
                list.alert_channel.toLowerCase() === channel
              ) {
                arr.push(list);
              } else if (
                list.active === false &&
                list.alert_channel === channel &&
                status === 'inactive'
              ) {
                arr.push(list);
              }
            });
          });
        });
        setAlertData(arr);
      }
    };
    fetchFilter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alertFilter, alertStatusFilter]);

  if (alertLoading) {
    return (
      <div className="load loader-page">
        <div className="preload"></div>
      </div>
    );
  } else {
    return (
      <>
        {/* common heading and options */}
        <div className="heading-option">
          <div className="heading-title">
            {alertList && alertList.length !== 0 ? (
              <a
                href={`${BASE_URL}/api/digest`}
                target="_blank"
                rel="noopener noreferrer"
                className="alert-linked">
                <h1>Alerts</h1>
                <img src={Alertnotification} alt="alert-notification" />
              </a>
            ) : (
              <h3>Alerts</h3>
            )}
          </div>

          <div className="alert-option-button">
            <Link
              to="/alerts/channelconfiguration"
              className="btn white-button">
              <img src={Frame} alt="Add" />
              <span>Channel Configuration</span>
            </Link>
            <Link to="/alerts/new" className="btn green-variant-button">
              <img src={Plus} alt="Add" />
              <span>New Alert</span>
            </Link>
          </div>
        </div>
        {alertList && alertList.length !== 0 ? (
          <div className="explore-wrapper">
            {/* explore wrapper */}
            {/* filter section */}
            <div className="filter-section">
              <AlertFilter
                setAlertSearch={setAlertSearch}
                setAlertFilter={setAlertFilter}
                alertData={alertList}
                setAlertStatusFilter={setAlertStatusFilter}
              />
            </div>
            {/* table section */}
            <div className="table-section">
              <AlertTable alertData={alertData} alertSearch={alertSearch} />
            </div>
          </div>
        ) : (
          <div className="no-alert-container">
            <Noalert />
          </div>
        )}
      </>
    );
  }
};
export default Alerts;
