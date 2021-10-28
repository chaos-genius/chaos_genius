import React from 'react';

import Email from '../../assets/images/email.svg';

const Loginverifyform = () => {
  return (
    <div className="login-section">
      <h3>
        Verify your email id <img src={Email} alt="Email" />
      </h3>
      <p>
        Verification code sent to demo@example.com <label>Edit</label>
      </p>
      <div className="login-card">
        <div className="form-group">
          <label>Verification Code *</label>
          <input type="text" class="form-control" placeholder="Enter Code" />
        </div>
        <p>Didn’t receive verification code? Resend in 00:15 sec</p>
        <button className="btn green-variant-button">
          <span>Submit</span>
        </button>
      </div>
    </div>
  );
};
export default Loginverifyform;
