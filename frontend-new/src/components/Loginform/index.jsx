import React from 'react';

import Wavinghand from '../../assets/images/wavinghand.svg';

const Loginform = () => {
  return (
    <div className="login-section">
      <h3>
        Nice to meet you! <img src={Wavinghand} alt="Nice to meet you!" />{' '}
      </h3>
      <p>Sign up with your Email Id to setup Chaos Genius</p>
      <div className="login-card">
        <div className="form-group">
          <label>Your Email Id *</label>
          <input
            type="text"
            class="form-control"
            placeholder="Enter your Email id"
          />
        </div>
        <p>We will send you a verification code in your inbox</p>
        <button className="btn green-variant-button">
          <span>Register</span>
        </button>
      </div>
    </div>
  );
};
export default Loginform;
