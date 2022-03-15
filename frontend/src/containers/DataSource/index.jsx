import React, { useEffect, useState } from 'react';

import { Link, useLocation } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';

import Fuse from 'fuse.js';

import Plus from '../../assets/images/plus.svg';

import Filter from '../../components/Filter';
import DataSourceTable from '../../components/DataSourceTable';

import './datasource.scss';

import { getAllDataSources } from '../../redux/actions';
import store from '../../redux/store';

const RESET_ACTION = {
  type: 'CREATE_RESPONSE_RESET'
};
const DataSource = () => {
  const dispatch = useDispatch();

  const location = useLocation();

  const query = new URLSearchParams(location.search);

  const [search, setSearch] = useState('');

  const [dataSourceFilter, setDataSourceFilter] = useState([]);
  const [data, setData] = useState(false);
  const [filterData, setFilterData] = useState([]);
  const { isLoading, dataSourcesList } = useSelector(
    (state) => state.dataSource
  );
  const [dataSourceData, setDataSourceData] = useState(dataSourcesList);

  useEffect(() => {
    store.dispatch(RESET_ACTION);
    dispatchGetAllDataSources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const dispatchGetAllDataSources = () => {
    dispatch(getAllDataSources());
  };

  useEffect(() => {
    if (query.getAll('datasourcetype').length !== 0 && dataSourcesList) {
      setDataSourceFilter(query.getAll('datasourcetype'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSourcesList]);

  useEffect(() => {
    if (search !== '') {
      searchDataSource();
    } else if (filterData.length !== 0) {
      setDataSourceData(filterData);
    } else {
      setDataSourceData(dataSourcesList);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, dataSourcesList, filterData]);

  const searchDataSource = () => {
    const options = {
      keys: ['name', 'connection_type']
    };

    const fuse = new Fuse(dataSourcesList, options);

    const result = fuse.search(search);
    setDataSourceData(
      result.map((item) => {
        return item.item;
      })
    );
  };

  useEffect(() => {
    const fetchFilter = () => {
      if (dataSourceFilter.length === 0) {
        setFilterData(dataSourcesList);
      } else {
        var arr = [];
        dataSourceFilter &&
          dataSourceFilter.forEach((data) => {
            dataSourcesList.forEach((list) => {
              if (list.connection_type.toLowerCase() === data.toLowerCase()) {
                arr.push(list);
              }
            });
          });

        setFilterData(arr);
      }
    };
    fetchFilter();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSourceFilter]);

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
              setDataSourceFilter={setDataSourceFilter}
              datasourceList={dataSourcesList}
            />
          </div>
          {/* table section */}
          <div className="table-section">
            <DataSourceTable
              tableData={dataSourceData}
              changeData={setData}
              search={search}
            />
          </div>
        </div>
      </div>
    );
  }
};

export default DataSource;
