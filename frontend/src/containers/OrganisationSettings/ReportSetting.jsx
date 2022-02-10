import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';

import TimePicker from 'rc-time-picker';
import { useToast } from 'react-toast-wnm';
import 'rc-time-picker/assets/index.css';

import { saveReportSettingTime } from '../../redux/actions';
import { CustomContent, CustomActions } from '../../utils/toast-helper';
import { getLocalStorage } from '../../utils/storage-helper';

const ReportSettings = () => {
  const toast = useToast();
  const globalSetting = getLocalStorage('GlobalSetting');

  const customToast = (data) => {
    const { type, header, description } = data;
    toast({
      autoDismiss: true,
      enableAnimation: true,
      delay: type === 'success' ? '5000' : '30000',
      backgroundColor: type === 'success' ? '#effaf5' : '#FEF6F5',
      borderRadius: '6px',
      color: '#222222',
      position: 'bottom-right',
      minWidth: '240px',
      width: 'auto',
      boxShadow: '4px 6px 32px -2px rgba(226, 226, 234, 0.24)',
      padding: '17px 14px',
      height: 'auto',
      border: type === 'success' ? '1px solid #60ca9a' : '1px solid #FEF6F5',
      type: type,
      actions: <CustomActions />,
      content: (
        <CustomContent
          header={header}
          description={description}
          failed={type === 'success' ? false : true}
        />
      )
    });
  };

  const dispatch = useDispatch();

  const { reportSettingTime, reportSettingTimeStatus } = useSelector(
    (state) => state.organisation
  );
  const [schedule, setSchedule] = useState(reportSettingTime);

  useEffect(() => {
    if (reportSettingTime !== '') {
      setSchedule(reportSettingTime);
    }
  }, [reportSettingTime]);

  useEffect(() => {
    if (reportSettingTimeStatus === 'success') {
      customToast({
        type: 'success',
        header: 'Reporting time set successfully.'
      });
    } else if (reportSettingTimeStatus === 'failure') {
      customToast({
        type: 'error',
        header: 'Unable to set time.'
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportSettingTimeStatus]);

  const handleValueChange = (data) => {
    setSchedule(data ? data.format('HH:mm:00') : '');
  };

  const onReportSettingsSave = (e) => {
    dispatch(saveReportSettingTime(moment(schedule, 'HH:mm')?.format('HH:mm')));
  };

  return (
    <>
      <div className="heading">
        <p>Alerts Report</p>
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
          <div className="channel-tip">
            <p>
              Note: The time set above must be in your server timezone{' '}
              {`(${globalSetting?.timezone})`}
            </p>
          </div>
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
