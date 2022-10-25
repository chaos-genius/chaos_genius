import React, { useState, useEffect } from 'react';

import Select from 'react-select';
import Tooltip from 'react-tooltip-lite';
import Modal from 'react-modal';

import moment from 'moment';

import TimePicker from 'rc-time-picker';
import 'rc-time-picker/assets/index.css';

import Help from '../../assets/images/help.svg';
import Close from '../../assets/images/close.svg';

import './analystics.scss';

import {
  kpiSettingSetup,
  kpiEditSetup,
  settingMetaInfo,
  anomalySetting
} from '../../redux/actions';
import { useDispatch, useSelector } from 'react-redux';

import { useToast } from 'react-toast-wnm';

import { CustomContent, CustomActions } from '../../utils/toast-helper';

import { getLocalStorage } from '../../utils/storage-helper';
import Edit from '../../assets/images/disable-edit.svg';

const Analystics = ({ kpi, setAnalystics, onboarding }) => {
  const dispatch = useDispatch();

  const toast = useToast();

  const {
    kpiEditData,
    kpiEditLoading,
    kpiSettingLoading,
    kpiSettingData,
    metaInfoData,
    metaInfoLoading
  } = useSelector((state) => {
    return state.setting;
  });

  const { anomalySettingData, anomalySettingLoading } = useSelector((state) => {
    return state.anomaly;
  });

  const [anomalyPeriod, setAnomalyPeriod] = useState(90);
  const [modelName, setModalName] = useState({});
  const [Sensitivity, setSensitivity] = useState({});
  const [frequency, setFrequency] = useState({});
  const [modalFrequency, setModalFrequency] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [edit, setEdit] = useState('');
  const [schedule, setSchedule] = useState(moment());
  const [editForm, setEditForm] = useState({});
  const [needForCleanup, setNeedForCleanup] = useState({});

  const globalSetting = getLocalStorage('GlobalSetting');

  const [error, setError] = useState({
    anomaly_period: '',
    modelName: '',
    sensitivity: '',
    frequency: '',
    model_frequency: '',
    seasonality: ''
  });

  const [enabled, setEnabled] = useState({
    anomaly_period: true,
    model_name: true,
    sensitivity: true,
    frequency: true,
    schedule: true,
    scheduler_frequency: true,
    seasonality: true
  });

  const [sensitiveData, setSensitiveData] = useState({
    anomaly_period: 0,
    model_name: {},
    sensitivity: {},
    frequency: {},
    modalFrequency: {},
    scheduler_frequency: {},
    seasonality: []
  });

  const [option, setOption] = useState({
    model_name: [],
    sensitivity: [],
    seasonality: [],
    frequency: [],
    modalFrequency: []
  });

  useEffect(() => {
    setEditForm({});
    setNeedForCleanup({});
    dispatch(anomalySetting(kpi));
    dispatch(settingMetaInfo());
    dispatch(kpiEditSetup(kpi));
    setError({
      anomaly_period: '',
      modelName: '',
      sensitivity: '',
      frequency: '',
      model_frequency: '',
      seasonality: ''
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kpi]);

  useEffect(() => {
    if (metaInfoData && metaInfoData.length !== 0) {
      setOption({
        ...option,
        model_name: metaInfoData.fields
          .find((item) => item.name === 'model_name')
          .options.map((item) => {
            return { value: item.value, label: item.name };
          }),
        seasonality: metaInfoData.fields
          .find((item) => item.name === 'seasonality')
          .options.map((item) => {
            return { value: item.value, label: item.name };
          }),
        frequency: metaInfoData.fields
          .find((item) => item.name === 'frequency')
          .options.map((item) => {
            return { value: item.value, label: item.name };
          }),
        sensitivity: metaInfoData.fields
          .find((item) => item.name === 'sensitivity')
          .options.map((item) => {
            return { value: item.value, label: item.name };
          })
      });
    }
    if (anomalySettingData) {
      setEdit(anomalySettingData?.is_anomaly_setup);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metaInfoData, anomalySettingData]);

  useEffect(() => {
    if (kpiEditData && kpiEditData?.anomaly_params !== null) {
      setSensitivity({
        label: kpiEditData?.anomaly_params?.sensitivity,
        value: kpiEditData?.anomaly_params?.sensitivity
      });
      setModalName({
        label: kpiEditData?.anomaly_params?.model_name,
        value: kpiEditData?.anomaly_params?.model_name
      });
      setFrequency({
        label: kpiEditData?.anomaly_params?.frequency
          ? kpiEditData?.anomaly_params?.frequency === 'D'
            ? 'Daily'
            : 'Hourly'
          : '',
        value: kpiEditData?.anomaly_params?.frequency
      });
      setModalFrequency({
        label: kpiEditData?.anomaly_params?.scheduler_frequency
          ? kpiEditData?.anomaly_params?.scheduler_frequency === 'D'
            ? 'Daily'
            : 'Hourly'
          : '',
        value: kpiEditData?.anomaly_params?.scheduler_frequency
      });
      setAnomalyPeriod(kpiEditData?.anomaly_params?.anomaly_period || 0);
      setSchedule(kpiEditData?.anomaly_params?.scheduler_params_time);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kpiEditData]);

  useEffect(() => {
    if (kpiSettingData && kpiSettingData.status === 'success' && onboarding) {
      setAnalystics(true);
    } else if (
      kpiSettingData &&
      kpiSettingData.status === 'failure' &&
      onboarding
    ) {
      customToast({
        type: 'error',
        header: 'Configuration failed',
        description: kpiSettingData.msg
      });
    } else if (kpiSettingData && kpiSettingData.status === 'success') {
      customToast({
        type: 'success',
        header: 'Successfully updated'
      });
    } else if (kpiSettingData && kpiSettingData.status === 'failure') {
      customToast({
        type: 'error',
        header: 'Failed to update',
        description: kpiSettingData.msg
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kpiSettingData]);

  useEffect(() => {
    if (frequency.value === 'D') {
      setOption({
        ...option,
        modalFrequency: metaInfoData?.fields
          ?.find((item) => item.name === 'scheduler_frequency')
          .options.filter((item) => {
            return item.value === 'D';
          })
          .map((item) => {
            return { label: item.name, value: item.value };
          })
      });
      if (enabled.scheduler_frequency) {
        setModalFrequency(frequency);
      } else {
        setSensitiveData({
          ...sensitiveData,
          scheduler_frequency: frequency
        });
      }
    } else {
      setOption({
        ...option,
        modalFrequency: metaInfoData?.fields
          ?.find((item) => item.name === 'scheduler_frequency')
          .options.map((item) => {
            return { value: item.value, label: item.name };
          })
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frequency]);

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

  const onSettingSave = () => {
    let data = {};
    var obj = { ...error };
    if (anomalyPeriod === '' || anomalyPeriod === 0) {
      obj['anomaly_period'] = 'Enter Time Window';
    }

    if (frequency.value === 'D') {
      if (!(30 <= anomalyPeriod && 90 >= anomalyPeriod)) {
        obj['anomaly_period'] = 'Enter Valid Time Window';
      }
    }
    if (frequency.value === 'H') {
      if (!(7 <= anomalyPeriod && 21 >= anomalyPeriod)) {
        obj['anomaly_period'] = 'Enter Valid Time Window';
      }
    }
    if (modalFrequency.value === '' || modalFrequency.value === null) {
      obj['model_frequency'] = 'Enter Model Frequency';
    }
    if (modelName.value === '' || modelName.value === null) {
      obj['modelName'] = 'Enter Model';
    }
    if (Sensitivity.value === '' || Sensitivity.value === null) {
      obj['sensitivity'] = 'Enter Sensitivity';
    }
    if (frequency.value === '' || frequency.value === null) {
      obj['frequency'] = 'Enter Frequency';
    }
    setError(obj);

    if (
      obj.anomaly_period === '' &&
      obj.model_frequency === '' &&
      obj.modelName === '' &&
      obj.sensitivity === '' &&
      obj.frequency === ''
    ) {
      if (edit) {
        data = {
          anomaly_params: {
            ...editForm
          }
        };
      } else {
        data = {
          anomaly_params: {
            anomaly_period: Number(anomalyPeriod),
            frequency: frequency.value,
            model_name: modelName.value,
            sensitivity: Sensitivity.value,
            scheduler_frequency: modalFrequency.value,
            scheduler_params_time: schedule
          }
        };
      }

      if (edit && Object.keys(needForCleanup)?.length) {
        setModalOpen(true);
      } else {
        dispatch(kpiSettingSetup(kpi, data, customToast));
      }
    }
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleValueChange = (data) => {
    if (enabled.scheduler_frequency) {
      if (modalFrequency.value === 'D') {
        setSchedule(data ? data.format('HH:mm:00') : '');
        setEditForm({
          ...editForm,
          scheduler_params_time: data ? data.format('HH:mm:00') : ''
        });
      } else {
        setSchedule(data ? data.format('00:mm:00') : '');
        setEditForm({
          ...editForm,
          scheduler_params_time: data ? data.format('00:mm:00') : ''
        });
      }
    } else {
      if (sensitiveData?.scheduler_frequency?.value === 'D') {
        setSchedule(data ? data.format('HH:mm:00') : '');
        setEditForm({
          ...editForm,
          scheduler_params_time: data ? data.format('HH:mm:00') : ''
        });
      } else {
        setSchedule(data ? data.format('00:mm:00') : '');
        setEditForm({
          ...editForm,
          scheduler_params_time: data ? data.format('00:mm:00') : ''
        });
      }
    }
  };

  const onSaveInput = (name) => {
    setEnabled({ ...enabled, [name]: true });
    if (name === 'model_name') {
      setModalName(sensitiveData.model_name);
    } else if (name === 'frequency') {
      setFrequency(sensitiveData.frequency);
    } else if (name === 'sensitivity') {
      setSensitivity(sensitiveData.sensitivity);
    } else if (name === 'anomaly_period') {
      setAnomalyPeriod(sensitiveData.anomaly_period);
    }
  };

  const onCancelInput = (name) => {
    setEnabled({ ...enabled, [name]: true });
    if (name !== 'seasonality') {
      setSensitiveData({ ...sensitiveData, [name]: {} });
    } else if (name === 'anomaly_period') {
      setSensitiveData({ ...sensitiveData, [name]: 0 });
    } else {
      setSensitiveData({ ...sensitiveData, [name]: [] });
    }
  };

  const editableStatus = (type) => {
    var status = '';
    metaInfoData &&
      metaInfoData.length !== 0 &&
      metaInfoData.fields.find((field) => {
        if (field.name === type) {
          status =
            field.is_editable && field.is_sensitive
              ? 'sensitive'
              : field.is_editable
              ? 'editable'
              : '';
        }
        return '';
      });
    return status;
  };

  const editAndSaveButton = (name) => {
    return (
      <div className="edit-configuresetting">
        {enabled[name] ? (
          <button
            className="btn black-button edit-setting-btn"
            onClick={() => setEnabled({ ...enabled, [name]: false })}>
            <img src={Edit} alt="Edit" />
            <span>Edit</span>
          </button>
        ) : (
          <>
            <button
              className="btn black-button "
              onClick={() => onSaveInput(name)}>
              <span>Save</span>
            </button>
            <button
              className="btn black-secondary-button"
              onClick={() => onCancelInput(name)}>
              <span>Cancel</span>
            </button>
          </>
        )}
      </div>
    );
  };

  const shouldShowHour = () => {
    if (enabled?.scheduler_frequency) {
      if (modalFrequency.value === 'D') {
        return true;
      } else {
        return false;
      }
    } else {
      if (sensitiveData.scheduler_frequency === 'D') {
        return true;
      } else {
        return false;
      }
    }
  };

  if (metaInfoLoading || kpiEditLoading || anomalySettingLoading) {
    return (
      <div className="load">
        <div className="preload"></div>
      </div>
    );
  } else {
    const noteForTimePicker = enabled.scheduler_frequency ? (
      modalFrequency.label === 'Daily' ? (
        <p>
          Note: The time set above must be in your server timezone{' '}
          {`(${globalSetting?.timezone})`}
        </p>
      ) : (
        <p>
          Note: Enter schedule (mm) for anomaly scan to be performed every hour
        </p>
      )
    ) : sensitiveData?.scheduler_frequency.label === 'Daily' ? (
      <p>
        Note: The time set above must be in your server timezone{' '}
        {`(${globalSetting?.timezone})`}
      </p>
    ) : (
      <p>
        Note: Enter schedule (mm) for anomaly scan to be performed every hour
      </p>
    );
    return (
      <>
        <div className="dashboard-subheader">
          <div className="common-tab configure-tab">
            <ul>
              <li>Configure Anomaly Detector for Selected KPI</li>
            </ul>
          </div>
        </div>
        <div className="form-container">
          {' '}
          <div className="form-group">
            <label className="help-label">
              Time Series Frequency
              <Tooltip
                className="timeseriesfrequency-tooltip"
                direction="right"
                content={
                  <span>
                    time series granularity to be considered for anomaly
                    detection
                  </span>
                }>
                <img src={Help} alt="Help" />
              </Tooltip>
            </label>
            <div className="editable-field">
              <Select
                options={option.frequency}
                classNamePrefix="selectcategory"
                placeholder="select"
                isSearchable={false}
                value={enabled.frequency ? frequency : sensitiveData.frequency}
                isDisabled={
                  edit
                    ? editableStatus('frequency') === 'editable'
                      ? false
                      : editableStatus('frequency') === 'sensitive'
                      ? enabled.frequency
                      : true
                    : false
                }
                onChange={(e) => {
                  if (enabled.frequency) {
                    setFrequency(e);
                    if (e.value === 'D') {
                      setAnomalyPeriod(60);
                      setEditForm({
                        ...editForm,
                        anomaly_period: 60,
                        frequency: e.value
                      });
                    } else if (e.value === 'H') {
                      setAnomalyPeriod(14);
                      setEditForm({
                        ...editForm,
                        anomaly_period: 14,
                        frequency: e.value
                      });
                    }
                  } else {
                    setSensitiveData({ ...sensitiveData, frequency: e });
                  }
                  setError({ ...error, frequency: '', anomaly_period: '' });
                }}
              />
              {edit &&
                editableStatus('frequency') === 'sensitive' &&
                editAndSaveButton('frequency')}
            </div>
            {error.frequency && (
              <div className="connection__fail">
                <p>{error.frequency}</p>
              </div>
            )}
          </div>
          <div className="form-group">
            <label>Time Window (No of Days)</label>{' '}
            <div className="editable-field">
              <input
                type="number"
                className="form-control"
                name="anomaly_period"
                placeholder="90 Days"
                min={
                  frequency.value === 'D'
                    ? '30'
                    : frequency.value === 'H'
                    ? '7'
                    : '0'
                }
                max={
                  frequency.value === 'D'
                    ? '90'
                    : frequency.value === 'H'
                    ? '21'
                    : '100'
                }
                value={
                  enabled.anomaly_period
                    ? anomalyPeriod
                    : sensitiveData.anomaly_period
                }
                disabled={
                  edit
                    ? editableStatus('anomaly_period') === 'editable'
                      ? false
                      : editableStatus('anomaly_period') === 'sensitive'
                      ? enabled.anomaly_period
                      : true
                    : false
                }
                onChange={(e) => {
                  setError({ ...error, anomaly_period: '' });
                  if (enabled.anomaly_period) {
                    setAnomalyPeriod(e.target.value);
                  } else {
                    setSensitiveData({
                      ...sensitiveData,
                      anomaly_period: e.target.value
                    });
                  }
                  setEditForm({
                    ...editForm,
                    anomaly_period: Number(e.target.value)
                  });
                  if (edit) {
                    if (
                      kpiEditData &&
                      kpiEditData?.anomaly_params?.anomaly_period &&
                      Number(kpiEditData?.anomaly_params?.anomaly_period) !==
                        Number(e.target.value)
                    ) {
                      setNeedForCleanup({
                        ...needForCleanup,
                        anomaly_period: true
                      });
                    } else {
                      const { anomaly_period, ...newItems } = needForCleanup;
                      setNeedForCleanup(newItems);
                    }
                  }
                  setError({ ...error, anomaly_period: '' });
                }}
              />{' '}
              {edit &&
                editableStatus('anomaly_period') === 'sensitive' &&
                editAndSaveButton('anomaly_period')}
            </div>{' '}
            <div className="channel-tip">
              {frequency.value === 'D' && <p>Min: 30 and Max: 90</p>}
              {frequency.value === 'H' && <p>Min: 7 and Max: 21</p>}
            </div>
            {error.anomaly_period && (
              <div className="connection__fail">
                <p>{error.anomaly_period}</p>
              </div>
            )}
          </div>
          <div className="form-group">
            <label>Model Frequency</label>
            <div className="editable-field">
              <Select
                type="text"
                options={option.modalFrequency}
                classNamePrefix="selectcategory"
                placeholder="select"
                value={
                  enabled.scheduler_frequency
                    ? modalFrequency
                    : sensitiveData.scheduler_frequency
                }
                disabled={
                  edit
                    ? editableStatus('scheduler_frequency') === 'editable'
                      ? false
                      : editableStatus('scheduler_frequency') === 'sensitive'
                      ? enabled.scheduler_frequency
                      : true
                    : false
                }
                onChange={(e) => {
                  if (enabled.scheduler_frequency) {
                    setModalFrequency(e);
                  } else {
                    setSensitiveData({
                      ...sensitiveData,
                      scheduler_frequency: e
                    });
                  }
                  setEditForm({
                    ...editForm,
                    scheduler_frequency: e.value
                  });
                  if (edit) {
                    if (
                      kpiEditData &&
                      kpiEditData?.anomaly_params?.scheduler_frequency &&
                      kpiEditData?.anomaly_params?.scheduler_frequency !==
                        e.value
                    ) {
                      setNeedForCleanup({
                        ...needForCleanup,
                        scheduler_frequency: true
                      });
                    } else {
                      const { scheduler_frequency, ...newItems } =
                        needForCleanup;
                      setNeedForCleanup(newItems);
                    }
                  }
                }}
              />
              {edit &&
                editableStatus('scheduler_frequency') === 'sensitive' &&
                editAndSaveButton('scheduler_frequency')}
            </div>
            {error.model_frequency && (
              <div className="connection__fail">
                <p>{error.model_frequency}</p>
              </div>
            )}
          </div>
          <div className="form-group">
            <label>Model Name</label>
            <div className="editable-field">
              <Select
                options={option.model_name}
                classNamePrefix="selectcategory"
                placeholder="select"
                value={
                  enabled.model_name ? modelName : sensitiveData.model_name
                }
                isSearchable={false}
                isDisabled={
                  edit
                    ? editableStatus('model_name') === 'editable'
                      ? false
                      : editableStatus('model_name') === 'sensitive'
                      ? enabled.model_name
                      : true
                    : false
                }
                onChange={(e) => {
                  if (enabled.model_name) {
                    setModalName(e);
                  } else {
                    setSensitiveData({
                      ...sensitiveData,
                      model_name: e
                    });
                  }
                  setEditForm({ ...editForm, model_name: e.value });
                  if (edit) {
                    if (
                      kpiEditData &&
                      kpiEditData?.anomaly_params?.model_name &&
                      kpiEditData?.anomaly_params?.model_name !== e.value
                    ) {
                      setNeedForCleanup({
                        ...needForCleanup,
                        model_name: true
                      });
                    } else {
                      const { model_name, ...newItems } = needForCleanup;
                      setNeedForCleanup(newItems);
                    }
                  }
                  setError({ ...error, modelName: '' });
                }}
              />
              {edit &&
                editableStatus('model_name') === 'sensitive' &&
                editAndSaveButton('model_name')}
            </div>
            {error.modelName && (
              <div className="connection__fail">
                <p>{error.modelName}</p>
              </div>
            )}
          </div>
          <div className="form-group">
            <label className="help-label">
              Sensitivity
              <Tooltip
                className="sensitivity-tooltip"
                direction="right"
                content={
                  <span>
                    High sensitivity leads to high granularity detection leading
                    and higher number of alerts
                  </span>
                }>
                <img src={Help} alt="Help" />
              </Tooltip>
            </label>
            <div className="editable-field">
              <Select
                options={option.sensitivity}
                classNamePrefix="selectcategory"
                value={
                  enabled.sensitivity ? Sensitivity : sensitiveData.sensitivity
                }
                isDisabled={
                  edit
                    ? editableStatus('sensitivity') === 'editable'
                      ? false
                      : editableStatus('sensitivity') === 'sensitive'
                      ? enabled.sensitivity
                      : true
                    : false
                }
                placeholder="select"
                isSearchable={false}
                onChange={(e) => {
                  if (enabled.sensitivity) {
                    setSensitivity(e);
                  } else {
                    setSensitiveData({ ...sensitiveData, sensitivity: e });
                  }
                  setEditForm({ ...editForm, sensitivity: e.value });
                  if (edit) {
                    if (
                      kpiEditData &&
                      kpiEditData?.anomaly_params?.sensitivity &&
                      kpiEditData?.anomaly_params?.sensitivity !== e.value
                    ) {
                      setNeedForCleanup({
                        ...needForCleanup,
                        sensitivity: true
                      });
                    } else {
                      const { sensitivity, ...newItems } = needForCleanup;
                      setNeedForCleanup(newItems);
                    }
                  }
                  setError({ ...error, sensitivity: '' });
                }}
              />
              {edit &&
                editableStatus('sensitivity') === 'sensitive' &&
                editAndSaveButton('sensitivity')}
            </div>
            {error.sensitivity && (
              <div className="connection__fail">
                <p>{error.sensitivity}</p>
              </div>
            )}
          </div>
          <div className="form-group">
            <label>
              {enabled.scheduler_frequency
                ? modalFrequency.label
                : sensitiveData.scheduler_frequency.label}{' '}
              Schedule
            </label>
            <div className="editable-field">
              <TimePicker
                onChange={handleValueChange}
                defaultValue={schedule}
                className="time-picker"
                disabled={
                  edit
                    ? editableStatus('scheduler_params_time') === 'editable'
                      ? false
                      : editableStatus('scheduler_params_time') === 'sensitive'
                      ? enabled.schedule
                      : true
                    : false
                }
                focusOnOpen={true}
                showHour={shouldShowHour()}
                showSecond={false}
                value={schedule && moment(schedule, 'HH:mm')}
              />

              {edit &&
                editableStatus('scheduler_params_time') === 'sensitive' &&
                editAndSaveButton('schedule')}
            </div>
            <div className="channel-tip">{noteForTimePicker}</div>
          </div>
          <div className="form-action analystics-button">
            <button
              className={
                kpiSettingLoading
                  ? 'btn black-button btn-loading'
                  : 'btn black-button'
              }
              onClick={() => {
                onSettingSave();
              }}>
              <div className="btn-spinner">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <span>Loading...</span>
              </div>
              <div className="btn-content">
                <span>Set Up</span>
              </div>
            </button>
          </div>
        </div>
        <Modal
          portalClassName="dashboardmodal"
          isOpen={modalOpen}
          shouldCloseOnOverlayClick={false}>
          <div className="modal-close">
            <img src={Close} alt="Close" onClick={() => closeModal()} />
          </div>
          <div className="modal-body">
            <div className="modal-contents">
              <h3>All your previous data will be deleted</h3>
              <p>Are you sure you want to proceed? </p>
              <div className="next-step-navigate-edit-modal">
                <button
                  className="btn white-button"
                  onClick={() => closeModal()}>
                  <span>Cancel</span>
                </button>
                <button
                  className="btn black-button"
                  onClick={() => {
                    const data = {
                      anomaly_params: { ...editForm }
                    };
                    dispatch(kpiSettingSetup(kpi, data, customToast));
                    setModalOpen(false);
                  }}>
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </div>
        </Modal>
      </>
    );
  }
};
export default Analystics;
