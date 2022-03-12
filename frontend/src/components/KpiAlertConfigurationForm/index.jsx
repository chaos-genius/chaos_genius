import React, { useState, useEffect, useContext } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { useHistory, useParams } from 'react-router-dom';

import Select from 'react-select';
import { Range, getTrackBackground } from 'react-range';

import Anomoly from '../../assets/images/alerts/anomoly.svg';
import AnomolyActive from '../../assets/images/alerts/anomoly-active.svg';
import Edit from '../../assets/images/disable-edit.svg';

//import Static from '../../assets/images/alerts/static.svg';
//import StaticActive from '../../assets/images/alerts/static-active.svg';

import './kpialertconfigurationform.scss';

import { getAllKpiExplorer } from '../../redux/actions';
import { getKpiAlertById } from '../../redux/actions';
import { connectionContext } from '../context';

const alertFrequency = [
  {
    value: 'daily',
    label: 'Daily'
  },
  {
    value: 'hourly',
    label: 'Hourly'
  }
];
const KpiAlertConfigurationForm = ({
  setSteps,
  setAlertFormData,
  alertFormData,
  kpiAlertMetaInfo
}) => {
  const kpiId = useParams().id;
  const history = useHistory();

  const path = history.location.pathname.split('/');
  const dispatch = useDispatch();

  const connectionType = useContext(connectionContext);
  const [type, setType] = useState('anomoloy');
  const [conditionType, setConditionType] = useState('');
  const [value, setValue] = useState([90]);
  const [selectedKpi, setSelectedKpi] = useState();
  const [error, setError] = useState({
    alert_name: '',
    data_source: '',
    alert_type: '',
    kpi_alert_type: '',
    severity_cutoff_score: '',
    alert_message: '',
    alert_frequency: ''
  });
  const [sensitiveData, setSensitveData] = useState({
    alert_name: '',
    data_source: '',
    alert_type: '',
    kpi_alert_type: '',
    severity_cutoff_score: '',
    alert_message: '',
    alert_frequency: ''
  });
  const [option, setOption] = useState([]);

  const [enabled, setEnabled] = useState({
    alert_name: true,
    data_source: true,
    alert_type: true,
    kpi_alert_type: true,
    severity_cutoff_score: true,
    alert_message: true,
    alert_frequency: true
  });

  const onSubmit = () => {
    var obj = { ...error };
    if (alertFormData.alert_name === '') {
      obj['alert_name'] = 'Enter Name of Your Alert';
    }
    if (alertFormData.data_source === 0 || alertFormData.data_source === null) {
      obj['data_source'] = 'Enter Kpi';
    }
    if (alertFormData.kpi_alert_type === '') {
      obj['kpi_alert_type'] = 'Enter Kpi Alert Type';
    }
    if (alertFormData.severity_cutoff_score === '') {
      obj['severity_cutoff_score'] = 'Enter Severity Score';
    }
    if (alertFormData.alert_frequency === '') {
      obj['alert_frequency'] = 'Enter Alert Frequency';
    }
    if (alertFormData.alert_message === '') {
      obj['alert_message'] = 'Enter Alert Message';
    }
    setError(obj);
    if (
      obj.alert_name === '' &&
      obj.data_source === '' &&
      obj.kpi_alert_type === '' &&
      obj.severity_cutoff_score === '' &&
      obj.alert_frequency === '' &&
      obj.alert_message === ''
    ) {
      setSteps(2);
    }
  };

  const { isLoading, kpiExplorerList } = useSelector(
    (state) => state.kpiExplorer
  );

  const { kpiAlertEditData, kpiAlertEditLoading } = useSelector((state) => {
    return state.alert;
  });

  useEffect(() => {
    if (path[2] === 'edit') {
      dispatch(getKpiAlertById(kpiId));
      dispatchGetAllKpiExplorer();
    } else {
      dispatchGetAllKpiExplorer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (
      kpiAlertEditData &&
      kpiAlertEditData.length !== 0 &&
      path[2] === 'edit'
    ) {
      setAlertFormData({
        alert_name: kpiAlertEditData?.alert_name,
        alert_type: kpiAlertEditData?.alert_type,
        data_source: kpiAlertEditData?.data_source,
        alert_query: '',
        alert_settings: '',
        kpi: kpiAlertEditData?.kpi,
        kpi_alert_type: kpiAlertEditData?.kpi_alert_type,
        severity_cutoff_score: kpiAlertEditData?.severity_cutoff_score,
        alert_message: kpiAlertEditData?.alert_message,
        alert_frequency: kpiAlertEditData?.alert_frequency,
        alert_channel: kpiAlertEditData?.alert_channel,
        alert_channel_conf: kpiAlertEditData?.alert_channel_conf,
        daily_digest:
          kpiAlertEditData?.daily_digest !== undefined &&
          kpiAlertEditData?.daily_digest !== null
            ? kpiAlertEditData?.daily_digest
            : false
      });
      setValue(
        kpiAlertEditData ? [kpiAlertEditData?.severity_cutoff_score] : [1]
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kpiAlertEditData]);

  const dispatchGetAllKpiExplorer = () => {
    dispatch(getAllKpiExplorer());
  };

  useEffect(() => {
    if (kpiExplorerList && connectionType) {
      fieldData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kpiExplorerList, connectionType]);

  const fieldData = () => {
    if (kpiExplorerList && isLoading === false) {
      var optionArr = [];
      kpiExplorerList &&
        kpiExplorerList.forEach((data) => {
          optionArr.push({
            value: data.name,
            id: data.id,
            datasource_id: data?.data_source?.id,
            label: <div className="optionlabel">{datasourceIcon(data)}</div>
          });
          setOption(optionArr);
        });
    }
  };

  const datasourceIcon = (type) => {
    let textHtml = '';
    connectionType &&
      connectionType.length !== 0 &&
      connectionType.find((item) => {
        if (item.name === type?.data_source?.connection_type) {
          textHtml = item.icon;
        }
        return '';
      });
    return (
      <>
        <span
          dangerouslySetInnerHTML={{ __html: textHtml }}
          className="datasource-svgicon"
        />
        {type.name}
      </>
    );
  };

  const editableStatus = (type) => {
    var status = '';
    kpiAlertMetaInfo &&
      kpiAlertMetaInfo.length !== 0 &&
      kpiAlertMetaInfo.fields.find((field) => {
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

  const onSaveInput = (name) => {
    setEnabled({ ...enabled, [name]: true });
  };

  const onCancelInput = (name) => {
    setEnabled({ ...enabled, [name]: true });
    setSensitveData({ ...sensitiveData, [name]: '' });
  };

  const editAndSaveButton = (name) => {
    return (
      <>
        {enabled[name] ? (
          <button
            className="btn black-button"
            onClick={() => setEnabled({ ...enabled, [name]: false })}>
            <img src={Edit} alt="Edit" />
            <span>Edit</span>
          </button>
        ) : (
          <>
            <button
              className="btn black-button"
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
      </>
    );
  };

  if (kpiAlertEditLoading) {
    return (
      <div className="load">
        <div className="preload"></div>
      </div>
    );
  } else {
    return (
      <>
        <div className="form-group">
          <h5>Alert Definition</h5>
        </div>
        <div className="form-group">
          <label>Select KPI*</label>
          <div className="editable-field">
            <Select
              classNamePrefix="selectcategory"
              placeholder="Select"
              options={option}
              isDisabled={
                path[2] === 'edit'
                  ? editableStatus('alert_type') === 'editable'
                    ? false
                    : editableStatus('alert_type') === 'sensitive'
                    ? enabled.alert_type
                    : true
                  : false
              }
              value={
                enabled.data_source
                  ? alertFormData.data_source
                    ? option.find((item) => alertFormData.kpi === item.id)
                    : selectedKpi
                  : sensitiveData.data_source
              }
              onChange={(e) => {
                setSelectedKpi(e);
                setAlertFormData({
                  ...alertFormData,
                  data_source: e.datasource_id,
                  kpi: e.id
                });
                setError({ ...error, data_source: '' });
              }}
            />
            {path[2] === 'edit' &&
              editableStatus('alert_type') === 'sensitive' &&
              editAndSaveButton('alert_type')}
          </div>

          {error.data_source && (
            <div className="connection__fail">
              <p>{error.data_source}</p>
            </div>
          )}
        </div>
        <div className="form-group">
          <label>Name of your Alert *</label>
          <div className="editable-field">
            <input
              type="text"
              className="form-control"
              placeholder="Enter alert name"
              required
              value={
                enabled.alert_name
                  ? alertFormData?.alert_name
                  : sensitiveData.alert_name
              }
              disabled={
                path[2] === 'edit'
                  ? editableStatus('alert_name') === 'editable'
                    ? false
                    : editableStatus('alert_name') === 'sensitive'
                    ? enabled.alert_name
                    : true
                  : false
              }
              onChange={(e) => {
                setAlertFormData({
                  ...alertFormData,
                  alert_name: e.target.value
                });
                setError({ ...error, alert_name: '' });
              }}
            />
            {path[2] === 'edit' &&
              editableStatus('alert_type') === 'sensitive' &&
              editAndSaveButton('alert_type')}
          </div>
          {error.alert_name && (
            <div className="connection__fail">
              <p>{error.alert_name}</p>
            </div>
          )}
        </div>
        <div className="form-group">
          <label>Alert Type *</label>

          <div className="alerts-type-container">
            <div
              className={
                type === 'anomoloy' ? 'alerts-type active' : 'alerts-type'
              }
              onClick={() => setType('anomoloy')}>
              <img src={Anomoly} alt="Anomaly" className="alert-image" />
              <img
                src={AnomolyActive}
                alt="Anomaly"
                className="alert-image-active"
              />
              <span>Anomaly</span>

              {error.kpi_alert_type && (
                <div className="connection__fail">
                  <p>{error.kpi_alert_type}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="form-group">
          <h5>Alert Condition</h5>
        </div>
        {type === 'static' ? (
          <>
            <div className="form-group">
              <label>Name of your Alert *</label>
              <div className="alert-condition">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    id="Spike"
                    name="alert"
                    value="spike"
                    onChange={(e) => {
                      setConditionType(e.target.value);
                    }}
                  />
                  <label
                    className={
                      conditionType === 'spike'
                        ? 'form-check-label active'
                        : 'form-check-label'
                    }
                    for="Spike">
                    Spike
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    id="Drop"
                    name="alert"
                    value="drop"
                    onChange={(e) => {
                      setConditionType(e.target.value);
                    }}
                  />
                  <label
                    className={
                      conditionType === 'drop'
                        ? 'form-check-label active'
                        : 'form-check-label'
                    }
                    for="Drop">
                    Drop
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    id="Both"
                    name="alert"
                    value="both"
                    onChange={(e) => setConditionType(e.target.value)}
                  />
                  <label
                    className={
                      conditionType === 'both'
                        ? 'form-check-label active'
                        : 'form-check-label'
                    }
                    for="Both">
                    Both
                  </label>
                </div>
              </div>
            </div>
            <div className="form-group">
              <label>Deviation Value *</label>
              <div className="deviation-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter Value"
                  required
                />

                <Select
                  classNamePrefix="selectcategory"
                  placeholder="Select Unit"
                />
              </div>
            </div>
          </>
        ) : (
          <div className="form-group">
            <label>Severity Score *</label>
            <div className="score-range">
              <div className="score-card">{value}</div>
              <div className="range-selector">
                <Range
                  values={value}
                  step={1}
                  min={1}
                  max={100}
                  onChange={(values) => {
                    setValue([values]);
                    setAlertFormData({
                      ...alertFormData,
                      severity_cutoff_score: values[0]
                    });
                  }}
                  renderTrack={({ props, children }) => (
                    <div
                      onMouseDown={props.onMouseDown}
                      onTouchStart={props.onTouchStart}
                      style={{
                        ...props.style,
                        display: 'flex',
                        width: '100%'
                      }}>
                      <div
                        ref={props.ref}
                        style={{
                          height: '8px',
                          width: '100%',
                          borderRadius: '4px',
                          background: getTrackBackground({
                            values: value,
                            colors: [
                              ['#60CA9A 0%', '#FAC06B', '#E96560'],
                              '#EFEFEF'
                            ],
                            min: 0,
                            max: 100
                          }),
                          alignSelf: 'center'
                        }}>
                        {children}
                      </div>
                    </div>
                  )}
                  renderThumb={({ props, isDragged }) => (
                    <div
                      {...props}
                      style={{
                        ...props.style,
                        height: '18px',
                        width: '18px',
                        borderRadius: '50%',
                        outline: 'none',
                        background: '#FFFFFF',
                        border: '2px solid #60CA9A',
                        boxSizing: 'border-box',
                        cursor: 'pointer'
                      }}></div>
                  )}
                />
                <div className="range-category">
                  <span>Low</span> <span>Med</span> <span>High</span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="form-group">
          <label>Alert Frequency *</label>
          <div className="editable-field">
            <Select
              classNamePrefix="selectcategory"
              placeholder="Alert Frequency"
              options={alertFrequency}
              isDisabled={
                path[2] === 'edit'
                  ? editableStatus('alert_frequency') === 'editable'
                    ? false
                    : editableStatus('alert_frequency') === 'sensitive'
                    ? enabled.alert_frequency
                    : true
                  : false
              }
              value={
                enabled.alert_frequency
                  ? alertFormData.alert_frequency
                    ? {
                        value: alertFormData.alert_frequency,
                        label: alertFormData.alert_frequency
                      }
                    : 'none'
                  : sensitiveData.alert_frequency
              }
              onChange={(e) => {
                setAlertFormData({
                  ...alertFormData,
                  alert_frequency: e.value
                });
                setError({ ...error, alert_frequency: '' });
              }}
            />
            {path[2] === 'edit' &&
              editableStatus('alert_frequency') === 'sensitive' &&
              editAndSaveButton('alert_frequency')}
          </div>
          {error.alert_frequency && (
            <div className="connection__fail">
              <p>{error.alert_frequency}</p>
            </div>
          )}
        </div>
        <div className="form-group alert-textarea">
          <label>Message Body *</label>
          <div className="editable-field">
            <textarea
              placeholder="Enter message here"
              value={
                enabled.alert_message
                  ? alertFormData.alert_message
                  : sensitiveData.alert_message
              }
              disabled={
                path[2] === 'edit'
                  ? editableStatus('alert_message') === 'editable'
                    ? false
                    : editableStatus('alert_message') === 'sensitive'
                    ? enabled.alert_message
                    : true
                  : false
              }
              onChange={(e) => {
                setAlertFormData({
                  ...alertFormData,
                  alert_message: e.target.value
                });
                setError({ ...error, alert_message: '' });
              }}
            />
            {path[2] === 'edit' &&
              editableStatus('alert_message') === 'sensitive' &&
              editAndSaveButton('alert_message')}
          </div>
          {error.alert_message && (
            <div className="connection__fail">
              <p>{error.alert_message}</p>
            </div>
          )}
        </div>
        <div className="form-action ">
          <button className="btn black-button" onClick={() => onSubmit()}>
            <span>Next Step</span>
          </button>
        </div>
      </>
    );
  }
};

export default KpiAlertConfigurationForm;
