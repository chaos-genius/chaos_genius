import React, { useState } from 'react';
import moment from 'moment';

import TimePicker from 'rc-time-picker';
import 'rc-time-picker/assets/index.css';

const ReportSettings = () => {
  const [schedule, setSchedule] = useState(moment());

  const handleValueChange = (data) => {
    setSchedule(data ? data.format('HH:mm:00') : '');
  };

  return (
    <>
      <div className="heading">
        <p>Account</p>
      </div>
      <div className="settings-form-container">
        <div className="form-group">
          <label>Set Time For Consolidated Alerts Report</label>
          <TimePicker
            onChange={handleValueChange}
            defaultValue={schedule}
            className="time-picker"
            focusOnOpen={true}
            showSecond={false}
            value={schedule && moment(schedule, 'HH:mm')}
          />
        </div>{' '}
        <div className="organization-button-container">
          <button className="btn white-button" disabled>
            <span>Cancel</span>
          </button>

          <button className="btn black-button">
            <div className="btn-content">
              <span>Save Changes</span>
            </div>
          </button>
        </div>
      </div>
    </>
  );
};

export default ReportSettings;
