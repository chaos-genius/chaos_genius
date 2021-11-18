import React, {useState} from 'react';
import GreenArrow from '../../assets/images/green-arrow.svg';
import { v4 as uuidv4 } from 'uuid';
import AccountSetting from './AccountSetting';
import MetricsSettings from './MetricsSettings';
import './organizationSettings.scss';

const OrganizationSettings = () => {
  const [tabSwitch, setTabSwitch] = useState({account:true, metrics:false});
 
  return (
    <>
      <div className="heading-option">
        <div className="heading-title">
          <h3>Settings</h3>
        </div>
      </div>

      <div className="setting-sidebar">
        {/* filter section */}
            <div className="settings-tab">
              <ul>
                <li onClick={(e) => setTabSwitch({account:true, metrics:false})} key={uuidv4()} className={tabSwitch.account ? 'active' : ''}>
                  Account
                  <img src={GreenArrow} alt="Arrow" />
                </li>
                <li onClick={(e) => setTabSwitch({account:false, metrics:true})} key={uuidv4()} className={tabSwitch.metrics ? 'active' : ''}>
                  Metrics
                  <img src={GreenArrow} alt="Arrow" />
                </li>
              </ul>
        </div>
        <div className="settings-section">
          {tabSwitch.account ? <AccountSetting /> : null} 
          {tabSwitch.metrics ? <MetricsSettings /> : null}         
        </div>
      </div>
    </>
  );
};

export default OrganizationSettings;
