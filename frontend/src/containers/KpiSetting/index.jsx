import React, { useEffect, useState } from 'react';

import { Link, useParams } from 'react-router-dom';

import rightarrow from '../../assets/images/rightarrow.svg';

import FilterAnalystics from '../../components/FilterAnalystics';
import Analystics from '../../components/Analystics';

import { getDashboardSidebar } from '../../redux/actions';

import { useSelector, useDispatch } from 'react-redux';

import store from '../../redux/store';

const SETTING_RESET = {
  type: 'SETTING_RESET'
};

const Kpisetting = ({ onboarding, setModal, setText }) => {
  const dispatch = useDispatch();

  const { sidebarLoading, sidebarList } = useSelector((state) => {
    return state.sidebar;
  });
  const [kpi, setKpi] = useState('');
  const [analystics, setAnalystics] = useState(false);
  const [breadCrumbs, setBreadCrumbs] = useState('');
  const kpiId = useParams().id;
  const dashboardId = useParams().dashboard;

  useEffect(() => {
    getAllDashboardSidebar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (analystics && onboarding) {
      setModal(true);
      setText('activateanalytics');
    } // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analystics]);

  const getAllDashboardSidebar = () => {
    if (dashboardId !== null && dashboardId !== undefined) {
      dispatch(getDashboardSidebar({ dashboard_id: dashboardId }));
    } else {
      dispatch(getDashboardSidebar({ dashboard_id: 0 }));
    }
  };

  useEffect(() => {
    if (sidebarList && sidebarList.length !== 0 && onboarding) {
      setKpi(sidebarList?.data?.[0]?.id);
    } else if (sidebarList && sidebarList.length !== 0) {
      setBreadCrumbs(
        sidebarList?.dashboards?.find(
          (item) => item.id.toString() === dashboardId.toString()
        )?.name
      );
      setKpi(kpiId);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sidebarList]);

  if (sidebarLoading) {
    return (
      <div className="load loader-page">
        <div className="preload"></div>
      </div>
    );
  } else {
    return (
      <>
        {/* Page Navigation */}
        {!onboarding && (
          <div className="page-navigation">
            {/* Breadcrumb */}
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb">
                <li
                  className="breadcrumb-item"
                  onClick={() => store.dispatch(SETTING_RESET)}>
                  <Link to={`/dashboard`}>Dashboard</Link>
                </li>
                <li
                  className="breadcrumb-item"
                  onClick={() => store.dispatch(SETTING_RESET)}>
                  <Link to={`/dashboard/${dashboardId}/deepdrills/`}>
                    {breadCrumbs}
                  </Link>
                </li>

                <li
                  className="breadcrumb-item active"
                  aria-current="page"
                  onClick={() => store.dispatch(SETTING_RESET)}>
                  Settings
                </li>
              </ol>
            </nav>
            {/* Back */}
            <div
              className="backnavigation"
              onClick={() => store.dispatch(SETTING_RESET)}>
              <Link to={`/dashboard/${dashboardId}/deepdrills/${kpiId}`}>
                <img src={rightarrow} alt="Back" />
                <span>Settings</span>
              </Link>
            </div>
          </div>
        )}
        <div className="explore-wrapper">
          {/* filter section */}
          <div className="filter-section">
            {sidebarList && (
              <FilterAnalystics
                kpi={kpi}
                setKpi={setKpi}
                data={sidebarList?.data}
                onboarding={onboarding}
              />
            )}
          </div>
          {/* table section */}
          <div className="table-section">
            {kpi && (
              <Analystics
                kpi={kpi}
                setAnalystics={setAnalystics}
                onboarding={onboarding}
              />
            )}
          </div>
        </div>
      </>
    );
  }
};

export default Kpisetting;
