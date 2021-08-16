import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import '../../assets/styles/addform.scss';
import Play from '../../assets/images/play.svg';
import PlayDisable from '../../assets/images/play-disable.svg';
import Success from '../../assets/images/success.svg';
import Fail from '../../assets/images/fail.svg';
import GoogleSheet from '../../assets/images/googlesheets.svg';
import Postgre from '../../assets/images/postgre.svg';
import GoogleAnalytics from '../../assets/images/googleanalytics.svg';
import Amplitude from '../../assets/images/amplitude.svg';
import MySQL from '../../assets/images/mysql.svg';
import {
  createDataSource,
  getConnectionType,
  testDatasourceConnection
} from '../../redux/actions';
import { useDispatch, useSelector } from 'react-redux';
import { renderTextFields } from './Formhelper';

const customSingleValue = ({ data }) => (
  <div className="input-select">
    <div className="input-select__single-value">
      {data.icon && <span className="input-select__icon">{data.icon}</span>}
      <span>{data.label}</span>
    </div>
  </div>
);

const DataSourceForm = () => {
  const dispatch = useDispatch();

  const [option, setOption] = useState([]);
  const [selectedDatasource, setSelectedDatasource] = useState();
  const [sourceDefinitionId, setSourceDefinitionId] = useState('');
  const [connectionName, setConnectionName] = useState('');
  const [dsFormData, setDsFormData] = useState({});
  const [error, setError] = useState('');
  const [formError, setFormError] = useState({});
  const [status, setStatus] = useState('');
  const { isLoading, connectionType, testLoading, testConnectionResponse } =
    useSelector((state) => state.dataSource);

  useEffect(() => {
    dispatchGetConnectionType();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const dispatchGetConnectionType = () => {
    dispatch(getConnectionType());
  };

  useEffect(() => {
    const fetchData = () => {
      var arr = [];
      connectionType.map((item) => {
        return arr.push({
          value: item,
          label: (
            <div className="optionlabel">
              <img
                src={
                  item.name === 'Google Analytics'
                    ? GoogleAnalytics
                    : item.name === 'Postgres'
                    ? Postgre
                    : item.name === 'Google Sheets'
                    ? GoogleSheet
                    : item.name === 'MySQL'
                    ? MySQL
                    : item.name === 'Amplitude'
                    ? Amplitude
                    : ''
                }
                alt={item.name}
              />
              {item.name}
            </div>
          )
        });
      });
      setOption(arr);
    };
    if (connectionType && connectionType.length !== 0) {
      fetchData();
    }
  }, [connectionType]);

  const handleInputChange = (key, e) => {
    setDsFormData((prev) => {
      return {
        ...prev,
        [key]: e.target.value
      };
    });
    setFormError([]);
    setStatus('');
  };

  useEffect(() => {
    if (testConnectionResponse !== undefined) {
      setStatus(testConnectionResponse);
    }
  }, [testConnectionResponse]);
  const handleCheckboxChange = (key, e) => {
    setDsFormData((prev) => {
      return {
        ...prev,
        [key]: e.target.checked
      };
    });
  };

  const testConnection = () => {
    const { connectionSpecification } = selectedDatasource.value;
    const { required } = connectionSpecification;
    var newobj = { ...formError };
    if (Object.keys(required).length > 0) {
      required.map((obj) => {
        const errorText = dsFormData[obj];
        if (!errorText) {
          newobj[obj] = 'Please enter  ' + obj;
        }
        return newobj;
      });
      setFormError(newobj);
    }
    if (connectionName === '') {
      setError('Please enter connection name');
    }
    if (Object.keys(newobj).length === 0 && connectionName !== '') {
      checkTestConnection();
    }
  };

  const checkTestConnection = () => {
    const payload = {
      connectionConfiguration: dsFormData,
      sourceDefinitionId: sourceDefinitionId
    };
    dispatch(testDatasourceConnection(payload));
  };

  const saveDataSource = () => {
    const { connectionSpecification } = selectedDatasource.value;
    const { required } = connectionSpecification;
    var newobj = { ...formError };
    if (Object.keys(required).length > 0) {
      required.map((obj) => {
        const errorText = dsFormData[obj];
        if (!errorText) {
          newobj[obj] = 'Please enter' + obj;
        }
        return newobj;
      });
      setFormError(newobj);
    }
    if (connectionName === '') {
      setError('Please enter connection name');
    }
    if (Object.keys(newobj).length === 0 && connectionName !== '') {
      const payload = {
        connection_type: selectedDatasource.value.name,
        name: connectionName,
        sourceForm: {
          connectionConfiguration: dsFormData,
          sourceDefinitionId: sourceDefinitionId
        }
      };
      dispatch(createDataSource(payload));
    }
  };

  if (isLoading) {
    return (
      <div className="loader">
        <div className="loading-text">
          <p>loading</p>
          <span></span>
        </div>
      </div>
    );
  } else {
    return (
      <div>
        <div className="form-group">
          <label>Connection Name</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter Connection Name"
            value={connectionName}
            onChange={(e) => {
              setConnectionName(e.target.value);
              setError('');
            }}
          />
          {error && (
            <div className="connection__fail">
              <p>{error}</p>
            </div>
          )}
        </div>
        <div className="form-group">
          <label>Select Data Source*</label>
          <Select
            options={option}
            classNamePrefix="selectcategory"
            onChange={(e) => {
              setSelectedDatasource(e);
              setConnectionName('');
              setError('');
              setFormError([]);
              setSourceDefinitionId(e.value.sourceDefinitionId);
              setDsFormData({});
              setStatus('');
            }}
            components={{ SingleValue: customSingleValue }}
          />
        </div>

        {selectedDatasource &&
          selectedDatasource !== undefined &&
          Object.keys(selectedDatasource.value).length > 0 &&
          renderTextFields(
            selectedDatasource.value,
            handleInputChange,
            handleCheckboxChange,
            dsFormData,
            formError
          )}
        {/* for Google Sheet */}
        {/*Paste here*/}
        {/* end of Google Analytics */}
        {/* test connection sucess message */}
        {status && status?.status === 'succeeded' && (
          <div className="connection__success">
            <p>
              <img src={Success} alt="Success" />
              Test Connection Success
            </p>
          </div>
        )}
        {/* test connection fail message */}
        {status && status?.status === 'failed' && (
          <div className="connection__fail">
            <p>
              <img src={Fail} alt="Fail" />
              Test Connection Failed
            </p>
          </div>
        )}
        <div className="form-action">
          {status && status?.status === 'succeeded' && (
            <button
              className="btn black-button"
              onClick={() => {
                saveDataSource();
              }}>
              <span>Add Data Source</span>
            </button>
          )}
          {(status === '' || status?.status !== 'succeeded') && (
            <button
              className={
                testLoading
                  ? 'btn black-button btn-loading'
                  : 'btn black-button'
              }
              type={'submit'}
              disabled={selectedDatasource !== undefined ? false : true}
              onClick={() => testConnection()}>
              <div className="btn-spinner">
                <div className="spinner-border">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <span>Loading...</span>
              </div>
              <div className="btn-content">
                <img
                  src={selectedDatasource !== undefined ? Play : PlayDisable}
                  alt="Play"
                />
                <span>Test Connection</span>
              </div>
            </button>
          )}
        </div>
      </div>
    );
  }
};

export default DataSourceForm;
