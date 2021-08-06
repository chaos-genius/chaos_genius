import React, { useState, useEffect } from 'react';

import Search from '../../assets/images/search.svg';

const DataSourceFilter = ({
  datasource,
  setSearch,
  setKpiSearch,
  setKpiFilter,
  setDataSourceFilter
}) => {
  const [checked, setChecked] = useState([]);
  const onSearch = (e) => {
    if (datasource) {
      setSearch(e.target.value);
    } else {
      setKpiSearch(e.target.value);
    }
  };
  useEffect(() => {
    if (datasource) {
      setDataSourceFilter(checked);
    } else {
      setKpiFilter(checked);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checked]);

  const onChangeFilter = (e) => {
    if (datasource) {
      if (e.target.checked === true) {
        let selected = checked.concat(e.target.name);
        setChecked(selected);
        setDataSourceFilter(checked);
      } else if (e.target.checked === false) {
        let selected = checked.filter((data) => data !== e.target.name);
        setChecked(selected);
      }
    } else {
      if (e.target.checked === true) {
        let selected = checked.concat(e.target.name);
        setChecked(selected);
        setKpiFilter(checked);
      } else if (e.target.checked === false) {
        let selected = checked.filter((data) => data !== e.target.name);
        setChecked(selected);
      }
    }
  };

  return (
    <div className="common-filter-section">
      <div className="filter-layout">
        {datasource ? <h3>Data Connection Name</h3> : <h3>KPI Name</h3>}
        <div className="form-group icon search-filter">
          <input
            type="text"
            className="form-control h-40"
            placeholder="Search"
            onChange={(e) => onSearch(e)}
          />
          <span>
            <img src={Search} alt="Search Icon" />
          </span>
        </div>
      </div>
      <div className="filter-layout">
        <h3>Data Source Type</h3>
        <div className="form-check check-box">
          <input
            className="form-check-input"
            type="checkbox"
            id="flexCheckDefault"
            name="googleAnalytics"
            onChange={(e) => onChangeFilter(e)}
          />
          <label className="form-check-label" htmlFor="flexCheckDefault">
            Google Analytics
          </label>
        </div>
        <div className="form-check check-box">
          <input
            className="form-check-input"
            type="checkbox"
            id="google-sheet"
            name="google Sheets"
            onChange={(e) => onChangeFilter(e)}
          />
          <label className="form-check-label" htmlFor="google-sheet">
            Google Sheets
          </label>
        </div>
        <div className="form-check check-box">
          <input
            className="form-check-input"
            type="checkbox"
            id="amplitude"
            name="amplitude"
            onChange={(e) => onChangeFilter(e)}
          />
          <label className="form-check-label" htmlFor="amplitude">
            Amplitude
          </label>
        </div>
        <div className="form-check check-box">
          <input
            className="form-check-input"
            type="checkbox"
            id="postgre"
            name="postgres"
            onChange={(e) => onChangeFilter(e)}
          />
          <label className="form-check-label" htmlFor="postgre">
            Postgre
          </label>
        </div>
        <div className="form-check check-box">
          <input
            className="form-check-input"
            type="checkbox"
            id="mysql"
            name="mysql"
            onChange={(e) => onChangeFilter(e)}
          />
          <label className="form-check-label" htmlFor="mysql">
            MySQL
          </label>
        </div>
      </div>
    </div>
  );
};

export default DataSourceFilter;
