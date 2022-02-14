import React from 'react';

import empty from '../../assets/images/emptyanomalydrilldown.svg';

const SubdimensionEmpty = () => {
  return (
    <div className="setup-empty-state deepdrill-drilldown-empty">
      <div className="empty-state-image">
        <img src={empty} alt="Anomaly" />
      </div>
      <h3>No Sub-dimensional Anomaly found.</h3>
      <p>
        We have not detected any statistically significant anomaly at a
        sub-dimensional level.
      </p>
    </div>
  );
};

export default SubdimensionEmpty;
