import React from 'react';
import Select from 'react-select';
const KpiAlertDestinationForm = () => {
  return (
    <div>
      <div className="form-group">
        <h5>Alert Destination</h5>
      </div>
      <div className="form-group">
        <label>Select Channel *</label>
        <Select classNamePrefix="selectcategory" placeholder="Select Unit" />
      </div>

      <div className="form-group">
        <label>Add Recepients </label>
        <Select
          isMulti
          classNamePrefix="selectcategory"
          placeholder="Select Unit"
        />
      </div>
      <div className="add-options-wrapper">
        <div className="add-options">
          <label>+ Add Another Channel</label>
        </div>
      </div>
      <div className="form-action">
        <button className="btn white-button btn-spacing">
          <span>Back</span>
        </button>

        <button className="btn black-button">
          <span>Next Step</span>
        </button>
      </div>
    </div>
  );
};

export default KpiAlertDestinationForm;
