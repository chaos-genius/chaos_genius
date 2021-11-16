import React, { useState } from 'react';
import { Link } from 'react-router-dom';
const OrganizationOnboardingForm = () => {
  const [formdata, setFormData] = useState({
    emailAddress: '',
    isAnonymizeMyData: false,
    isReceiveUpdates: false
  });
  // const [errorMsg, setErrorMsg] = useState({
  //     emailAddress:false,
  //   });

  return (
    <>
      <div className="og-onboarding-section">
        <div className="og-onboarding-card">
          <h5>Specify your preference</h5>
          <div className="form-group">
            <label>Your Email (Optional)</label>
            <input
              type="text"
              class="form-control"
              placeholder="name@company.com"
            />
          </div>
          <p className="sub-headings">
            <strong>Anonymize usage data collection</strong>
          </p>
          <p>
            We collect data only for product improvements, see the{' '}
            <Link to="/" target="_blank">
              docs
            </Link>
            .
          </p>
          <div className="form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id="removeoverlap"
              // checked={alert.active}
              // onChange={() => onChecking(alert)}
            />
            <label for="">Anonymize my usage data.</label>
          </div>
          <p className="sub-headings">
            <strong>News and Feature updates</strong>
          </p>
          <div className="form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id="removeoverlap"
              // checked={alert.active}
              // onChange={() => onChecking(alert)}
            />
            <label for="">
              Receive feature updates. You can unscribe any time
            </label>
          </div>
          <button className="btn green-variant-button">
            <span>Continue</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default OrganizationOnboardingForm;
