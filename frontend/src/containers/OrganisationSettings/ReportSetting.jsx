import React, { useState } from 'react';
import moment from 'moment';
import { useDispatch } from 'react-redux';

import TimePicker from 'rc-time-picker';
import 'rc-time-picker/assets/index.css';

import { saveReportSettingTime } from '../../redux/actions/Organisation';

const ReportSettings = () => {
  const dispatch = useDispatch();
  const [schedule, setSchedule] = useState(moment());

  const handleValueChange = (data) => {
    setSchedule(data ? data.format('HH:mm:00') : '');
  };

  const onReportSettingsSave = (e) => {
    dispatch(saveReportSettingTime(moment(schedule, 'HH:mm')?.format('HH:mm')));
  };

  return (
    <>
      <div className="heading">
        <p>Reports</p>
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

          <button
            className="btn black-button"
            onClick={(e) => onReportSettingsSave()}>
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
