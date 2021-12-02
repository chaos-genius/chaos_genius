import React, { useState,useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { onboardOrganisationUpdate,onboardOrganisation } from '../../redux/actions';

const MetricsSettings = (organisationData) => {
  const dispatch = useDispatch();
  const orgData = organisationData.organisationData;
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    const setData = () => {
      if (orgData.active) {
        const data = {
          config_name: 'organisation_settings',
          config_settings: {
            account: {
              email: orgData.config_setting.account.email
            },
            metrics: {
              anonymize_usage_data_collection: orgData.config_setting.metrics.anonymize_usage_data_collection,
              news_and_feature_updates: orgData.config_setting.metrics.news_and_feature_updates
            }
          }
        }
        setFormData(data);
      }else {
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
const submitSelection = () =>{
  if (orgData.active) {
    dispatch(onboardOrganisationUpdate(formData));
  }else{
    dispatch(onboardOrganisation(formData));
  }
}
  const onChecking = (status) => {
    const data = {
      config_name: 'organisation_settings',
      config_settings: {
        account: {
          email: formData.config_settings.account.email
        },
        metrics: {
          anonymize_usage_data_collection: status,
          news_and_feature_updates: formData.config_settings.metrics.news_and_feature_updates
        }
      }
    };
    setFormData(data);
  };

  useEffect(() => {
    if(formData !== null)
    submitSelection();
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);



  return (
    <>
      <div className="heading">
        <p>Metrics</p>
      </div>
      {formData !== null ?
      <div className="settings-form-container">
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
            name="is_anonymize"
            className="form-check-input"
            type="checkbox"
            id="removeoverlap"
            checked={
              formData.config_settings.metrics.anonymize_usage_data_collection
            }
            onChange={() =>
              onChecking(!formData.config_settings.metrics.anonymize_usage_data_collection)
            }
          />
          <label htmlFor="is_anonymize">Anonymize my usage data.</label>
        </div>
      </div>
      : null }
    </>
  );
};

export default MetricsSettings;
