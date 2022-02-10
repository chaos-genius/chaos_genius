import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';

import Fuse from 'fuse.js';

import Plus from '../../assets/images/plus.svg';

import Filter from '../../components/Filter';
import KPITable from '../../components/KPITable';

import './kpiexplorer.scss';

import { getAllKpiExplorer } from '../../redux/actions';

import store from '../../redux/store';
import EmptyKPI from '../../components/EmptyKPI';

const KPI_RESET = {
  type: 'KPI_RESET'
};

const SETTING_RESET = {
  type: 'SETTING_RESET'
};

const KpiExplorer = () => {
  const dispatch = useDispatch();

  const location = useLocation();

  const query = new URLSearchParams(location.search);

  const [kpiSearch, setKpiSearch] = useState('');
  const [data, setData] = useState(false);
  const [kpiFilter, setKpiFilter] = useState([]);
  const [dashboardFilter, setDashboardFilter] = useState([]);
  const [filterData, setFilterData] = useState([]);
  const { isLoading, kpiExplorerList } = useSelector(
    (state) => state.kpiExplorer
  );

  const [kpiExplorerData, setKpiExplorerData] = useState(kpiExplorerList);

  useEffect(() => {
    store.dispatch(KPI_RESET);
    store.dispatch(SETTING_RESET);
    dispatchGetAllKpiExplorer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const dispatchGetAllKpiExplorer = () => {
    dispatch(getAllKpiExplorer());
  };

  useEffect(() => {
    if (query.getAll('datasourcetype').length !== 0 && kpiExplorerList) {
      setKpiFilter(query.getAll('datasourcetype'));
    } else if (query.getAll('dashboard').length !== 0 && kpiExplorerList) {
      setDashboardFilter(query.getAll('dashboard'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kpiExplorerList]);

  useEffect(() => {
    if (kpiSearch !== '') {
      searchDataSource();
    } else if (filterData && filterData.length !== 0) {
      setKpiExplorerData(filterData);
    } else if (kpiExplorerList) {
      setKpiExplorerData(kpiExplorerList);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kpiSearch, kpiExplorerList, filterData]);

  const searchDataSource = () => {
    const options = {
      keys: ['name', 'dashboards.name']
    };

    const fuse = new Fuse(kpiExplorerData, options);

    const result = fuse.search(kpiSearch);
    setKpiExplorerData(
      result.map((item) => {
        return item.item;
      })
    );
  };

  useEffect(() => {
    const fetchFilter = () => {
      var arr = [];
      if (kpiFilter.length === 0 && dashboardFilter.length === 0) {
        setFilterData(kpiExplorerList);
      } else if (kpiFilter.length !== 0 && dashboardFilter.length === 0) {
        kpiFilter &&
          kpiFilter.forEach((data) => {
            kpiExplorerList &&
              kpiExplorerList.forEach((list) => {
                if (
                  list.data_source.connection_type.toLowerCase() ===
                  data.toLowerCase()
                ) {
                  arr.push(list);
                }
              });
          });
        setFilterData(arr);
      } else if (dashboardFilter.length !== 0 && kpiFilter.length === 0) {
        dashboardFilter &&
          dashboardFilter.forEach((data) => {
            kpiExplorerList &&
              kpiExplorerList.forEach((list) => {
                list.dashboards.forEach((value) => {
                  if (data.toString() === value.id.toString()) {
                    arr.push(list);
                  }
                });
              });
          });
        setFilterData(arr);
      } else if (dashboardFilter.length !== 0 && kpiFilter.length !== 0) {
        dashboardFilter &&
          dashboardFilter.forEach((dashboard) => {
            kpiFilter &&
              kpiFilter.forEach((kpi) => {
                kpiExplorerList &&
                  kpiExplorerList.forEach((list) => {
                    list.dashboards.forEach((value) => {
                      if (
                        list.data_source.connection_type.toLowerCase() ===
                          kpi.toLowerCase() &&
                        value.id.toString() === dashboard.toString()
                      ) {
                        arr.push(list);
                      }
                    });
                  });
              });
          });
        setFilterData(arr);
      }
    };
    fetchFilter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kpiFilter, dashboardFilter]);

  if (isLoading) {
    return (
      <div className="load loader-page">
        <div className="preload"></div>
      </div>
    );
  } else {
    return (
      <>
        {/* common heading and options */}
        <div className="heading-option">
          <div className="heading-title">
            <h3>KPI Explorer</h3>
          </div>
          <div className="option-button">
            <Link to="/kpiexplorer/add" className="btn green-variant-button">
              <img src={Plus} alt="Add" />
              <span>New KPI</span>
            </Link>
          </div>
        </div>

        {kpiExplorerList && kpiExplorerList.length === 0 ? (
          <div className="empty-dashboard-container">
            <EmptyKPI />
          </div>
        ) : (
          <>
            {/* explore wrapper */}
            <div className="explore-wrapper">
              {/* filter section */}
              <div className="filter-section">
                <Filter
                  setKpiSearch={setKpiSearch}
                  setKpiFilter={setKpiFilter}
                  kpiList={kpiExplorerList}
                  setDashboardFilter={setDashboardFilter}
                  kpi={true}
                />
              </div>
              {/* table section */}
              <div className="table-section">
                <KPITable
                  kpiData={kpiExplorerData}
                  kpiSearch={kpiSearch}
                  changeData={setData}
                  kpiLoading={isLoading}
                />
              </div>
            </div>
          </>
        )}
      </>
    );
  }
};

export default KpiExplorer;
