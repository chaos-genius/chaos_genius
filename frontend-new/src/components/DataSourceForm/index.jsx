import React, { useEffect, useState } from 'react';

import Select from 'react-select';

import { useHistory, useParams } from 'react-router-dom';

import Play from '../../assets/images/play.svg';
import PlayDisable from '../../assets/images/play-disable.svg';
// import Success from '../../assets/images/success.svg';
// import Fail from '../../assets/images/fail.svg';

import { useToast } from 'react-toast-wnm';

import '../../assets/styles/addform.scss';

import {
  createDataSource,
  testDatasourceConnection,
  getDatasourceMetaInfo,
  getDatasourceById,
  updateDatasourceById
} from '../../redux/actions';

import { useDispatch, useSelector } from 'react-redux';

import { renderTextFields } from './Formhelper';

import { CustomContent, CustomActions } from '../../utils/toast-helper';

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

  const toast = useToast();

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
          value: item.name,
          selected: item,
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

  const findDataType = (data) => {
    if (connectionType) {
      var obj = connectionType.find((item) => {
        return data?.connection_type === item.name;
      });
      setSelectedDatasource({
        value: obj.name,
        selected: obj,
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
      customToast({
        type: 'success',
        header: 'Successfully updated',
        description: updateDatasource.message
      });
    } else if (
      updateDatasource &&
      updateDatasource.status === 'failed' &&
      path[2] === 'edit'
    ) {
      customToast({
        type: 'error',
        header: 'Failed to update',
        description: updateDatasource.message
      });
    } else if (
      createDatasourceResponse &&
      createDatasourceResponse.status === 'connected' &&
      path[2] === 'add'
    ) {
      history.push('/datasource');
      customToast({
        type: 'success',
        header: 'Successfully Added',
        description: createDatasourceResponse.msg
      });
    } else if (
      createDatasourceResponse &&
      createDatasourceResponse.status === 'failed' &&
      path[2] === 'add'
    ) {
      customToast({
        type: 'error',
        header: 'Failed to Add',
        description: createDatasourceResponse.msg
      });
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
    if (
      testConnectionResponse &&
      testConnectionResponse.status === 'succeeded'
    ) {
      customToast({
        type: 'success',
        header: 'Test Connection Success',
        description: testConnectionResponse.msg
      });
    } else if (
      testConnectionResponse &&
      testConnectionResponse.status === 'failed'
    ) {
      customToast({
        type: 'error',
        header: 'Test Connection Failed',
        description: testConnectionResponse.msg
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const { connectionSpecification } = selectedDatasource.selected;
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
      sourceDefinitionId: sourceDefinitionId,
      connection_type: selectedDatasource.value
    };

    dispatch(testDatasourceConnection(payload));
  };

  const saveDataSource = () => {
    const { connectionSpecification } = selectedDatasource.selected;
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
        connection_type: selectedDatasource.value,
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
    const { connectionSpecification } = selectedDatasource.selected;
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
              setSourceDefinitionId(e.selected.sourceDefinitionId);
              setDsFormData({});
              setStatus('');
            }}
            components={{ SingleValue: customSingleValue }}
          />
        </div>
        {/* {sourceDefinitionId === '47f25999-dd5e-4636-8c39-e7cea2453331' && (
          <div className="form-group">
            <label>Accounts</label>
            <input
              type="text"
              className="form-control"
              required
              onChange={(e) => console.log('EVENT:', e.target.value)}
            />
          </div>
        )} */}

        {selectedDatasource &&
          selectedDatasource !== undefined &&
          Object.keys(selectedDatasource.selected).length > 0 &&
          renderTextFields(
            selectedDatasource.selected.connectionSpecification,
            handleInputChange,
            handleCheckboxChange,
            dsFormData,
            setDsFormData,
            setEditedForm,
            formError,
            path
          )}

        {/* test connection sucess message */}
        {/* {status && status?.status === 'succeeded' && (
          <div className="connection__success">
            <p>
              <img src={Success} alt="Success" />
              Test Connection Success
            </p>
          </div>
        )} */}
        {/* test connection fail message */}
        {/* {status && status?.status === 'failure' && (
          <div className="connection__fail">
            <p>
              <img src={Fail} alt="Fail" />
              Test Connection Failed
            </p>
          </div>
        )} */}
        {path[2] === 'edit' ? (
          <div className="form-action">
            <button
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
      </div>
    );
  }
};

export default DataSourceForm;
