import React from 'react';

import { useHistory } from 'react-router-dom';

import NoKpis from '../../assets/images/nokpisdashboard.svg';
import './emptykpisdashboard.scss';

const EmptyKpisDashboard = () => {
  const history = useHistory();
  return (
    <div className="no-data-card dashboard-no-kpi-card">
      <div className="no-data-img">
        <img src={NoKpis} alt="No Kpi's in dashboard" />
      </div>
      <h3>No KPIs added to this Dashboard yet.</h3>
      <button
        className="btn green-variant-button"
        onClick={() => history.push('/kpiexplorer')}>
        <span>New KPI</span>
      </button>
    </div>
  );
};

export default EmptyKpisDashboard;
