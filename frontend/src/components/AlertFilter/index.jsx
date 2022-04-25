import React, { useState } from 'react';

import Search from '../../assets/images/search.svg';
import { debuncerReturn } from '../../utils/simple-debouncer';

const AlertFilter = ({
  setAlertSearch,
  alertSearch,
  channelType,
  channelStatus,
  setPgInfo,
  pgInfo
}) => {
  const [checked, setChecked] = useState(pgInfo?.channel);
  const [statusChecked, setStatusChecked] = useState(pgInfo?.active);
  const [searchText, setSearchText] = useState(alertSearch);
  const [channelChecked] = useState(
    channelType.length &&
      channelType.map((channel) => {
        const foundIndex = pgInfo?.channel?.findIndex((item) => {
          return item === channel.value.toLowerCase();
        });
        if (foundIndex > -1) {
          return true;
        }
        return false;
      })
  );
  const [activeChecked] = useState(
    channelStatus.length &&
      channelStatus.map((status) => {
        const foundIndex = pgInfo?.active?.findIndex((item) => {
          return item === status.value;
        });
        if (foundIndex > -1) {
          return true;
        }
        return false;
      })
  );
  const onSearch = (e) => {
    setAlertSearch(e.target.value);
  };

  const debounce = (func) => debuncerReturn(func, 500);

  const onChangeFilter = (e) => {
    let selected = [];
    if (e.target.checked === true) {
      selected = checked.concat(e.target.id);
    } else if (e.target.checked === false) {
      selected = checked.filter((data) => data !== e.target.id);
    }
    setChecked(selected);
    setPgInfo({
      ...pgInfo,
      page: 1,
      channel: selected.map((item) => item.toLowerCase())
    });
  };

  const onChangeStatusFilter = (e, value) => {
    let selected = [];
    if (e.target.checked === true) {
      selected = statusChecked.concat(value);
    } else if (e.target.checked === false) {
      selected = statusChecked.filter((data) => data !== value);
    }
    setStatusChecked(selected);
    setPgInfo({
      ...pgInfo,
      page: 1,
      active: selected.map((item) => item)
    });
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
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              debounce(onSearch)(e);
            }}
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
          channelType.map((type, index) => {
            return (
              <div className="form-check check-box" key={index}>
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={type.value}
                  name={type.label}
                  checked={channelChecked[index]}
                  onChange={(e) => onChangeFilter(e)}
                />
                <label className="form-check-label" htmlFor={type.label}>
                  {type.label}
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
        {channelStatus &&
        channelStatus[0] !== undefined &&
        channelStatus.length !== 0 ? (
          channelStatus.map((type, index) => {
            return (
              <div className="form-check check-box" key={index}>
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={type.label}
                  checked={activeChecked[index]}
                  name={type.label}
                  onChange={(e) => onChangeStatusFilter(e, type.value)}
                />
                <label className="form-check-label" htmlFor={type.label}>
                  {type.label}
                </label>
              </div>
            );
          })
        ) : (
          <div className="empty-content">No Data Found</div>
        )}
      </div>
    </div>
  );
};

export default AlertFilter;
