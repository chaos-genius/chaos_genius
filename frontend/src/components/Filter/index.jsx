import React, { useState, useEffect } from 'react';

import { useHistory, useLocation } from 'react-router-dom';

import Search from '../../assets/images/search.svg';

import Fuse from 'fuse.js';
import { CustomTooltip } from '../../utils/tooltip-helper';
import { debuncerReturn } from '../../utils/simple-debouncer';

const DataSourceFilter = ({
  datasource,
  setSearch,
  setKpiSearch,
  setKpiFilter,
  setDataSourceFilter,
  datasourceList,
  kpiList,
  setDashboardFilter,
  kpi
}) => {
  const location = useLocation();
  const history = useHistory();
  const query = new URLSearchParams(location.search);

  const [checked, setChecked] = useState([]);
  const [datasourceType, setDatasourceType] = useState([]);
  const [dashboard, setDashboard] = useState([]);
  const [dashboardFilterList, setDashboardFilterList] = useState([]);
  const [dashboardSearch, setDashboardSearch] = useState('');
  const [kpiData, setKpiData] = useState(kpiList);

  const onSearch = (e) => {
    if (datasource) {
      setSearch(e.target.value);
      let params = new URLSearchParams();
      params.append('search', e.target.value);
      window.history.pushState('', '', '/#/datasource?' + params.toString());
    } else {
      setKpiSearch(e.target.value);
      let params = new URLSearchParams();
      params.append('search', e.target.value);
      window.history.pushState('', '', '/#/kpiexplorer?' + params.toString());
    }
  };

  useEffect(() => {
    if (query.getAll('datasourcetype').length !== 0) {
      setChecked(query.getAll('datasourcetype'));
    }
    if (query.getAll('dashboard').length !== 0) {
      setDashboardFilterList(query.getAll('dashboard'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (datasource) {
      setDataSourceFilter(checked);
      let params = new URLSearchParams();
      for (const key of checked) {
        params.append('datasourcetype', key.toLowerCase());
      }
      history.push({
        pathname: '/datasource',
        search: '?' + params.toString()
      });
    } else {
      setKpiFilter(checked);
      setDashboardFilter(dashboardFilterList);
      let params = new URLSearchParams();
      for (const key of checked) {
        params.append('datasourcetype', key.toLowerCase());
      }
      for (const key of dashboardFilterList) {
        params.append('dashboard', key.toLowerCase());
      }
      history.push({
        pathname: '/kpiexplorer',
        search: '?' + params.toString()
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checked, dashboardFilterList]);

  useEffect(() => {
    if (dashboardSearch !== '') {
      searchDashboardName();
    } else if (kpiList) {
      setKpiData(kpiList);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dashboardSearch]);

  const searchDashboardName = () => {
    const options = {
      keys: ['dashboards.name']
    };

    const fuse = new Fuse(kpiList, options);

    const result = fuse.search(dashboardSearch);
    setKpiData(
      result.map((item) => {
        return item.item;
      })
    );
  };

  useEffect(() => {
    if (datasourceList) {
      setDatasourceType([
        ...new Set(datasourceList.map((item) => item.connection_type))
      ]);
    }
    if (kpiData) {
      setDatasourceType([
        ...new Set(kpiList.map((item) => item.data_source.connection_type))
      ]);
      var unique = [];
      kpiData.map((item) =>
        item.dashboards.map((key) =>
          unique.push({ name: key.name, id: key.id })
        )
      );
      let key = 'id';

      setDashboard([
        ...new Map(unique.map((item) => [item[key], item])).values()
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datasourceList, kpiData]);

  const onChangeFilter = (e) => {
    if (datasource) {
      if (e.target.checked === true) {
        let selected = checked.concat(e.target.name.toLowerCase());
        setChecked(selected);
        setDataSourceFilter(checked);
      } else if (e.target.checked === false) {
        let selected = checked.filter(
          (data) => data !== e.target.name.toLowerCase()
        );
        setChecked(selected);
      }
    } else {
      if (e.target.checked === true) {
        let selected = checked.concat(e.target.name.toLowerCase());
        setChecked(selected);
        setKpiFilter(checked);
      } else if (e.target.checked === false) {
        let selected = checked.filter(
          (data) => data !== e.target.name.toLowerCase()
        );
        setChecked(selected);
      }
    }
  };

  const onDashboardFilter = (e, type) => {
    if (e.target.checked === true) {
      let selected = dashboardFilterList.concat(type.id.toString());
      setDashboardFilterList(selected);
    } else if (e.target.checked === false) {
      let selected = dashboardFilterList.filter(
        (data) => data !== type.id.toString()
      );
      setDashboardFilterList(selected);
    }
  };

  const implementDashboardSearch = (e) => {
    setDashboardSearch(e.target.value);
  };

  const debounce = (func) => debuncerReturn(func, 500);

  return (
    <div className="common-filter-section">
      <div className="filter-layout">
        {datasource ? <h3>Data Connection Name</h3> : <h3>KPI Name</h3>}
        <div className="form-group icon search-filter">
          <input
            type="text"
            className="form-control h-40"
            placeholder={kpiList ? 'Search KPI' : 'Search Data Source'}
            onChange={debounce(onSearch)}
          />
          <span>
            <img src={Search} alt="Search Icon" />
          </span>
        </div>
      </div>{' '}
      {kpi && (
        <div className="filter-layout">
          <h3>Dashboard</h3>{' '}
          <div className="form-group icon ">
            <input
              type="text"
              className="form-control h-40"
              placeholder="Search dashboard"
              onChange={debounce(implementDashboardSearch)}
            />
            <span>
              <img src={Search} alt="Search Icon" />
            </span>
          </div>{' '}
          <div className="filter-size">
            {dashboard && dashboard.length !== 0 ? (
              dashboard.map((item) => {
                return (
                  <div className="form-check check-box">
                    <input
                      className="form-check-input"
                      name={item.name}
                      id={item.name}
                      checked={dashboardFilterList.includes(item.id.toString())}
                      type="checkbox"
                      onChange={(e) => onDashboardFilter(e, item)}
                    />

                    <label
                      className="form-check-label name-tooltip"
                      htmlFor={item.name}>
                      {CustomTooltip(item.name)}
                    </label>
                  </div>
                );
              })
            ) : (
              <div className="empty-content">No Data Found</div>
            )}
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
                    checked={checked.includes(type.toLowerCase())}
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
