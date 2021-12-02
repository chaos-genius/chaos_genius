import React from 'react';

import Logo from '../../assets/images/logo.svg';
import ServerErrorCard from '../../components/ServerErrorCard';

import './servererror.scss';

const ServerError = () => {
  return (
    <>
      <div className="navbar-section">
        <img src={Logo} alt="Chaos Genius" />
        <h3>Chaos Genius</h3>
      </div>
      <div className="server-error-container">
        <ServerErrorCard />
      </div>
    </>
  );
};

export default ServerError;
