import React from 'react';

import empty from '../../assets/images/deepdrill-drilldown-empty.svg';

const DeepdrillDrilldownEmpty = () => {
  return (
    <div className="setup-empty-state deepdrill-drilldown-empty">
      <div className="empty-state-image">
        <img src={empty} alt="Anomaly" />
      </div>
      <h3>No Dimensions defined yet</h3>
      <p>Looks like you have not defined dimensions for this KPI</p>
    </div>
  );
};

export default DeepdrillDrilldownEmpty;
