import React from 'react';

const KpiAlertConfigurationForm = () => {
  return (
    <>
      <div className="form-group">
        <h5>Alert Definition</h5>
      </div>{' '}
      <div className="form-group">
        <label>Select KPI*</label>
        <input type="text" className="form-control" />
      </div>
    </>
  );
};

export default KpiAlertConfigurationForm;
