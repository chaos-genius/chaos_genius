import React from 'react';
import Anomaly from '../../assets/images/anomaly-loading.svg';

const AnomalyEmptyState = () => {
  return (
    <div className="setup-empty-state">
      <img src={Anomaly} alt="Anomaly" />
      <h3>Please wait!</h3>
      <p>One time Analytics setup in progress. It might take upto few hours.</p>
    </div>
  );
};

export default AnomalyEmptyState;
