import React, { useState } from 'react';
// import { Link } from 'react-router-dom';
const OrganizationOnboardingForm = () => {
  const [emailAddress, setEmailAddress] = useState('');
  const [isAnonimizeData, setIsAnonimizeData] = useState(false);
  const [isNewsSubscribed, setIsNewsSubscribed] = useState(false);
  const onCheckingAnonimize = (status) => {
    setIsAnonimizeData(status);
  };
  const onCheckingNews = (status) => {
    setIsNewsSubscribed(status);
  };
  return (
    <>
      <div className="og-onboarding-section">
        <div className="og-onboarding-card">
          <div className="og-form-heading">
          <h5>Specify your preferences</h5>
          </div>
          <div className="form-group">
            <label>Your Email (Optional)</label>
            <input
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              type="text"
              class="form-control"
              placeholder="name@company.com"
            />
          </div>
          <p className="sub-headings">
            Anonymize usage data collection
          </p>
          <p>
            We collect data only for product improvements, see the{' '}
            <a
              rel="noreferrer"
              href="https://docs.chaosgenius.io/docs/introduction"
              target="_blank">
              docs
            </a>
            .
          </p>
          <div className="form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id="removeoverlap"
              checked={isAnonimizeData}
              onChange={() => onCheckingAnonimize(!isAnonimizeData)}
            />
            <label for="">Anonymize my usage data.</label>
          </div>
          <p id="news-and-feature" className="sub-headings">
            News and Feature updates
          </p>
          <div className="form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id="removeoverlap"
              checked={isNewsSubscribed}
              onChange={() => onCheckingNews(!isNewsSubscribed)}
            />
            <label for="">
              Receive feature updates. You can unsubscribe any time
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
