import React from 'react';
import { useHistory } from 'react-router-dom';

import empty from '../../assets/images/empty-data-quality-anomaly.svg';

const EmptyDataQualityAnomaly = () => {
  const history = useHistory();
  return (
    <div className="setup-empty-state anomaly-empty-state">
      <div className="empty-state-image">
        <img src={empty} alt="Anomaly" />
      </div>
      <h3>No Analysis Found</h3>
      <p>Something went wrong!</p>
      <button
        className="btn green-variant-button empty-anomaly-btn"
        onClick={() => history.push('/task-manager')}>
        <span>Check status</span>
      </button>
    </div>
  );
};

export default EmptyDataQualityAnomaly;
