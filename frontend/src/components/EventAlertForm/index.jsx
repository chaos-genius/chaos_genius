import React, { useState, useEffect, useContext } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import Select from 'react-select';

import './eventalertform.scss';
import Play from '../../assets/images/play-green.png';
import Edit from '../../assets/images/disable-edit.svg';

import { connectionContext } from '../context';
import { useDispatch, useSelector } from 'react-redux';
import {
  getAllKpiExplorerForm,
  getTestQuery,
  getKpiAlertById
} from '../../redux/actions';

import { CustomContent, CustomActions } from '../../utils/toast-helper';
import { useToast } from 'react-toast-wnm';

const customSingleValue = ({ data }) => (
  <div className="input-select">
    <div className="input-select__single-value">
      {data.icon && <span className="input-select__icon">{data.icon}</span>}
      <span>{data.label}</span>
    </div>
  </div>
);

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

const EventAlertForm = ({
  setSteps,
  alertFormData,
  setAlertFormData,
  kpiAlertMetaInfo
}) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const kpiId = useParams().id;
  const path = history.location.pathname.split('/');
  const toast = useToast();
  const connectionType = useContext(connectionContext);
  const { kpiFormLoading, kpiFormData, testQueryData } = useSelector(
    (state) => state.kpiExplorer
  );

  const [option, setOption] = useState([]);
  const [datasourceid, setDataSourceId] = useState('');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState();
  const [error, setError] = useState({
    alert_name: '',
    data_source: '',
    alert_type: '',
    alert_query: '',
    alert_settings: '',
    alert_message: '',
    alert_frequency: ''
  });
  const [sensitiveData, setSensitveData] = useState({
    alert_name: '',
    data_source: '',
    alert_type: '',
    alert_query: '',
    alert_settings: '',
    alert_message: '',
    alert_frequency: ''
  });

  const [enabled, setEnabled] = useState({
    alert_name: true,
    data_source: true,
    alert_type: true,
    alert_query: true,
    alert_settings: true,
    alert_message: true,
    alert_frequency: true
  });

  const onSubmit = () => {
    var obj = { ...error };
    if (alertFormData.alert_name === '') {
      obj['alert_name'] = 'Enter Name of Your Alert';
    }
    if (alertFormData.data_source === 0 || alertFormData.data_source === null) {
      obj['data_source'] = 'Enter Data Source';
    }
    if (alertFormData.alert_query === '') {
      obj['alert_query'] = 'Enter Query';
    }
    if (alertFormData.alert_settings === '') {
      obj['alert_settings'] = 'Enter Alert Settings';
    }
    if (alertFormData.alert_frequency === '') {
      obj['alert_frequency'] = 'Enter Alert Frequency';
    }
    if (alertFormData.alert_message === '') {
      obj['alert_message'] = 'Enter Alert Frequency';
    }
    setError(obj);
    if (
      obj.alert_name === '' &&
      obj.data_source === '' &&
      obj.alert_query === '' &&
      obj.alert_settings === '' &&
      obj.alert_frequency === '' &&
      obj.alert_message === ''
    ) {
      setSteps(2);
    }
  };

  const { kpiAlertEditData, kpiAlertEditLoading } = useSelector((state) => {
    return state.alert;
  });

  useEffect(() => {
    if (path[2] === 'edit') {
      dispatch(getKpiAlertById(kpiId));
      dispatch(getAllKpiExplorerForm());
    } else {
      dispatch(getAllKpiExplorerForm());
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
        alert_query: kpiAlertEditData?.alert_query,
        alert_settings: kpiAlertEditData?.alert_settings,
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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kpiAlertEditData]);

  useEffect(() => {
    if (kpiFormData && connectionType) {
      fieldData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kpiFormData, connectionType]);

  useEffect(() => {
    if (testQueryData && testQueryData?.status === 'success') {
      customToast({
        type: 'success',
        header: 'Test Connection Successful',
        description: testQueryData.msg
      });
    }
    if (testQueryData && testQueryData?.status === 'failure') {
      customToast({
        type: 'error',
        header: 'Test Connection Failed',
        description: testQueryData.msg
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testQueryData]);

  const fieldData = () => {
    if (kpiFormData && kpiFormLoading === false) {
      var optionArr = [];
      kpiFormData &&
        kpiFormData.data.forEach((data) => {
          optionArr.push({
            value: data.name,
            id: data.id,
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
        if (item.name === type.connection_type) {
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

  const onTestQuery = () => {
    const payload = {
      data_source_id: datasourceid,
      from_query: true,
      query: query
    };
    dispatch(getTestQuery(payload));
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

  const customToast = (data) => {
    const { type, header, description } = data;
    toast({
      autoDismiss: true,
      enableAnimation: true,
      delay: type === 'success' ? '5000' : '60000',
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
          <label>Name Of Your Alert *</label>
          <div className="editable-field">
            <input
              type="text"
              className="form-control"
              placeholder="Enter Alert Name"
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
          <label>Select Data Source*</label>
          <div className="editable-field">
            <Select
              options={option}
              classNamePrefix="selectcategory"
              placeholder="Select Data Source"
              components={{ SingleValue: customSingleValue }}
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
                    ? option.find(
                        (item) => alertFormData.data_source === item.id
                      )
                    : selected
                  : sensitiveData.data_source
              }
              onChange={(e) => {
                setDataSourceId(e.id);
                setSelected(e);
                setError({ ...error, data_source: '' });
                setAlertFormData({
                  ...alertFormData,
                  data_source: e.id
                });
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
        <div className="form-group query-form">
          <label>Query *</label>
          <textarea
            placeholder="Enter Query"
            value={alertFormData.alert_query}
            onChange={(e) => {
              setQuery(e.target.value);
              setError({ ...error, alert_query: '' });
              setAlertFormData({
                ...alertFormData,
                alert_query: e.target.value
              });
            }}></textarea>
          <div className="test-query-connection">
            <div className="test-query" onClick={() => onTestQuery()}>
              <span>
                <img src={Play} alt="Play" />
                Test Query
              </span>
            </div>
          </div>
          {error.alert_query && (
            <div className="connection__fail">
              <p>{error.alert_query}</p>
            </div>
          )}
        </div>
        <div className="form-group">
          <label>Alert Frequency *</label>
          <div className="editable-field">
            <Select
              classNamePrefix="selectcategory"
              options={alertFrequency}
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
              isDisabled={
                path[2] === 'edit'
                  ? editableStatus('alert_frequency') === 'editable'
                    ? false
                    : editableStatus('alert_frequency') === 'sensitive'
                    ? enabled.alert_frequency
                    : true
                  : false
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

        <div className="form-group form-group-label-margin">
          <label>Alert Settings *</label>
          <div className="editable-field">
            <div className="alert-setting">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  id="newentry"
                  name="alert"
                  disabled={
                    path[2] === 'edit'
                      ? editableStatus('alert_settings') === 'editable'
                        ? false
                        : editableStatus('alert_settings') === 'sensitive'
                        ? enabled.alert_settings
                        : true
                      : false
                  }
                  checked={alertFormData.alert_settings === 'new_entry_alert'}
                  onChange={(e) => {
                    setError({ ...error, alert_settings: '' });
                    setAlertFormData({
                      ...alertFormData,
                      alert_settings: 'new_entry_alert'
                    });
                  }}
                />
                <label
                  className={
                    alertFormData.alert_settings === 'new_entry_alert'
                      ? 'form-check-label active'
                      : 'form-check-label'
                  }
                  for="newentry">
                  New Entry
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  id="allchanges"
                  name="alert"
                  checked={alertFormData.alert_settings === 'change_alert'}
                  disabled={
                    path[2] === 'edit'
                      ? editableStatus('alert_settings') === 'editable'
                        ? false
                        : editableStatus('alert_settings') === 'sensitive'
                        ? enabled.alert_settings
                        : true
                      : false
                  }
                  onChange={(e) => {
                    setError({ ...error, alert_settings: '' });
                    setAlertFormData({
                      ...alertFormData,
                      alert_settings: 'change_alert'
                    });
                  }}
                />
                <label
                  className={
                    alertFormData.alert_settings === 'change_alert'
                      ? 'form-check-label active'
                      : 'form-check-label'
                  }
                  for="allchanges">
                  All Changes
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  id="alwayssend"
                  name="alert"
                  disabled={
                    path[2] === 'edit'
                      ? editableStatus('alert_settings') === 'editable'
                        ? false
                        : editableStatus('alert_settings') === 'sensitive'
                        ? enabled.alert_settings
                        : true
                      : false
                  }
                  checked={alertFormData.alert_settings === 'always_alert'}
                  onChange={(e) => {
                    setError({ ...error, alert_settings: '' });
                    setAlertFormData({
                      ...alertFormData,
                      alert_settings: 'always_alert'
                    });
                  }}
                />
                <label
                  className={
                    alertFormData.alert_settings === 'always_alert'
                      ? 'form-check-label active'
                      : 'form-check-label'
                  }
                  for="alwayssend">
                  Always Send
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  id="missingDataAlert"
                  name="alert"
                  disabled={
                    path[2] === 'edit'
                      ? editableStatus('alert_settings') === 'editable'
                        ? false
                        : editableStatus('alert_settings') === 'sensitive'
                        ? enabled.alert_settings
                        : true
                      : false
                  }
                  checked={
                    alertFormData.alert_settings === 'missing_data_alert'
                  }
                  onChange={(e) => {
                    setError({ ...error, alert_settings: '' });
                    setAlertFormData({
                      ...alertFormData,
                      alert_settings: 'missing_data_alert'
                    });
                  }}
                />
                <label
                  className={
                    alertFormData.alert_settings === 'missing_data_alert'
                      ? 'form-check-label active'
                      : 'form-check-label'
                  }
                  for="missingDataAlert">
                  Missing Data
                </label>
              </div>
            </div>
            {path[2] === 'edit' &&
              editableStatus('alert_settings') === 'sensitive' &&
              editAndSaveButton('alert_settings')}
          </div>
          {error.alert_settings && (
            <div className="connection__fail">
              <p>{error.alert_settings}</p>
            </div>
          )}
        </div>
        <div className="form-group alert-textarea">
          <label>Message Body *</label>
          <div className="editable-field">
            <textarea
              placeholder="Enter Message Here"
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
              }}></textarea>
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
        <div className="form-action">
          <button className="btn black-button" onClick={() => onSubmit()}>
            <span>Next Step</span>
          </button>
        </div>
      </>
    );
  }
};
export default EventAlertForm;
