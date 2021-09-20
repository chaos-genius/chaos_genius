import React, { useEffect, useState } from 'react';

import Search from '../../assets/images/search.svg';

const AlertFilter = ({ setAlertSearch, setAlertFilter, alertData }) => {
  const [checked, setChecked] = useState([]);
  const [channelType, setChannelType] = useState([]);

  const onSearch = (e) => {
    setAlertSearch(e.target.value);
  };

  useEffect(() => {
    setAlertFilter(checked);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checked]);

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

  return (
    <div className="common-filter-section">
      <div className="filter-layout">
        <h3>Alert Name </h3>
        <div className="form-group icon search-filter">
          <input
            type="text"
            className="form-control h-40"
            placeholder="Search Alert"
            onChange={(e) => onSearch(e)}
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
            id="checkboxfilter6"
            name="checkboxfilter6"
          />
          <label className="form-check-label" htmlFor="checkboxfilter6">
            Active
          </label>
        </div>
        <div className="form-check check-box">
          <input
            className="form-check-input"
            type="checkbox"
            id="checkboxfilter7"
            name="checkboxfilter7"
          />
          <label className="form-check-label" htmlFor="checkboxfilter7">
            In Active
          </label>
        </div>
      </div>
    </div>
  );
};

export default AlertFilter;
