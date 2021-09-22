import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';

import Plus from '../../assets/images/plus.svg';
import Frame from '../../assets/images/table/channelconfig.svg';

import AlertTable from '../../components/AlertTable';

import './alerts.scss';
import AlertFilter from '../../components/AlertFilter';

import { getAllAlerts } from '../../redux/actions';

import Fuse from 'fuse.js';
import store from '../../redux/store';
import Noalert from '../../components/Noalert';

const RESET_ACTION = {
  type: 'RESET_EMAIL_DATA'
};

const Alerts = () => {
  const dispatch = useDispatch();

  const { alertLoading, alertList } = useSelector((state) => state.alert);
  const [alertData, setAlertData] = useState(alertList);
  const [alertSearch, setAlertSearch] = useState('');
  const [alertFilter, setAlertFilter] = useState([]);
  const [alertStatusFilter, setAlertStatusFilter] = useState([]);
  const [data, setData] = useState(false);

  useEffect(() => {
    store.dispatch(RESET_ACTION);
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
      if (alertFilter.length === 0) {
        setAlertData(alertList);
      } else {
        var arr = [];
        alertFilter &&
          alertFilter.forEach((data) => {
            alertList.forEach((list) => {
              if (list.alert_channel.toLowerCase() === data.toLowerCase()) {
                arr.push(list);
              }
            });
          });
        setAlertData(arr);
      }
    };

    fetchFilter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alertFilter]);

  const fetchStatusFilter = () => {
    if (alertStatusFilter.length === 0) {
      setAlertData(alertList);
    } else {
      var arr = [];
      alertStatusFilter &&
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
    }
  };

  useEffect(() => {
    fetchStatusFilter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alertStatusFilter]);

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
            <h3>Alerts</h3>
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
              <AlertTable
                alertData={alertData}
                alertSearch={alertSearch}
                changeData={setData}
              />
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
