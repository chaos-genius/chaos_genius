import React from 'react';

import empty from '../../assets/images/deepdrill-drilldown-empty.svg';

const DeepdrillDrilldownsEmpty = () => {
  return (
    <div className="setup-empty-state deepdrill-drilldown-empty">
      <div className="empty-state-image">
        <img src={empty} alt="Anomaly" />
      </div>
      <h3>The analysis was not completed.</h3>
      <p>Please check task status from the troubleshooting section here.</p>
    </div>
  );
};

export default DeepdrillDrilldownsEmpty;
