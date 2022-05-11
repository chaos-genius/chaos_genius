import React, { useEffect, useState } from 'react';

import { Link } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

import Plus from '../../assets/images/plus.svg';

import Filter from '../../components/Filter';
import DataSourceTable from '../../components/DataSourceTable';

import './datasource.scss';

import {
  getAllDataSources,
  getAllDataSourcesForFilter
} from '../../redux/actions';
import store from '../../redux/store';

const RESET_ACTION = {
  type: 'CREATE_RESPONSE_RESET'
};
const DataSource = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const [search, setSearch] = useState('');
  const [data, setData] = useState(false);
  const [dashboardTypeList, setDashboardTypeList] = useState([]);
  const [dashboardSearch, setDashboardSearch] = useState('');
  const [pgInfo, setPgInfo] = useState({
    page: 1,
    per_page: 10,
    search: '',
    datasource_type:
      query.getAll('datasource_type').length !== 0
        ? query.getAll('datasource_type')
        : []
  });
  const [datasourceType, setDatasourceType] = useState([]);
  const [pages, setPages] = useState({});
  const { isLoading, dataSourcesList, pagination } = useSelector(
    (state) => state.dataSource
  );
  const { dataSourceType } = useSelector((state) => state.dataSource);
  const [dataSourceData, setDataSourceData] = useState(dataSourcesList);

  useEffect(() => {
    dispatch(getAllDataSourcesForFilter());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    store.dispatch(RESET_ACTION);
    dispatchGetAllDataSources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const dispatchGetAllDataSources = () => {
    dispatch(getAllDataSources(pgInfo));
  };

  useEffect(() => {
    if (dataSourceType && dataSourceType.length > 0) {
      setDatasourceType(dataSourceType);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSourceType]);

  useEffect(() => {
    setDataSourceData(dataSourcesList);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSourcesList]);

  useEffect(() => {
    setPgInfo({ ...pgInfo, page: 1, search });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

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

  if (isLoading) {
    return (
      <div className="load loader-page">
        <div className="preload"></div>
      </div>
    );
  } else {
    return (
      <div>
        {/* common heading and options */}
        <div className="heading-option">
          <div className="heading-title">
            <h3>Data Source</h3>
          </div>
          <div className="option-button">
            <Link to="/datasource/add" className="btn green-variant-button">
              <img src={Plus} alt="Add" />
              <span>New Data Source</span>
            </Link>
          </div>
        </div>

        {/* explore wrapper */}
        <div className="explore-wrapper">
          {/* filter section */}
          <div className="filter-section">
            <Filter
              datasource
              setSearch={setSearch}
              search={search}
              datasourceList={dataSourcesList}
              datasourceType={datasourceType}
              pgInfo={pgInfo}
              setPgInfo={setPgInfo}
              dashboardTypeList={dashboardTypeList}
              setDashboardTypeList={setDashboardTypeList}
              dashboardSearch={dashboardSearch}
              setDashboardSearch={setDashboardSearch}
            />
          </div>
          {/* table section */}
          <div className="table-section">
            <DataSourceTable
              tableData={dataSourceData}
              changeData={setData}
              search={search}
              setPgInfo={setPgInfo}
              pagination={pages}
              pgInfo={pgInfo}
            />
          </div>
        </div>
      </div>
    );
  }
};

export default DataSource;
