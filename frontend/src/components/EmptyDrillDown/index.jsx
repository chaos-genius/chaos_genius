import React from 'react';

import empty from '../../assets/images/emptyanomalydrilldown.svg';

const EmptyAnomalyDrilldown = () => {
  return (
    <div className="setup-empty-state anomaly-empty-state">
      <div className="empty-state-image">
        <img src={empty} alt="Anomaly" />
      </div>
      <h3>No Drill Downs</h3>
      <p>No Drill Downs exist for this Anomaly</p>
    </div>
  );
};

export default EmptyAnomalyDrilldown;
