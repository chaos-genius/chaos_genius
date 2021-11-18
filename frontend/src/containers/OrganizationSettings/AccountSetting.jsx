import React, {useState} from 'react';

const AccountSetting = () => {
  const [emailAddress, setEmailAddress] = useState("");
  return (
    <>
      <div className="heading">
        <p>Account</p>
      </div>
      <div className="settings-form-container">
        <div className="form-group">
          <label>Your Email</label>
          <input
            type="text"
            value={emailAddress}
            onChange={(e) => setEmailAddress(e.target.value)}
            class="form-control"
            placeholder="name@company.com"
          />
        </div>
      </div>
    </>
  );
};

export default AccountSetting;
