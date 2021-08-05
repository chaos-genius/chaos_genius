import React, { useEffect, useState } from 'react';

import { Link } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';

import Fuse from 'fuse.js';

import Plus from '../../assets/images/plus.svg';

import Filter from '../../components/Filter';
import DataSourceTable from '../../components/DataSourceTable';

import './datasource.scss';

import { getAllDataSources } from '../../redux/actions';

const DataSource = () => {
  const dispatch = useDispatch();

  const [search, setSearch] = useState('');
  const [dataSourceData, setDataSourceData] = useState([]);
  const [dataSourceFilter, setDataSourceFilter] = useState([]);

  const { isLoading, dataSourcesList } = useSelector(
    (state) => state.dataSource
  );

  useEffect(() => {
    dispatchGetAllDataSources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const dispatchGetAllDataSources = () => {
    dispatch(getAllDataSources());
  };

  useEffect(() => {
    if (search !== '') {
      searchDataSource();
    } else {
      setDataSourceData(dataSourcesList);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, dataSourcesList]);

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
        setDataSourceData(dataSourcesList);
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
        setDataSourceData(arr);
      }
    };
    fetchFilter();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSourceFilter]);

  if (isLoading) {
    return (
      <div className="loader loader-page">
        <div className="loading-text">
          <p>loading</p>
          <span></span>
        </div>
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
            <Link to="/datasource/add" className="btn black-button">
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
            />
          </div>
          {/* table section */}
          <div className="table-section">
            <DataSourceTable tableData={dataSourceData} />
          </div>
        </div>
      </div>
    );
  }
};

export default DataSource;
