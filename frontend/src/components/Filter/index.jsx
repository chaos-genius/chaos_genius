import React, { useState, useEffect } from 'react';

import Tooltip from 'react-tooltip-lite';

import Search from '../../assets/images/search.svg';

const DataSourceFilter = ({
  datasource,
  setSearch,
  setKpiSearch,
  setKpiFilter,
  setDataSourceFilter,
  datasourceList,
  kpiList,
  setDashboardFilter,
  setDashboardNameSearch
}) => {
  const [checked, setChecked] = useState([]);
  const [datasourceType, setDatasourceType] = useState([]);
  const [dashboard, setDashboard] = useState([]);
  const [dashboardFilterList, setDashboardFilterList] = useState([]);

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
    if (kpiList) {
      setDashboardFilter(dashboardFilterList);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dashboardFilterList]);

  useEffect(() => {
    if (datasourceList) {
      setDatasourceType([
        ...new Set(datasourceList.map((item) => item.connection_type))
      ]);
    }
    if (kpiList) {
      setDatasourceType([
        ...new Set(kpiList.map((item) => item.data_source.connection_type))
      ]);
      var unique = [];
      kpiList.map((item) =>
        item.dashboards.map((key) => unique.push(key.name))
      );
      setDashboard([...new Set(unique)]);
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
  const onDashboardFilter = (e) => {
    if (e.target.checked === true) {
      let selected = dashboardFilterList.concat(e.target.name);

      setDashboardFilterList(selected);
    } else if (e.target.checked === false) {
      let selected = dashboardFilterList.filter(
        (data) => data !== e.target.name
      );

      setDashboardFilterList(selected);
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
            placeholder={kpiList ? 'Search KPI' : 'Search Data Source'}
            onChange={(e) => onSearch(e)}
          />
          <span>
            <img src={Search} alt="Search Icon" />
          </span>
        </div>
      </div>{' '}
      {kpiList && kpiList.length !== 0 && (
        <div className="filter-layout">
          <h3>Dashboard</h3>{' '}
          <div className="form-group icon ">
            <input
              type="text"
              className="form-control h-40"
              placeholder="Search dashboard"
              onChange={(e) => {
                setDashboardNameSearch(e.target.value);
              }}
            />
            <span>
              <img src={Search} alt="Search Icon" />
            </span>
          </div>{' '}
          <div className="filter-size">
            {dashboard &&
              dashboard.length !== 0 &&
              dashboard.map((item) => {
                return (
                  <div className="form-check check-box">
                    <input
                      className="form-check-input"
                      name={item}
                      id={item}
                      type="checkbox"
                      onChange={(e) => onDashboardFilter(e)}
                    />
                    <Tooltip
                      className="tooltip-name"
                      direction="right"
                      content={<span> {item}</span>}>
                      <label
                        className="form-check-label name-tooltip"
                        htmlFor={item}>
                        {item}
                      </label>
                    </Tooltip>
                  </div>
                );
              })}
          </div>
        </div>
      )}
      <div className="filter-layout">
        <h3>Data Source Type</h3>{' '}
        <div className={datasource ? '' : 'filter-size'}>
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
    </div>
  );
};

export default DataSourceFilter;
