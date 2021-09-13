import React, { useEffect, useState } from 'react';

import Select from 'react-select';
import { useHistory } from 'react-router-dom';

import '../../assets/styles/addform.scss';
import Play from '../../assets/images/play.svg';
import PlayDisable from '../../assets/images/play-disable.svg';
import Success from '../../assets/images/success.svg';
import Fail from '../../assets/images/fail.svg';

import {
  createDataSource,
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

const datasourceIcon = (type) => {
  let textHtml = type.icon;
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

const DataSourceForm = ({ onboarding, setModal, setText }) => {
  const dispatch = useDispatch();

  const [option, setOption] = useState([]);
  const [selectedDatasource, setSelectedDatasource] = useState();
  const [sourceDefinitionId, setSourceDefinitionId] = useState('');
  const [connectionName, setConnectionName] = useState('');
  const [dsFormData, setDsFormData] = useState({});
  const [error, setError] = useState('');
  const [formError, setFormError] = useState({});
  const [status, setStatus] = useState('');
  const history = useHistory();
  const data = history.location.pathname.split('/');
  const connectionType = JSON.parse(localStorage.getItem('connectionType'));
  const {
    //isLoading,
    testLoading,
    testConnectionResponse,
    createDatasourceResponse,
    createDatasourceLoading,
    metaInfoData
  } = useSelector((state) => state.dataSource);

  useEffect(() => {
    const fetchData = () => {
      var arr = [];
      connectionType.map((item) => {
        return arr.push({
          value: item,
          label: <div className="optionlabel">{datasourceIcon(item)}</div>
        });
      });
      setOption(arr);
    };
    if (connectionType) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (
      createDatasourceResponse &&
      createDatasourceResponse.status === 'connected' &&
      onboarding !== true
    ) {
      history.push('/datasource');
    } else if (
      createDatasourceResponse &&
      createDatasourceResponse.status === 'connected' &&
      onboarding === true
    ) {
      setModal(true);
      setText('datasource');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createDatasourceResponse]);

  const handleInputChange = (child, key, e) => {
    if (child !== '') {
      setDsFormData((prev) => {
        return {
          ...prev,
          [child]: {
            ...prev[child],
            [key]:
              e.target.type === 'number'
                ? parseInt(e.target.value)
                : e.target.value
          }
        };
      });
    } else {
      setDsFormData((prev) => {
        return {
          ...prev,
          [key]:
            e.target.type === 'number'
              ? parseInt(e.target.value)
              : e.target.value
        };
      });
      setFormError([]);
      setStatus('');
    }
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

  // if (isLoading) {
  //   return (
  //     <div className="load ">
  //       <div className="preload"></div>
  //     </div>
  //   );
  // } else {
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
          selectedDatasource.value.connectionSpecification,
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
            // className="btn black-button"
            className={
              createDatasourceLoading
                ? 'btn black-button btn-loading'
                : 'btn black-button'
            }
            onClick={() => {
              saveDataSource();
            }}>
            <div className="btn-spinner">
              <div className="spinner-border">
                <span className="visually-hidden">Loading...</span>
              </div>
              <span>Loading...</span>
            </div>
            <div className="btn-content">
              <span>Add Data Source</span>
            </div>
          </button>
        )}
        {(status === '' || status?.status !== 'succeeded') && (
          <button
            className={
              testLoading ? 'btn black-button btn-loading' : 'btn black-button'
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
};
//};

export default DataSourceForm;
