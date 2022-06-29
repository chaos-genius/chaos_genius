import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

import Plus from '../../assets/images/plus.svg';

import Filter from '../../components/Filter';
import KPITable from '../../components/KPITable';

import './kpiexplorer.scss';

import {
  getAllKpiExplorer,
  getAllDataSourcesForFilter,
  getDashboardForFilter
} from '../../redux/actions';

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
  const [data, setData] = useState(null);
  const [dashboard, setDashboard] = useState([]);
  const [datasourceType, setDatasourceType] = useState([]);
  const [dashboardTypeList, setDashboardTypeList] = useState([]);
  const [dashboardSearch, setDashboardSearch] = useState('');
  const [pgInfo, setPgInfo] = useState({
    page: 1,
    per_page: 10,
    search: '',
    dashboard_id:
      query.getAll('dashboard_id').length !== 0
        ? query.getAll('dashboard_id')
        : [],
    datasource_type:
      query.getAll('datasource_type').length !== 0
        ? query.getAll('datasource_type')
        : []
  });
  const { isLoading, kpiExplorerList, pagination } = useSelector(
    (state) => state.kpiExplorer
  );
  const { dataSourceType } = useSelector((state) => state.dataSource);
  const { dashboardTypes } = useSelector((state) => state.DashboardHome);
  const [pages, setPages] = useState({});

  const [kpiExplorerData, setKpiExplorerData] = useState(kpiExplorerList);

  useEffect(() => {
    dispatch(getAllDataSourcesForFilter());
    dispatch(getDashboardForFilter());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (data !== null) {
      store.dispatch(KPI_RESET);
      store.dispatch(SETTING_RESET);
      dispatchGetAllKpiExplorer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  useEffect(() => {
    if (dataSourceType && dataSourceType.length > 0) {
      setDatasourceType(dataSourceType);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSourceType]);

  useEffect(() => {
    if (dashboardTypes && dashboardTypes.length > 0) {
      setDashboard(dashboardTypes);
      setDashboardTypeList(dashboard);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dashboardTypes]);

  const dispatchGetAllKpiExplorer = () => {
    dispatch(getAllKpiExplorer(pgInfo));
  };

  useEffect(() => {
    if (pagination && pagination?.pages && +pagination.pages > 0) {
      setPages(pagination);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination]);

  useEffect(() => {
    if (pgInfo.page > 0 && pgInfo.per_page > 0) {
      setData((prev) => !prev);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pgInfo]);

  useEffect(() => {
    if (kpiExplorerList) {
      setKpiExplorerData(kpiExplorerList);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kpiExplorerList]);

  useEffect(() => {
    if (kpiSearch !== pgInfo.search) {
      setPgInfo({ ...pgInfo, page: 1, search: kpiSearch });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kpiSearch]);

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

        {kpiExplorerList &&
        kpiExplorerList.length === 0 &&
        kpiSearch === '' &&
        pgInfo?.dashboard_id === [] &&
        pgInfo?.datasource_type === [] ? (
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
                  kpiList={kpiExplorerList}
                  dashboard={dashboard}
                  datasourceType={datasourceType}
                  kpiSearch={kpiSearch}
                  setPgInfo={setPgInfo}
                  pgInfo={pgInfo}
                  kpi={true}
                  dashboardTypeList={dashboardTypeList}
                  setDashboardTypeList={setDashboardTypeList}
                  dashboardSearch={dashboardSearch}
                  setDashboardSearch={setDashboardSearch}
                />
              </div>
              {/* table section */}
              <div className="table-section">
                <KPITable
                  kpiData={kpiExplorerData}
                  kpiSearch={kpiSearch}
                  changeData={setData}
                  kpiLoading={isLoading}
                  setPgInfo={setPgInfo}
                  pagination={pages}
                  pgInfo={pgInfo}
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
