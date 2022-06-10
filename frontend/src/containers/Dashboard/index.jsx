import React, { useState, useEffect } from 'react';

import { useSelector, useDispatch } from 'react-redux';

import { Link, useHistory, useParams } from 'react-router-dom';

import './dashboard.scss';

import Setting from '../../assets/images/setting.svg';
import rightarrow from '../../assets/images/rightarrow.svg';
import Dashboardgraph from '../../components/DashboardGraph';
import FilterWithTab from '../../components/FilterWithTab';
import Anomaly from '../../components/Anomaly';
import Analystics from '../../components/Analystics';

import {
  getDashboardSidebar,
  anomalySetting,
  getTimeCuts
} from '../../redux/actions';

import store from '../../redux/store';
import EmptyKpisDashboard from '../../components/EmptyKpisDashboard';

const SETTING_RESET = {
  type: 'SETTING_RESET'
};

const RESET = {
  type: 'RESET_DATA'
};

const Dashboard = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  const location = history.location.pathname.split('/');
  const kpi = useParams().kpi;
  const dashboard = useParams().dashboard;

  const { sidebarLoading, sidebarList } = useSelector((state) => {
    return state.sidebar;
  });

  const { anomalySettingData } = useSelector((state) => {
    return state.anomaly;
  });

  const [active, setActive] = useState('');
  const [tab, setTabs] = useState('deepdrills');
  const [breadCrumbs, setBreadCrumbs] = useState('');

  useEffect(() => {
    getAllDashboardSidebar();
    store.dispatch(SETTING_RESET);
    store.dispatch(RESET);
    dispatch(getTimeCuts());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getAllDashboardSidebar = () => {
    dispatch(getDashboardSidebar({ dashboard_id: dashboard, paginate: false }));
  };

  const getAnomalySetting = (id) => {
    dispatch(anomalySetting(id));
  };

  useEffect(() => {
    if (
      sidebarList?.data &&
      sidebarList?.data.length !== 0 &&
      dashboard &&
      kpi === undefined
    ) {
      setActive(sidebarList?.data[0]?.name);

      setTabs(location[3]);
      getAnomalySetting(sidebarList?.data[0]?.id);
      history.push(
        `/dashboard/${dashboard}/${location[3]}/${sidebarList?.data[0].id}`
      );
    } else if (
      sidebarList?.data &&
      sidebarList?.data.length !== 0 &&
      kpi &&
      dashboard
    ) {
      setActive(
        sidebarList?.data.find((item) => item.id.toString() === kpi.toString())
          ?.name
      );

      setBreadCrumbs(
        sidebarList?.dashboards?.find(
          (item) => item.id.toString() === dashboard.toString()
        )?.name
      );
      setTabs(location[3]);
      getAnomalySetting(kpi);
    } else if (sidebarList && sidebarList?.dashboards) {
      setBreadCrumbs(
        sidebarList?.dashboards?.find(
          (item) => item.id.toString() === dashboard.toString()
        )?.name
      );
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sidebarList, history.location.pathname]);

  const onTabClick = (tabs) => {
    setTabs(tabs);

    history.push(`/dashboard/${dashboard}/${tabs}/${kpi}`);
  };

  if (sidebarLoading) {
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
          <div className="page-navigation dashboard-page-navigate">
            {/* Breadcrumb */}
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb">
                <li className="breadcrumb-item">
                  <Link to="/dashboard">Dashboard </Link>
                </li>

                <li className="breadcrumb-item active" aria-current="page">
                  {breadCrumbs}
                </li>
                {/* )} */}
              </ol>
            </nav>
            {/* Back */}

            <div className="backnavigation">
              <Link to="/dashboard">
                <img src={rightarrow} alt="Back" />
                <span>{breadCrumbs}</span>
              </Link>
            </div>
            {/* )} */}
          </div>
        </div>
        {sidebarList?.data && sidebarList?.data.length === 0 ? (
          <div className="no-alert-container">
            <EmptyKpisDashboard />
          </div>
        ) : (
          <>
            {/* explore wrapper */}
            <div className="explore-wrapper">
              {/* filter section */}
              <div className="filter-section">
                {sidebarList?.data && kpi && (
                  <FilterWithTab
                    tabs={tab}
                    kpi={kpi}
                    dashboard={dashboard}
                    data={sidebarList?.data}
                    setActive={setActive}
                  />
                )}
              </div>
              {/* Graph Section*/}
              <div className="graph-section">
                {/* Dashboard Header */}
                {location[2] !== 'settings' ? (
                  <div className="dashboard-layout dashboard-header-tab">
                    <div className="dashboard-subheader">
                      <div className="common-tab">
                        <ul>
                          <li
                            className={
                              location[3] === 'deepdrills' ? 'active' : ''
                            }
                            onClick={() => onTabClick('deepdrills')}>
                            KPI Summary
                          </li>

                          <li
                            className={
                              location[3] === 'anomaly' ? 'active' : ''
                            }
                            onClick={() => onTabClick('anomaly')}>
                            Anomaly
                          </li>
                        </ul>
                      </div>
                      <Link to={`/dashboard/${dashboard}/settings/${kpi}`}>
                        <div className="common-option">
                          <button className="btn grey-button">
                            <img src={Setting} alt="Setting" />
                            <span>Settings</span>
                          </button>
                        </div>
                      </Link>
                    </div>
                  </div>
                ) : (
                  ''
                )}

                {tab === 'deepdrills' &&
                  kpi &&
                  active &&
                  anomalySettingData && (
                    <Dashboardgraph
                      kpi={kpi}
                      kpiName={active}
                      anomalystatus={anomalySettingData}
                    />
                  )}
                {tab === 'anomaly' &&
                  kpi &&
                  anomalySettingData &&
                  dashboard && (
                    <Anomaly
                      kpi={kpi}
                      anomalystatus={anomalySettingData}
                      dashboard={dashboard}
                    />
                  )}

                {location[2] === 'settings' && (
                  <div className="table-section setting-section">
                    <Analystics />
                  </div>
                )}
              </div>
            </div>
          </>
        )}{' '}
      </>
    );
  }
};

export default Dashboard;
