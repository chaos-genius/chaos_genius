import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
// import { useToast } from 'react-toast-wnm';
import GreenArrow from '../../assets/images/green-arrow.svg';
import { v4 as uuidv4 } from 'uuid';
import AccountSetting from './AccountSetting';
import MetricsSettings from './MetricsSettings';
import './organizationSettings.scss';
import { onboardingOrganizationStatus } from '../../redux/actions';

const OrganizationSettings = () => {
  const [tabSwitch, setTabSwitch] = useState({ account: true, metrics: false });
  // const [hasRendered, setHasRendered] = useState(false)
  const { organizationData } = useSelector((state) => state.organization);
  const dispatch = useDispatch();
  useEffect(() => {
    const getOrganizationOnboardedData = () => {
      dispatch(onboardingOrganizationStatus());
    };
    getOrganizationOnboardedData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  return (
    <>
      <div className="heading-option">
        <div className="heading-title">
          <h3>Settings</h3>
        </div>
      </div>

      <div className="setting-sidebar">
        <div className="settings-tab">
          <ul>
            <li
              onClick={(e) => setTabSwitch({ account: true, metrics: false })}
              key={uuidv4()}
              className={tabSwitch.account ? 'active' : ''}>
              Account
              <img src={GreenArrow} alt="Arrow" />
            </li>
            <li
              onClick={(e) => setTabSwitch({ account: false, metrics: true })}
              key={uuidv4()}
              className={tabSwitch.metrics ? 'active' : ''}>
              Metrics
              <img src={GreenArrow} alt="Arrow" />
            </li>
          </ul>
        </div>
        <div className="settings-section">
          {Object.keys(organizationData).length ? ( 
            <>
              {tabSwitch.account ? (
                <AccountSetting organizationData={organizationData} />
              ) : null}
              {tabSwitch.metrics ? (
                <MetricsSettings organizationData={organizationData} />
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </>
  );
};

export default OrganizationSettings;
