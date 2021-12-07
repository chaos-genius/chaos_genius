import React, { useState, useEffect } from 'react';

import { useSelector, useDispatch } from 'react-redux';

import { Link, useHistory, useParams } from 'react-router-dom';

import './dashboard.scss';

import Setting from '../../assets/images/setting.svg';

import Dashboardgraph from '../../components/DashboardGraph';
import FilterWithTab from '../../components/FilterWithTab';
import Anomaly from '../../components/Anomaly';
import Analystics from '../../components/Analystics';

import { getDashboardSidebar, anomalySetting } from '../../redux/actions';

import store from '../../redux/store';

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

  const { anomalySettingData, anomalySettingLoading } = useSelector((state) => {
    return state.anomaly;
  });

  const [active, setActive] = useState('');
  const [kpiAggregate, SetKpiAggregate] = useState('');
  const [tab, setTabs] = useState('deepdrills');

  useEffect(() => {
    getAllDashboardSidebar();
    store.dispatch(SETTING_RESET);
    store.dispatch(RESET);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getAllDashboardSidebar = () => {
    dispatch(getDashboardSidebar());
  };

  const getAnomalySetting = (id) => {
    dispatch(anomalySetting(id));
  };

  useEffect(() => {
    // if (sidebarList && sidebarList.length !== 0 && kpi === undefined) {
    // setActive(sidebarList[0]?.name);
    // //setKpi(sidebarList[0]?.id);
    // setTabs(location[2]);
    // SetKpiAggregate(sidebarList[0]?.aggregation);
    // getAnomalySetting(sidebarList[0]?.id);
    // history.push(`/dashboard/${location[2]}/${sidebarList[0]?.id}`);
    // } else if (sidebarList && sidebarList.length !== 0) {
    // setActive(
    //   sidebarList.find((item) => item.id.toString() === kpi.toString())?.name
    // );
    // setTabs(location[2]);
    // getAnomalySetting(kpi);
    // SetKpiAggregate(
    //   sidebarList.find((item) => item.id.toString() === kpi.toString())
    //     ?.aggregation
    // );
    // }
    if (
      sidebarList &&
      sidebarList.length !== 0 &&
      dashboard &&
      kpi === undefined
    ) {
      setActive(sidebarList[0]?.name);
      //setKpi(sidebarList[0]?.id);
      setTabs(location[3]);
      SetKpiAggregate(sidebarList[0]?.aggregation);
      getAnomalySetting(sidebarList[0]?.id);
      history.push(
        `/dashboard/${dashboard}/${location[3]}/${sidebarList[0]?.id}`
      );
    } else if (sidebarList && sidebarList.length !== 0 && dashboard) {
      setActive(
        sidebarList.find((item) => item.id.toString() === kpi.toString())?.name
      );
      setTabs(location[3]);
      getAnomalySetting(kpi);
      SetKpiAggregate(
        sidebarList.find((item) => item.id.toString() === kpi.toString())
          ?.aggregation
      );
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sidebarList, history.location.pathname]);

  const onTabClick = (tabs) => {
    setTabs(tabs);
    // window.history.pushState('', '', `/#/dashboard/${tabs}/${kpi}`);
    window.history.pushState(
      '',
      '',
      `/#/dashboard/${dashboard}/${tabs}/${kpi}`
    );
  };

  if (sidebarLoading || anomalySettingLoading) {
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
            <h3>Dashboard</h3>
          </div>
        </div>
        {/* explore wrapper */}
        <div className="explore-wrapper">
          {/* filter section */}
          <div className="filter-section">
            {sidebarList && kpi && (
              <FilterWithTab
                tabs={tab}
                kpi={kpi}
                dashboard={dashboard}
                data={sidebarList}
                setActive={setActive}
                SetKpiAggregate={SetKpiAggregate}
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
                        className={tab === 'deepdrills' ? 'active' : ''}
                        onClick={() => onTabClick('deepdrills')}>
                        DeepDrills
                      </li>

                      <li
                        className={tab === 'anomaly' ? 'active' : ''}
                        onClick={() => onTabClick('anomaly')}>
                        Anomaly
                      </li>
                    </ul>
                  </div>
                  <Link to={`/kpi/settings/${kpi}`}>
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

            {tab === 'deepdrills' && kpi && active && anomalySettingData && (
              <Dashboardgraph
                kpi={kpi}
                dashboard={dashboard}
                kpiName={active}
                kpiAggregate={kpiAggregate}
                anomalystatus={anomalySettingData}
              />
            )}
            {tab === 'anomaly' && kpi && anomalySettingData && (
              <Anomaly kpi={kpi} anomalystatus={anomalySettingData} />
            )}

            {location[2] === 'settings' && (
              <div className="table-section setting-section">
                <Analystics />
              </div>
            )}
          </div>
        </div>
      </>
    );
  }
};

export default Dashboard;
