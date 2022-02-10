import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import GreenArrow from '../../assets/images/green-arrow.svg';
import { v4 as uuidv4 } from 'uuid';
import AccountSetting from './AccountSetting';
import MetricsSettings from './MetricsSettings';
import './organisationSettings.scss';
import {
  onboardingOrganisationStatus,
  getReportSettingTime
} from '../../redux/actions';
import ReportSettings from './ReportSetting';
import store from '../../redux/store';

const OrganisationSettings = () => {
  const [tabSwitch, setTabSwitch] = useState({ account: true, metrics: false });
  const { organisationData, reportSettingTime } = useSelector(
    (state) => state.organisation
  );
  const dispatch = useDispatch();
  useEffect(() => {
    const getOrganisationOnboardedData = () => {
      dispatch(onboardingOrganisationStatus());
    };
    getOrganisationOnboardedData();
    dispatch(getReportSettingTime());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
              onClick={(e) =>
                setTabSwitch({ account: true, metrics: false, reports: false })
              }
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
            <li
              onClick={(e) => {
                store.dispatch({ type: 'CLEAR_REPORTING' });
                setTabSwitch({ account: false, metrics: false, reports: true });
              }}
              key={uuidv4()}
              className={tabSwitch.reports ? 'active' : ''}>
              Alerts Report
              <img src={GreenArrow} alt="Arrow" />
            </li>
          </ul>
        </div>
        <div className="settings-section">
          {Object.keys(organisationData).length ? (
            <>
              {tabSwitch.account ? (
                <AccountSetting organisationData={organisationData} />
              ) : null}
              {tabSwitch.metrics ? (
                <MetricsSettings organisationData={organisationData} />
              ) : null}
              {tabSwitch.reports && reportSettingTime !== '' ? (
                <ReportSettings />
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </>
  );
};

export default OrganisationSettings;
