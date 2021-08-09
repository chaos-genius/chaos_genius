import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';

import Fuse from 'fuse.js';

import Plus from '../../assets/images/plus.svg';

import Filter from '../../components/Filter';
import KPITable from '../../components/KPITable';

import './kpiexplorer.scss';

import { getAllKpiExplorer } from '../../redux/actions';

const KpiExplorer = () => {
  const dispatch = useDispatch();

  const [kpiSearch, setKpiSearch] = useState('');
  const [kpiExplorerData, setKpiExplorerData] = useState([]);

  const [kpiFilter, setKpiFilter] = useState([]);

  const { isLoading, kpiExplorerList } = useSelector(
    (state) => state.kpiExplorer
  );

  useEffect(() => {
    dispatchGetAllKpiExplorer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const dispatchGetAllKpiExplorer = () => {
    dispatch(getAllKpiExplorer());
  };
  useEffect(() => {
    if (kpiSearch !== '') {
      searchDataSource();
    } else {
      setKpiExplorerData(kpiExplorerList);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kpiSearch, kpiExplorerList]);

  const searchDataSource = () => {
    const options = {
      keys: ['name', 'connection_type']
    };

    const fuse = new Fuse(kpiExplorerList, options);

    const result = fuse.search(kpiSearch);
    setKpiExplorerData(
      result.map((item) => {
        return item.item;
      })
    );
  };
  useEffect(() => {
    const fetchFilter = () => {
      if (kpiFilter.length === 0) {
        setKpiExplorerData(kpiExplorerList);
      } else {
        var arr = [];
        kpiFilter &&
          kpiFilter.forEach((data) => {
            kpiExplorerList.forEach((list) => {
              if (list.name.toLowerCase() === data.toLowerCase()) {
                arr.push(list);
              }
            });
          });
        setKpiExplorerData(arr);
      }
    };
    fetchFilter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kpiFilter]);

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
            <h3>KPI Explorer</h3>
          </div>
          <div className="option-button">
            <Link to="/kpiexplorer/add" className="btn green-variant-button">
              <img src={Plus} alt="Add" />
              <span>New KPI</span>
            </Link>
          </div>
        </div>

        {/* explore wrapper */}
        <div className="explore-wrapper">
          {/* filter section */}
          <div className="filter-section">
            <Filter
              setKpiSearch={setKpiSearch}
              setKpiFilter={setKpiFilter}
              kpiList={kpiExplorerList}
            />
          </div>
          {/* table section */}
          <div className="table-section">
            <KPITable kpiData={kpiExplorerData} />
          </div>
        </div>
      </div>
    );
  }
};

export default KpiExplorer;
