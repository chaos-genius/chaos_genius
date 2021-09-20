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

const Alerts = () => {
  const dispatch = useDispatch();

  const { alertLoading, alertList } = useSelector((state) => state.alert);

  const [alertData, setAlertData] = useState(alertList);
  const [alertSearch, setAlertSearch] = useState('');
  const [alertFilter, setAlertFilter] = useState([]);

  useEffect(() => {
    dispatch(getAllAlerts());
  }, [dispatch]);

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

  if (alertLoading) {
    return (
      <div className="load loader-page">
        <div className="preload"></div>
      </div>
    );
  } else {
    return (
      <div>
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

        {/* explore wrapper */}
        <div className="explore-wrapper">
          {/* filter section */}
          <div className="filter-section">
            <AlertFilter
              setAlertSearch={setAlertSearch}
              setAlertFilter={setAlertFilter}
              alertData={alertList}
            />
          </div>
          {/* table section */}
          <div className="table-section">
            <AlertTable alertData={alertData} alertSearch={alertSearch} />
          </div>
        </div>
      </div>
    );
  }
};
export default Alerts;
