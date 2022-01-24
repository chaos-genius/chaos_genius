import React from 'react';

import empty from '../../assets/images/empty-data-quality-anomaly.svg';

const EmptyDataQualityAnomaly = () => {
  return (
    <div className="setup-empty-state anomaly-empty-state">
      <div className="empty-state-image">
        <img src={empty} alt="Anomaly" />
      </div>
      <h3>No Analysis Found</h3>
      <p>Something went wrong!</p>
    </div>
  );
};

export default EmptyDataQualityAnomaly;
