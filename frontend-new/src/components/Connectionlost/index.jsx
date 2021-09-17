import React from 'react';

import ConnectionLost from '../../assets/images/connection-lost.svg';

const Connectionlost = () => {
  return (
    <div className="no-data-card">
      <div className="no-data-img">
        <img src={ConnectionLost} alt="Connection Lost" />
      </div>
      <h3>Connection lost</h3>
      <p>Please check your connection and try again </p>
      <button type="submit" className="btn black-button">
        <span>Reload</span>
      </button>
    </div>
  );
};

export default Connectionlost;
