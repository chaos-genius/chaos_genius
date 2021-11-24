import React from 'react';

import Select from 'react-select';
// import ModalPopUp from '../Modal';

const DashboardForm = () => {
  // const [modal, setModal] = useState('false');
  return (
    <>
      <div className="form-group">
        <label>Dashboard Name *</label>
        <input
          type="text"
          className="form-control"
          placeholder="Name of the dashboard"
          required
        />
      </div>
      <div className="form-group">
        <label>Select Team *</label>
        <Select
          // options={option.datasource}
          classNamePrefix="selectcategory"
          placeholder="Select"
        />
      </div>
      <div className="form-group">
        <label>Select Sub Team (Optional)</label>
        <Select
          // options={option.datasource}
          classNamePrefix="selectcategory"
          placeholder="Select"
        />
      </div>
      <div className="form-group">
        <label>Avg Order Value</label>
        <input
          type="text"
          className="form-control"
          placeholder="Enter Avg Order Value"
          required
        />
      </div>
      <div className="form-group">
        <label>KPI *</label>
        <Select
          isMulti
          // options={option.datasource}
          classNamePrefix="selectcategory"
          placeholder="Select"
        />
      </div>
      <div className="form-action">
        <button className="btn black-button">
          <span>Add Dashboard</span>
        </button>
      </div>
      {/* <ModalPopUp isOpen={modal} /> */}
    </>
  );
};
export default DashboardForm;
