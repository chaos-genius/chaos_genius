import React from 'react';

import { useHistory } from 'react-router-dom';

import Logo from '../../assets/images/logo.svg';
import Loginform from '../../components/Loginform';
import Loginverifyform from '../../components/Loginverifyform';

import './login.scss';

const Login = () => {
  const location = useHistory().location.pathname.split('/');
  return (
    <>
      <div className="navbar-section">
        <img src={Logo} alt="Chaos Genius" />
        <h3>Chaos Genius</h3>
      </div>
      <div className="login-container">
        {location[1] === 'login' ? (
          <Loginform />
        ) : location[1] === 'verifylogin' ? (
          <Loginverifyform />
        ) : null}
      </div>
    </>
  );
};

export default Login;
