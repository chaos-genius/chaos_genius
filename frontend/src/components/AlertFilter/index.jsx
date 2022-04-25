import React, { useEffect, useState } from 'react';

import Search from '../../assets/images/search.svg';
import { debuncerReturn } from '../../utils/simple-debouncer';

const AlertFilter = ({
  setAlertSearch,
  setAlertFilter,
  setAlertStatusFilter,
  alertSearch,
  channelType,
  channelStatus,
  setPgInfo,
  pgInfo
}) => {
  console.log(channelType);
  const [checked, setChecked] = useState(pgInfo?.channel);
  const [statusChecked, setStatusChecked] = useState([]);
  const [searchText, setSearchText] = useState(alertSearch);
  const [channelChecked, setChannelChecked] = useState(
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
  const onSearch = (e) => {
    setAlertSearch(e.target.value);
  };

  const debounce = (func) => debuncerReturn(func, 500);

  // useEffect(() => {
  //   //setAlertFilter(checked);
  //   //setAlertStatusFilter(statusChecked);
  //   //setPgInfo({ ...pgInfo, alertChannels: [] });
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  //   //console.log(checked);
  //   // setPgInfo({
  //   //   ...pgInfo,
  //   //   channel: checked.map((item) => item.toLowerCase())
  //   // });
  // }, [checked]);

  const onChangeFilter = (e) => {
    if (e.target.checked === true) {
      let selected = checked ? checked.concat(e.target.id) : [e.target.id];
      setChecked(selected);
      //setAlertFilter(checked);
      if (selected.length > 0) {
        setPgInfo({
          ...pgInfo,
          channel: selected.map((item) => item.toLowerCase())
        });
      } else if (selected.length === 0) {
        setPgInfo({
          page: pgInfo.page,
          per_page: pgInfo.per_page,
          search: pgInfo.search,
          active: pgInfo.active
        });
      }
    } else if (e.target.checked === false) {
      let selected = checked.filter((data) => data !== e.target.id);
      setChecked(selected);
      if (selected.length > 0) {
        setPgInfo({
          ...pgInfo,
          channel: selected.map((item) => item.toLowerCase())
        });
      } else if (selected.length === 0) {
        setPgInfo({
          page: pgInfo.page,
          per_page: pgInfo.per_page,
          search: pgInfo.search,
          active: pgInfo.active
        });
      }
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
                  name={type.label}
                  onChange={(e) => onChangeStatusFilter(e)}
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
