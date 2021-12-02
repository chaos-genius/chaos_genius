import React, { useState, useEffect } from 'react';
import { useDispatch} from 'react-redux';
import { onboardOrganisationUpdate,onboardOrganisation } from '../../redux/actions';

const AccountSetting = (organisationData) => {
  const orgData = organisationData.organisationData;
  const dispatch = useDispatch();
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    const setData = () => {
      if (orgData.active) {
        const data = {
          config_name: 'organisation_settings',
          config_settings: {
            account: {
              email: orgData.config_setting.account.email || ""
            },
            metrics: {
              anonymize_usage_data_collection: orgData.config_setting.metrics.anonymize_usage_data_collection,
              news_and_feature_updates: orgData.config_setting.metrics.news_and_feature_updates
            }
          }
        }
        setFormData(data);
      }else{
        const data = {
              config_name: 'organisation_settings',
              config_settings: {
                account: {
                  email: ''
                },
                metrics: {
                  anonymize_usage_data_collection: false,
                  news_and_feature_updates: false
                }
              }
            };
        setFormData(data);
      }
    };
    setData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOnChange = (e) => {
    setFormData({
        config_name: 'organisation_settings',
        config_settings: {
          account: {
            email: e.target.value
          },
          metrics: {
            anonymize_usage_data_collection: formData.config_settings.metrics.anonymize_usage_data_collection,
            news_and_feature_updates: formData.config_settings.metrics.news_and_feature_updates
          }
        }
      }
    );
  };

  const handleOnBlur = () => {
    if (orgData.active) {
      dispatch(onboardOrganisationUpdate(formData));
    }else{
      dispatch(onboardOrganisation(formData));
    }
  };

  return (
    <>
      <div className="heading">
        <p>Account</p>
      </div>
      {formData != null ?
      <div className="settings-form-container">
        <div className="form-group">
          <label>Your Email</label>
          <input
            type="text"
            value={formData.config_settings.account.email}
            onBlur={handleOnBlur}
            onChange={(e) => handleOnChange(e)}
            class="form-control"
            placeholder="name@company.com"
          />
        </div>
      </div>
      : null }
    </>
  );
};

export default AccountSetting;
