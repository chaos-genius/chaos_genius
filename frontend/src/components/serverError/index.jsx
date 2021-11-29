import React from 'react';

import ServerErrorImage from '../../assets/images/server-error.svg';

const ServerError = () => {
  return (
    <div className="no-data-card server-error-card">
      <div className="no-data-img">
        <img src={ServerErrorImage} alt="Server Error" />
      </div>
      <h3>Internal Server Error</h3>
      <p>Cannot reach server. The server may still be starting up</p>
    </div>
  );
};

export default ServerError;
