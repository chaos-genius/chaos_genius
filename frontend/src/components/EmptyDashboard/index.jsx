import React from 'react';

import Deepdrills from '../../assets/images/DeepDrills.svg';

const EmptyDashboard = () => {
  return (
    <div className="no-data-card">
      <div className="no-data-img">
        <img src={Deepdrills} alt="No Alert" />
      </div>
      <h3>Start building your dashboard</h3>
      <p>You haven’t added any dashboard yet</p>
    </div>
  );
};

export default EmptyDashboard;
