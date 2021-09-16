import React, { useEffect, useState } from 'react';

import Select from 'react-select';
import { useHistory, useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import '../../assets/styles/addform.scss';
import Play from '../../assets/images/play.svg';
import PlayDisable from '../../assets/images/play-disable.svg';
import Success from '../../assets/images/success.svg';
import Fail from '../../assets/images/fail.svg';

import {
  createDataSource,
  testDatasourceConnection,
  getDatasourceMetaInfo,
  getDatasourceById,
  updateDatasourceById
} from '../../redux/actions';

import { useDispatch, useSelector } from 'react-redux';

import { renderTextFields } from './Formhelper';

import { toastMessage } from '../../utils/toast-helper';

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
  const dsId = useParams().id;
  const [option, setOption] = useState([]);
  const [selectedDatasource, setSelectedDatasource] = useState();
  const [sourceDefinitionId, setSourceDefinitionId] = useState('');
  const [connectionName, setConnectionName] = useState('');
  const [dsFormData, setDsFormData] = useState({});
  const [error, setError] = useState('');
  const [formError, setFormError] = useState({});
  const [editedForm, setEditedForm] = useState({});
  const [status, setStatus] = useState('');
  const history = useHistory();
  const path = history.location.pathname.split('/');
  const connectionType = JSON.parse(localStorage.getItem('connectionType'));
  const {
    //isLoading,
    testLoading,
    testConnectionResponse,
    createDatasourceResponse,
    createDatasourceLoading,
    metaInfoData,
    metaInfoLoading,
    datasourceData,
    datasourceLoading,
    updateDatasourceLoading,
    updateDatasource
  } = useSelector((state) => state.dataSource);

  const getEditDatasource = () => {
    dispatch(getDatasourceMetaInfo());
    dispatch(getDatasourceById(dsId));
  };

  useEffect(() => {
    if (path[2] === 'edit') {
      getEditDatasource();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchData = () => {
      var arr = [];
      connectionType.map((item) => {
        return arr.push({
          value: item,
          name: item.name,
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
    if (datasourceData && datasourceData.length !== 0 && path[2] === 'edit') {
      setConnectionName(datasourceData?.name);
      setDsFormData(datasourceData?.sourceForm);
      findDataType(datasourceData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datasourceData]);

  const findDataType = (data) => {
    if (connectionType) {
      var obj = connectionType.find((item) => {
        return data?.connection_type === item.name;
      });
      setSelectedDatasource({
        value: obj,
        name: obj.name,
        label: <div className="optionlabel">{datasourceIcon(obj)}</div>
      });
    }
  };

  useEffect(() => {
    if (
      createDatasourceResponse &&
      createDatasourceResponse.status === 'connected' &&
      onboarding === false
    ) {
      history.push('/datasource');
    } else if (
      createDatasourceResponse &&
      createDatasourceResponse.status === 'connected' &&
      onboarding === true
    ) {
      setModal(true);
      setText('datasource');
    } else if (
      updateDatasource &&
      updateDatasource.status === 'success' &&
      path[2] === 'edit'
    ) {
      //history.push('/datasource');
      toastMessage({ type: 'success', message: 'Successfully updated' });
    } else if (
      updateDatasource &&
      updateDatasource.status === 'failed' &&
      path[2] === 'edit'
    ) {
      toastMessage({ type: 'error', message: 'Failed to update' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createDatasourceResponse, updateDatasource]);

  const handleInputChange = (child, key, e, edit) => {
    if (child !== '') {
      setDsFormData((prev) => {
        return {
          ...prev,
          [child]: {
            ...prev[child],
            [key]:
              e.target.type === 'number'
                ? parseInt(e.target.value.trim())
                : e.target.value.trim()
          }
        };
      });
    } else {
      setDsFormData((prev) => {
        return {
          ...prev,
          [key]:
            e.target.type === 'number'
              ? parseInt(e.target.value.trim())
              : e.target.value.trim()
        };
      });
      setFormError([]);
      setStatus('');
    }
    if (edit === 'edit') {
      if (child !== '') {
        setEditedForm((prev) => {
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
        setEditedForm((prev) => {
          return {
            ...prev,
            [key]:
              e.target.type === 'number'
                ? parseInt(e.target.value)
                : e.target.value
          };
        });
      }
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

  const editableStatus = (type) => {
    var status = false;
    metaInfoData &&
      metaInfoData.length !== 0 &&
      metaInfoData.fields.find((field) => {
        if (field.name === type) {
          status = field.is_editable ? false : true;
        }
        return '';
      });
    return status;
  };

  const updateDataSource = () => {
    const { connectionSpecification } = selectedDatasource.value;
    const { required } = connectionSpecification;
    var newobj = { ...formError };
    if (Object.keys(required).length > 0) {
      required.map((obj) => {
        const errorText = dsFormData[obj];
        if (!errorText) {
          newobj[obj] = 'Please enter ' + obj;
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
        name: connectionName,
        sourceForm: {
          connectionConfiguration: editedForm
        }
      };
      dispatch(updateDatasourceById(dsId, payload));
    }
  };

  if (metaInfoLoading || datasourceLoading) {
    return (
      <div className="load ">
        <div className="preload"></div>
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
            disabled={path[2] === 'edit' ? editableStatus('name') : false}
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
            isDisabled={
              path[2] === 'edit' ? editableStatus('connection_type') : false
            }
            value={selectedDatasource}
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
            setDsFormData,
            setEditedForm,
            formError,
            path
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
        {path[2] === 'edit' ? (
          <div className="form-action">
            <button
              // className="btn black-button"
              className={
                updateDatasourceLoading
                  ? 'btn black-button btn-loading'
                  : 'btn black-button'
              }
              disabled={selectedDatasource !== undefined ? false : true}
              onClick={() => {
                updateDataSource();
              }}>
              <div className="btn-spinner">
                <div className="spinner-border">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <span>Loading...</span>
              </div>
              <div className="btn-content">
                <span>Save Changes</span>
              </div>
            </button>
          </div>
        ) : (
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
        )}
        <ToastContainer
          position={toast.POSITION.BOTTOM_RIGHT}
          autoClose={5000}
        />
      </div>
    );
  }
};

export default DataSourceForm;
