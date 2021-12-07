import React from 'react';

import ServerErrorImage from '../../assets/images/server-error.svg';

const ServerErrorCard = () => {
  return (
    <div className="server-error-card">
      <div className="server-error-img">
        <img src={ServerErrorImage} alt="Server Error" />
      </div>
      <h5>Cannot reach server.</h5>{' '}
      <h5>The server may still be starting up.</h5>
    </div>
  );
};
export default ServerErrorCard;
