import React, { useEffect, useState } from 'react';

import Search from '../../assets/images/search.svg';
import { debuncerReturn } from '../../utils/simple-debouncer';

const AlertFilter = ({
  setAlertSearch,
  setAlertFilter,
  alertData,
  setAlertStatusFilter
}) => {
  const [checked, setChecked] = useState([]);
  const [channelType, setChannelType] = useState([]);
  const [statusChecked, setStatusChecked] = useState([]);
  const onSearch = (e) => {
    setAlertSearch(e.target.value);
  };

  const debounce = (func) => debuncerReturn(func, 500);

  useEffect(() => {
    setAlertFilter(checked);
    setAlertStatusFilter(statusChecked);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checked, statusChecked]);

  useEffect(() => {
    if (alertData) {
      setChannelType([...new Set(alertData.map((item) => item.alert_channel))]);
    }
  }, [alertData]);

  const onChangeFilter = (e) => {
    if (e.target.checked === true) {
      let selected = checked.concat(e.target.name);
      setChecked(selected);
      setAlertFilter(checked);
    } else if (e.target.checked === false) {
      let selected = checked.filter((data) => data !== e.target.name);
      setChecked(selected);
    }
  };

  const onChangeStatusFilter = (e) => {
    if (e.target.checked === true) {
      let selected = statusChecked.concat(e.target.name);
      setStatusChecked(selected);
      setAlertStatusFilter(statusChecked);
    } else if (e.target.checked === false) {
      let selected = statusChecked.filter((data) => data !== e.target.name);
      setStatusChecked(selected);
    }
  };

  return (
    <div className="common-filter-section">
      <div className="filter-layout">
        <h3>Alert Name </h3>
        <div className="form-group icon search-filter">
          <input
            type="text"
            className="form-control h-40"
            placeholder="Search Alert"
            onChange={debounce(onSearch)}
          />
          <span>
            <img src={Search} alt="Search Icon" />
          </span>
        </div>
      </div>
      <div className="filter-layout">
        <h3>Channel</h3>
        {channelType &&
        channelType[0] !== undefined &&
        channelType.length !== 0 ? (
          channelType.map((type) => {
            return (
              <div className="form-check check-box">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={type}
                  name={type}
                  onChange={(e) => onChangeFilter(e)}
                />
                <label className="form-check-label" htmlFor={type}>
                  {type}
                </label>
              </div>
            );
          })
        ) : (
          <div className="empty-content">No Data Found</div>
        )}
      </div>
      <div className="filter-layout">
        <h3>Status</h3>
        <div className="form-check check-box">
          <input
            className="form-check-input"
            type="checkbox"
            id="active"
            name="active"
            onChange={(e) => onChangeStatusFilter(e)}
          />
          <label className="form-check-label" htmlFor="active">
            Active
          </label>
        </div>
        <div className="form-check check-box">
          <input
            className="form-check-input"
            type="checkbox"
            id="inactive"
            name="inactive"
            onChange={(e) => onChangeStatusFilter(e)}
          />
          <label className="form-check-label" htmlFor="inactive">
            Inactive
          </label>
        </div>
      </div>
    </div>
  );
};

export default AlertFilter;
