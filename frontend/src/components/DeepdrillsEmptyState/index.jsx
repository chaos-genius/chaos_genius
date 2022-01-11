import React from 'react';
import { useHistory } from 'react-router-dom';
import Deepdrill from '../../assets/images/deepdrills-timing.svg';

const DeepdrillsEmptyState = () => {
  const history = useHistory();
  return (
    <div className="setup-empty-state">
      <img src={Deepdrill} alt="Deep Drills" />
      <h3>Please wait!</h3>
      <p>One time Analytics setup in progress. It might take upto few hours.</p>
      <button
        className="btn green-variant-button empty-dashboard-btn"
        onClick={() => history.push('/task-manager')}>
        <span>Check status</span>
      </button>
    </div>
  );
};

export default DeepdrillsEmptyState;
