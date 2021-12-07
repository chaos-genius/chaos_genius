import React from 'react';

import Deepdrill from '../../assets/images/deepdrills-timing.svg';

const DeepdrillsEmptyState = () => {
  return (
    <div className="setup-empty-state">
      <img src={Deepdrill} alt="Deep Drills" />
      <h3>Please wait!</h3>
      <p>One time Analytics setup in progress. It might take upto few hours.</p>
    </div>
  );
};

export default DeepdrillsEmptyState;
