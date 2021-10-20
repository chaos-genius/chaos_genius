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
  const connectionType = useContext(connectionContext);
  const { kpiFormLoading, kpiFormData } = useSelector(
    (state) => state.kpiExplorer
  );

  const [setting, setSetting] = useState('');
  const [option, setOption] = useState([]);
  const [datasourceid, setDataSourceId] = useState('');
  const [query, setQuery] = useState('');
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
        alert_channel_conf: kpiAlertEditData?.alert_channel_conf
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

  return (
    <>
      <div className="form-group">
        <label>Name Of Your Alert *</label>
        <input
          type="text"
          className="form-control"
          placeholder="Enter Alert Name"
          required
          value={alertFormData.alert_name}
          onChange={(e) => {
            setAlertFormData({
              ...alertFormData,
              alert_name: e.target.value
            });
            setError({ ...error, alert_name: '' });
          }}
        />
        {error.alert_name && (
          <div className="connection__fail">
            <p>{error.alert_name}</p>
          </div>
        )}
      </div>
      <div className="form-group">
        <label>Select Data Source*</label>
        <Select
          options={option}
          classNamePrefix="selectcategory"
          placeholder="Select Data Source"
          components={{ SingleValue: customSingleValue }}
          value={option.find((item) => alertFormData.data_source === item.id)}
          onChange={(e) => {
            setDataSourceId(e.id);
            setError({ ...error, data_source: '' });
            setAlertFormData({
              ...alertFormData,
              data_source: e.id
            });
          }}
        />
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
        <Select
          classNamePrefix="selectcategory"
          options={alertFrequency}
          value={{
            value: alertFormData.alert_frequency,
            label: alertFormData.alert_frequency
          }}
          onChange={(e) => {
            setAlertFormData({
              ...alertFormData,
              alert_frequency: e.value
            });
            setError({ ...error, alert_frequency: '' });
          }}
        />
        {error.alert_frequency && (
          <div className="connection__fail">
            <p>{error.alert_frequency}</p>
          </div>
        )}
      </div>

      <div className="form-group">
        <label>Alert Settings *</label>
        <div className="alert-setting">
          <div className="form-check">
            <input
              className="form-check-input"
              type="radio"
              id="newentry"
              name="alert"
              value={setting}
              checked={alertFormData.alert_settings === 'newentry'}
              onChange={(e) => {
                setSetting(e.target.value);
                setError({ ...error, alert_settings: '' });
                setAlertFormData({
                  ...alertFormData,
                  alert_settings: 'newentry'
                });
              }}
            />
            <label
              className={
                setting === 'newentry'
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
              value={setting}
              checked={alertFormData.alert_settings === 'allchanges'}
              onChange={(e) => {
                setSetting(e.target.value);
                setError({ ...error, alert_settings: '' });
                setAlertFormData({
                  ...alertFormData,
                  alert_settings: 'allchanges'
                });
              }}
            />
            <label
              className={
                setting === 'allchanges'
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
              value={setting}
              checked={alertFormData.alert_settings === 'alwayssend'}
              onChange={(e) => {
                setSetting(e.target.value);
                setError({ ...error, alert_settings: '' });
                setAlertFormData({
                  ...alertFormData,
                  alert_settings: 'alwayssend'
                });
              }}
            />
            <label
              className={
                setting === 'alwayssend'
                  ? 'form-check-label active'
                  : 'form-check-label'
              }
              for="alwayssend">
              Always Send
            </label>
          </div>
        </div>
        {error.alert_settings && (
          <div className="connection__fail">
            <p>{error.alert_settings}</p>
          </div>
        )}
      </div>
      <div className="form-group ">
        <label>Message Body *</label>
        <textarea
          placeholder="Enter Message Here"
          value={alertFormData.alert_message}
          onChange={(e) => {
            setAlertFormData({
              ...alertFormData,
              alert_message: e.target.value
            });
            setError({ ...error, alert_message: '' });
          }}></textarea>
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
};
export default EventAlertForm;
