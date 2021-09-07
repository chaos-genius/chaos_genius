import React, { useEffect } from 'react';

import { Link, useHistory } from 'react-router-dom';

import rightarrow from '../../assets/images/rightarrow.svg';

import FilterAnalystics from '../../components/FilterAnalystics';
import Analystics from '../../components/Analystics';
import { getDashboardSidebar } from '../../redux/actions';
import { useSelector, useDispatch } from 'react-redux';
import { useState } from 'react';
const Kpisetting = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  const location = history.location.pathname.split('/');

  const { sidebarLoading, sidebarList } = useSelector((state) => {
    return state.sidebar;
  });
  const [kpi, setKpi] = useState('');

  useEffect(() => {
    getAllDashboardSidebar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getAllDashboardSidebar = () => {
    dispatch(getDashboardSidebar());
  };

  useEffect(() => {
    if (sidebarList && sidebarList.length !== 0) {
      setKpi(sidebarList[0]?.id);
      window.history.pushState('', '', `/#/kpi/settings/${sidebarList[0]?.id}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sidebarList]);

  if (sidebarLoading) {
    return (
      <div className="loader">
        <div className="loading-text">
          <p>loading</p>
          <span></span>
        </div>
      </div>
    );
  } else {
    return (
      <>
        {/* Page Navigation */}
        <div className="page-navigation">
          {/* Breadcrumb */}
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link to={`/dashboard/autorca/${location[3]}`}>Dashboard</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Settings
              </li>
            </ol>
          </nav>
          {/* Back */}
          <div className="backnavigation">
            <Link to={`/dashboard/autorca/${location[3]}`}>
              <img src={rightarrow} alt="Back" />
              <span>Settings</span>
            </Link>
          </div>
        </div>
        <div className="explore-wrapper">
          {/* filter section */}
          <div className="filter-section">
            {sidebarList && (
              <FilterAnalystics kpi={kpi} setKpi={setKpi} data={sidebarList} />
            )}
          </div>
          {/* table section */}
          <div className="table-section">{kpi && <Analystics kpi={kpi} />}</div>
        </div>
      </>
    );
  }
};

export default Kpisetting;
