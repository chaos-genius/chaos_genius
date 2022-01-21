import React from 'react';
import { useHistory } from 'react-router-dom';

import empty from '../../assets/images/deepdrill-drilldown-empty.svg';

const DeepdrillDrilldownsEmpty = () => {
  const history = useHistory();
  return (
    <div className="setup-empty-state deepdrill-drilldown-empty">
      <div className="empty-state-image">
        <img src={empty} alt="Anomaly" />
      </div>
      <h3>The analysis was not completed.</h3>
      <p>Please check task status from the troubleshooting section here.</p>
      <button
        className="btn green-variant-button empty-dashboard-btn"
        onClick={() => history.push('/task-manager')}>
        <span>Check status</span>
      </button>
    </div>
  );
};

export default DeepdrillDrilldownsEmpty;
