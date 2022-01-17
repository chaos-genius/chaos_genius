import React from 'react';

import ServerErrorImage from '../../assets/images/server-error.svg';

const ServerErrorCard = () => {
  return (
    <div className="server-error-card">
      <div className="server-error-img">
        <img src={ServerErrorImage} alt="Server Error" />
      </div>
      <h5>Cannot reach server.</h5>{' '}
      <h5 className="server-next-line">The server may still be starting up.</h5>
      <a
        href="https://docs.chaosgenius.io/docs/Troubleshooting/installation"
        target="_blank"
        rel="noopener noreferrer"
        className="btn green-variant-button server-error-btn">
        <span>Troubleshoot</span>
      </a>
    </div>
  );
};
export default ServerErrorCard;
