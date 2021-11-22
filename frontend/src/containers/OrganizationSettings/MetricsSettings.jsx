import React, { useState } from 'react';
const MetricsSettings = () => {
    const [isAnonymizeData, setIsAnonymizeData] = useState(false);
    const onChecking = (status) =>{
        setIsAnonymizeData(status);
    }
    
  return (
    <>
      <div className="heading">
        <p>Metrics</p>
      </div>
      <div className="settings-form-container">
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
          name="is_anonymize"
            className="form-check-input"
            type="checkbox"
            id="removeoverlap"
            checked={isAnonymizeData}
            onChange={() => onChecking(!isAnonymizeData)}
          />
          <label htmlFor="is_anonymize">Anonymize my usage data.</label>
        </div>
      </div>
    </>
  );
};

export default MetricsSettings;
