import React from 'react';
import { useHistory } from 'react-router-dom';
import Anomaly from '../../assets/images/anomaly-loading.svg';

const AnomalyEmptyState = () => {
  const history = useHistory();
  return (
    <div className="setup-empty-state">
      <img src={Anomaly} alt="Anomaly" />
      <h3>Please wait!</h3>
      <p>
        One time Analytics setup in progress. It might take upto few minutes.
      </p>
      <button
        className="btn green-variant-button empty-dashboard-btn"
        onClick={() => history.push('/task-manager')}>
        <span>Check status</span>
      </button>
    </div>
  );
};

export default AnomalyEmptyState;
