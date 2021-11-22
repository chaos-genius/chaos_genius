import React, { useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useToast } from 'react-toast-wnm';
// import { Link } from 'react-router-dom';

const OrganizationOnboardingForm = () => {
  const dispatch = useDispatch();
  // const selector = useSelector();
  const toast = useToast();
  const history = useHistory();
  const data = history.location.pathname.split('/');

  const [emailAddress, setEmailAddress] = useState('');
  const [isAnonymizeData, setIsAnonymizeData] = useState(false);
  const [isNewsSubscribed, setIsNewsSubscribed] = useState(false);

  const onCheckingAnonimize = (status) => {
    setIsAnonymizeData(status);
  };
  const onCheckingNews = (status) => {
    setIsNewsSubscribed(status);
  };

  const validateEmail = (email) => {
    let regex =
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return regex.test(email);
  };

  const handleSubmit = () => {
    if (validateEmail(emailAddress)) {
      const data = {
        emailAddress: emailAddress,
        isAnonymizeData: isAnonymizeData,
        isNewsSubscribed: isNewsSubscribed
      };
      console.log(data);
    }else{
      console.log("invalid email");
    }    
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
          <p className="sub-headings">Anonymize usage data collection</p>
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
              name="isAnonymizeData"
              className="form-check-input"
              type="checkbox"
              id="removeoverlap"
              checked={isAnonymizeData}
              onChange={() => onCheckingAnonimize(!isAnonymizeData)}
            />
            <label htmlFor="isAnonymizeData">Anonymize my usage data.</label>
          </div>
          <p id="news-and-feature" className="sub-headings">
            News and Feature updates
          </p>
          <div className="form-switch">
            <input
              className="form-check-input"
              name="isNewsSubscribed"
              type="checkbox"
              id="removeoverlap"
              checked={isNewsSubscribed}
              onChange={() => onCheckingNews(!isNewsSubscribed)}
            />
            <label htmlFor="isNewsSubscribed">
              Receive feature updates. You can unsubscribe any time
            </label>
          </div>
          <button
            onClick={(e) => handleSubmit()}
            className="btn green-variant-button">
            <span>Continue</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default OrganizationOnboardingForm;