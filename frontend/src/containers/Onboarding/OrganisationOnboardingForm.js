import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { onboardOrganisation } from '../../redux/actions';
import { validateEmail } from '../../utils/regex-helper';

const OrganisationOnboardingForm = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  const { organisationData } = useSelector((state) => state.organisation);
  const [emailAddress, setEmailAddress] = useState('');
  const [ErrorMessage, setErrorMessage] = useState(false);
  const [isAnonymizeData, setIsAnonymizeData] = useState(false);
  const [isNewsSubscribed, setIsNewsSubscribed] = useState(false);

  const onCheckingAnonimize = (status) => {
    setIsAnonymizeData(status);
  };
  const onCheckingNews = (status) => {
    setIsNewsSubscribed(status);
  };

  const handleSubmit = () => {
    const data = {
      config_name: 'organisation_settings',
      config_settings: {
        account: {
          email: emailAddress
        },
        metrics: {
          anonymize_usage_data_collection: isAnonymizeData,
          news_and_feature_updates: isNewsSubscribed
        }
      }
    };
    if (emailAddress !== '' && validateEmail(emailAddress)) {
      dispatch(onboardOrganisation(data));
    } else if (emailAddress === '') {
      dispatch(onboardOrganisation(data));
    } else {
      setErrorMessage(true);
    }
  };

  useEffect(() => {
    if (
      organisationData !== undefined &&
      Object.keys(organisationData).length &&
      organisationData.active
    ) {
      history.push('/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organisationData]);

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
            {ErrorMessage === true ? (
              <div className="invalid-email">Enter a valid email.</div>
            ) : null}
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

export default OrganisationOnboardingForm;
