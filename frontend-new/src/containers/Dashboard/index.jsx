import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './dashboard.scss';
import rightarrow from '../../assets/images/rightarrow.svg';
import FilterWithTab from '../../components/FilterWithTab';
import Dashboardgraph from '../../components/DashboardGraph';
import { useSelector, useDispatch } from 'react-redux';
import { getDashboardSidebar } from '../../redux/actions';
const Dashboard = () => {
  const dispatch = useDispatch();
  const [kpi, setKpi] = useState(1);

  const { sidebarLoading, sidebarList } = useSelector((state) => {
    return state.dashboard;
  });

  useEffect(() => {
    getAllDashboardSidebar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kpi]);

  const getAllDashboardSidebar = () => {
    dispatch(getDashboardSidebar());
  };

  if (sidebarLoading) {
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
        {/* Page Navigation */}
        <div className="page-navigation">
          {/* Breadcrumb */}
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link to="/">Dashboard </Link>
              </li>
              <li className="breadcrumb-item">
                <Link to="/"> Test Dashboard 1 </Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                AutoRCA
              </li>
            </ol>
          </nav>
          {/* Back */}
          <div className="backnavigation">
            <Link to="/">
              <img src={rightarrow} alt="Back" />
              <span>Add Data Sources</span>{' '}
            </Link>
          </div>
        </div>

        {/* explore wrapper */}
        <div className="explore-wrapper">
          {/* filter section */}
          <div className="filter-section">
            <FilterWithTab setKpi={setKpi} data={sidebarList} />
          </div>{' '}
          {/* Graph Section*/}
          <div className="graph-section">
            <Dashboardgraph kpi={kpi} />
          </div>
        </div>
      </div>
    );
  }
};

export default Dashboard;
