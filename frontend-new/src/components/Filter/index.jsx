import React, { useState, useEffect } from 'react';

import Search from '../../assets/images/search.svg';

const DataSourceFilter = ({
  datasource,
  setSearch,
  setKpiSearch,
  setKpiFilter,
  setDataSourceFilter,
  datasourceList,
  kpiList
}) => {
  const [checked, setChecked] = useState([]);
  const [datasourceType, setDatasourceType] = useState([]);

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

  useEffect(() => {
    if (datasourceList) {
      setDatasourceType([
        ...new Set(datasourceList.map((item) => item.connection_type))
      ]);
    }
    if (kpiList) {
      setDatasourceType([
        ...new Set(kpiList.map((item) => item.connection_type))
      ]);
    }
  }, [datasourceList, kpiList]);

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
            placeholder={kpiList ? 'Search by KPI Name' : 'Search'}
            onChange={(e) => onSearch(e)}
          />
          <span>
            <img src={Search} alt="Search Icon" />
          </span>
        </div>
      </div>
      <div className="filter-layout">
        <h3>Data Source Type</h3>
        {datasourceType &&
        datasourceType[0] !== undefined &&
        datasourceType.length !== 0 ? (
          datasourceType.map((type) => {
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
    </div>
  );
};

export default DataSourceFilter;
