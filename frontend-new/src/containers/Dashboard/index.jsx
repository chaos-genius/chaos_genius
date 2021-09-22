import React, { useState, useEffect } from 'react';

import { useSelector, useDispatch } from 'react-redux';

import { Link, useHistory, useParams } from 'react-router-dom';

import './dashboard.scss';

import Setting from '../../assets/images/setting.svg';

import Dashboardgraph from '../../components/DashboardGraph';
import FilterWithTab from '../../components/FilterWithTab';
import Anomaly from '../../components/Anomaly';
import Analystics from '../../components/Analystics';

import { getDashboardSidebar } from '../../redux/actions';

const Dashboard = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const kpi = useParams().kpi;
  const [active, setActive] = useState('');
  //const [kpi, setKpi] = useState();
  const [kpiAggregate, SetKpiAggregate] = useState('');
  const [tab, setTabs] = useState('autorca');

  const location = history.location.pathname.split('/');

  const { sidebarLoading, sidebarList } = useSelector((state) => {
    return state.sidebar;
  });

  useEffect(() => {
    getAllDashboardSidebar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getAllDashboardSidebar = () => {
    dispatch(getDashboardSidebar());
  };

  useEffect(() => {
    if (sidebarList && sidebarList.length !== 0 && kpi === undefined) {
      setActive(sidebarList[0]?.name);
      //setKpi(sidebarList[0]?.id);
      setTabs(location[2]);
      SetKpiAggregate(sidebarList[0]?.aggregation);

      history.push(`/dashboard/${location[2]}/${sidebarList[0]?.id}`);
    } else if (sidebarList && sidebarList.length !== 0) {
      setActive(
        sidebarList.find((item) => item.id.toString() === kpi.toString())?.name
      );
      setTabs(location[2]);
      SetKpiAggregate(
        sidebarList.find((item) => item.id.toString() === kpi.toString())
          ?.aggregation
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sidebarList]);

  const onTabClick = (tabs) => {
    setTabs(tabs);
    window.history.pushState('', '', `/#/dashboard/${tabs}/${kpi}`);
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
                //setKpi={setKpi}
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
                        className={tab === 'autorca' ? 'active' : ''}
                        onClick={() => onTabClick('autorca')}>
                        AutoRCA
                      </li>

                      <li
                        className={tab === 'anomaly' ? 'active' : ''}
                        onClick={() => onTabClick('anomaly')}>
                        Anomaly
                      </li>
                    </ul>
                  </div>
                  <Link to={`/kpi/settings/${kpi}`}>
                    <div
                      className="common-option"
                      // onClick={() => onSettingClick('settings')}
                    >
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
            {tab === 'autorca' && kpi && active && (
              <Dashboardgraph
                kpi={kpi}
                kpiName={active}
                kpiAggregate={kpiAggregate}
              />
            )}
            {tab === 'anomaly' && kpi && <Anomaly kpi={kpi} />}

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
