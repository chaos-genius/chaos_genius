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

import {
  getAllAlerts,
  getAlertChannelForFilter,
  getAlertStatusForFilter
} from '../../redux/actions';

import { BASE_URL } from '../../utils/url-helper';
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
    changingAlert,
    pagination,
    alertChannelTypes,
    alertStatusTypes
  } = useSelector((state) => state.alert);

  const [alertData, setAlertData] = useState(alertList);
  const [alertSearch, setAlertSearch] = useState('');
  const [pgInfo, setPgInfo] = useState({
    page: 1,
    per_page: 10,
    search: '',
    channel: [],
    active: []
  });
  const [pages, setPages] = useState({});
  const [data, setData] = useState(false);
  const [channelType, setChannelType] = useState([]);
  const [channelStatus, setChannelStatus] = useState([]);

  useEffect(() => {
    dispatch(getAlertChannelForFilter());
    dispatch(getAlertStatusForFilter());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (alertChannelTypes && alertChannelTypes.length > 0) {
      setChannelType(alertChannelTypes);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alertChannelTypes]);

  useEffect(() => {
    if (alertStatusTypes && alertStatusTypes.length > 0) {
      setChannelStatus(alertStatusTypes);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alertStatusTypes]);

  useEffect(() => {
    store.dispatch(RESET_ACTION);
    store.dispatch(RESET_ENABLE_DISABLE_DATA);
    store.dispatch(RESET_DELETE_DATA);
    store.dispatch(RESET_QUERY_DATA);
    dispatch(getAllAlerts(pgInfo));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, data]);

  useEffect(() => {
    setAlertData(alertList);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alertList]);

  useEffect(() => {
    setPgInfo({ ...pgInfo, page: 1, search: alertSearch });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alertSearch]);

  useEffect(() => {
    if (pagination && pagination?.pages && +pagination.pages > 0) {
      setPages(pagination);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination]);

  useEffect(() => {
    if (pgInfo.page > 0 && pgInfo.per_page > 0) {
      setData((prev) => !prev);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pgInfo]);

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
      setAlertSearch('');
      customToast({
        type: 'success',
        header: 'Successfully Deleted'
      });
      store.dispatch(RESET_DELETE_DATA);
      dispatch(getAllAlerts(pgInfo));
    } else if (kpiAlertDeleteData && kpiAlertDeleteData.status === 'failure') {
      customToast({
        type: 'error',
        header: 'Failed to delete selected alert',
        description: kpiAlertDeleteData.message
      });
      store.dispatch(RESET_DELETE_DATA);
      dispatch(getAllAlerts(pgInfo));
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
        {alertList &&
        alertList.length === 0 &&
        alertSearch === '' &&
        pgInfo?.active === [] &&
        pgInfo?.channel === [] ? (
          <div className="no-alert-container">
            <Noalert />
          </div>
        ) : (
          <div className="explore-wrapper">
            {/* explore wrapper */}
            {/* filter section */}
            <div className="filter-section">
              <AlertFilter
                setAlertSearch={setAlertSearch}
                channelType={channelType}
                setPgInfo={setPgInfo}
                pgInfo={pgInfo}
                channelStatus={channelStatus}
                alertSearch={alertSearch}
              />
            </div>
            {/* table section */}
            <div className="table-section">
              <AlertTable
                alertData={alertData}
                alertSearch={alertSearch}
                setPgInfo={setPgInfo}
                pagination={pages}
                pgInfo={pgInfo}
              />
            </div>
          </div>
        )}
      </>
    );
  }
};
export default Alerts;
