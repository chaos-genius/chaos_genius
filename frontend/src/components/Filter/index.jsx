import React, { useState, useEffect } from 'react';

import { useHistory, useLocation } from 'react-router-dom';

import Search from '../../assets/images/search.svg';

import Fuse from 'fuse.js';
import { CustomTooltip } from '../../utils/tooltip-helper';
import { debuncerReturn } from '../../utils/simple-debouncer';

const DataSourceFilter = ({
  datasource,
  search,
  setSearch,
  setKpiSearch,
  kpiList,
  kpiSearch,
  dashboard,
  datasourceType,
  kpi,
  pgInfo,
  setPgInfo,
  dashboardTypeList,
  setDashboardTypeList,
  dashboardSearch,
  setDashboardSearch
}) => {
  const location = useLocation();
  const history = useHistory();
  const query = new URLSearchParams(location.search);
  const [checked, setChecked] = useState(pgInfo?.datasource_type);
  const [dashboardFilterList, setDashboardFilterList] = useState(
    pgInfo?.dashboard_id
  );
  const [searchText, setSearchText] = useState(datasource ? search : kpiSearch);
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
    if (query.getAll('datasource_type').length !== 0) {
      setChecked(query.getAll('datasource_type'));
    }
    if (query.getAll('dashboard_id').length !== 0) {
      setDashboardFilterList(query.getAll('dashboard_id'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (datasource) {
      let params = new URLSearchParams();
      for (const key of checked) {
        params.append('datasource_type', key);
      }
      history.push({
        pathname: '/datasource',
        search: '?' + params.toString()
      });
    } else {
      let params = new URLSearchParams();
      for (const key of checked) {
        params.append('datasource_type', key);
      }
      for (const key of dashboardFilterList) {
        params.append('dashboard_id', key);
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
    } else if (dashboardSearch.trim() === '') {
      setDashboardTypeList(dashboard);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dashboardSearch]);

  const searchDashboardName = () => {
    const options = {
      keys: ['label']
    };

    const fuse = new Fuse(dashboard, options);
    const result = fuse.search(dashboardSearch);
    setDashboardTypeList(result.map((value) => value.item));
  };

  const onChangeFilter = (e) => {
    if (datasource) {
      let selected = [];
      if (e.target.checked === true) {
        selected = checked.concat(e.target.name);
      } else if (e.target.checked === false) {
        selected = checked.filter((data) => data !== e.target.name);
      }
      setChecked(selected);
      setPgInfo({ ...pgInfo, page: 1, datasource_type: selected });
    } else {
      let selected = [];
      if (e.target.checked === true) {
        selected = checked.concat(e.target.name);
      } else if (e.target.checked === false) {
        selected = checked.filter((data) => data !== e.target.name);
      }
      setChecked(selected);
      setPgInfo({ ...pgInfo, page: 1, datasource_type: selected });
    }
  };

  const onDashboardFilter = (e, type) => {
    let selected = [];
    if (e.target.checked === true) {
      selected = dashboardFilterList.concat(type.id.toString());
    } else if (e.target.checked === false) {
      selected = dashboardFilterList.filter(
        (data) => data !== type.id.toString()
      );
    }
    setDashboardFilterList(selected);
    setPgInfo({ ...pgInfo, page: 1, dashboard_id: selected });
  };

  const debounce = (func) => debuncerReturn(func, 800);

  return (
    <div className="common-filter-section">
      <div className="filter-layout">
        {datasource ? <h3>Data Connection Name</h3> : <h3>KPI Name</h3>}
        <div className="form-group icon search-filter">
          <input
            type="text"
            value={searchText}
            className="form-control h-40"
            placeholder={kpiList ? 'Search KPI' : 'Search Data Source'}
            onChange={(e) => {
              setSearchText(e.target.value);
              debounce(onSearch)(e);
            }}
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
              value={dashboardSearch}
              onChange={(e) => setDashboardSearch(e.target.value)}
            />
            <span>
              <img src={Search} alt="Search Icon" />
            </span>
          </div>{' '}
          <div className="filter-size">
            {dashboardTypeList && dashboardTypeList.length !== 0 ? (
              dashboardTypeList.map((item) => {
                return (
                  <div className="form-check check-box" key={item.id}>
                    <input
                      className="form-check-input"
                      name={item.label}
                      id={item.id}
                      checked={dashboardFilterList.includes(item.id.toString())}
                      type="checkbox"
                      onChange={(e) => onDashboardFilter(e, item)}
                    />

                    <label
                      className="form-check-label name-tooltip"
                      htmlFor={item.label}>
                      {CustomTooltip(item.label)}
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
            datasourceType.map((type, index) => {
              return (
                <div className="form-check check-box" key={index}>
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={type.value}
                    name={type.value}
                    checked={checked.includes(type.value)}
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
      </div>
    </div>
  );
};

export default DataSourceFilter;
