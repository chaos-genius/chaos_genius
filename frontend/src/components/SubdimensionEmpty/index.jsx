import React from 'react';

import empty from '../../assets/images/deepdrill-dimension-empty.svg';

const SubdimensionEmpty = () => {
  return (
    <div className="setup-empty-state deepdrill-drilldown-empty">
      <div className="empty-state-image">
        <img src={empty} alt="Anomaly" />
      </div>
      <h3>No Sub-dimensions defined yet.</h3>
      <p>Looks like you have not defined sub-dimensions for this KPI.</p>
    </div>
  );
};

export default SubdimensionEmpty;
