import React, { useContext, useEffect, useState } from 'react';

import Select from 'react-select';
import Modal from 'react-modal';
import Close from '../../assets/images/close.svg';
import Sands_Of_Time from '../../assets/images/Sands_Of_Time.svg';

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
  updateDatasourceById,
  getTimeZones
} from '../../redux/actions';

import { useDispatch, useSelector } from 'react-redux';

import { renderTextFields } from './Formhelper';

import { CustomContent, CustomActions } from '../../utils/toast-helper';

import { connectionContext } from '../context';

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
Modal.setAppElement('body');

const DataSourceForm = ({ onboarding, setModal, setText }) => {
  const dispatch = useDispatch();
  const connectionType = useContext(connectionContext);
  const toast = useToast();

  const dsId = useParams().id;
  const [option, setOption] = useState([]);
  const [selectedDatasource, setSelectedDatasource] = useState();
  const [sourceDefinitionId, setSourceDefinitionId] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [connectionName, setConnectionName] = useState('');
  const [editedConnectionName, setEditedConnecitonName] = useState('');
  const [editedTimeZone, setEditedTimeZone] = useState('');
  const [dsFormData, setDsFormData] = useState({});
  const [error, setError] = useState('');
  const [formError, setFormError] = useState({});
  const [editedForm, setEditedForm] = useState({});
  const [status, setStatus] = useState('');
  const [timeZonesOptions, setTimeZonesOptions] = useState([]);
  const [selectedTimeZone, setSelectedTimeZone] = useState({
    value: 'UTC',
    label: 'UTC'
  });
  const history = useHistory();
  const path = history.location.pathname.split('/');

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
    updateDatasource,
    connectionTypeLoading,
    timeZones
  } = useSelector((state) => state.dataSource);

  const getEditDatasource = () => {
    dispatch(getDatasourceMetaInfo());
    dispatch(getDatasourceById(dsId));
  };

  const closeModal = () => {
    setShowModal(false);
    history.push('/datasource');
  };

  useEffect(() => {
    dispatch(getTimeZones());
    if (path[2] === 'edit') {
      setEditedTimeZone('');
      getEditDatasource();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (timeZones && timeZones.length) {
      setTimeZonesOptions(timeZones);
    }
  }, [timeZones]);

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
    if (connectionType && connectionType.length !== 0) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectionType]);

  useEffect(() => {
    if (
      datasourceData &&
      datasourceData.length !== 0 &&
      connectionType &&
      connectionType.length !== 0 &&
      path[2] === 'edit'
    ) {
      setConnectionName(datasourceData?.name);
      setDsFormData(datasourceData?.sourceForm);
      setSelectedTimeZone({
        value: datasourceData?.database_timezone,
        label: datasourceData?.database_timezone
      });
      findDataType(datasourceData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datasourceData, connectionType]);

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
      setShowModal(true);
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
      updateDatasource.status === 'failure' &&
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
      setShowModal(true);
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
        header: 'Test Connection Successful',
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
    if (sourceDefinitionId === '47f25999-dd5e-4636-8c39-e7cea2453331') {
      var obj = { ...dsFormData };
      obj['accounts'] = { selection_strategy: 'all' };
      const bingPayload = {
        connectionConfiguration: obj,
        sourceDefinitionId: sourceDefinitionId,
        connection_type: selectedDatasource.value
      };
      dispatch(testDatasourceConnection(bingPayload));
    } else {
      const payload = {
        connectionConfiguration: dsFormData,
        sourceDefinitionId: sourceDefinitionId,
        connection_type: selectedDatasource.value
      };
      dispatch(testDatasourceConnection(payload));
    }
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
      if (sourceDefinitionId === '47f25999-dd5e-4636-8c39-e7cea2453331') {
        var obj = { ...dsFormData };
        obj['accounts'] = { selection_strategy: 'all' };
        const bingPayload = {
          connection_type: selectedDatasource.value,
          name: connectionName,
          database_timezone: selectedTimeZone?.value,
          sourceForm: {
            connectionConfiguration: obj,
            sourceDefinitionId: sourceDefinitionId
          }
        };
        dispatch(createDataSource(bingPayload));
      } else {
        const payload = {
          connection_type: selectedDatasource.value,
          name: connectionName,
          database_timezone: selectedTimeZone?.value,
          sourceForm: {
            connectionConfiguration: dsFormData,
            sourceDefinitionId: sourceDefinitionId
          }
        };
        dispatch(createDataSource(payload));
      }
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
        database_timezone: selectedTimeZone?.value,
        sourceForm: {
          connectionConfiguration: editedForm
        }
      };
      dispatch(updateDatasourceById(dsId, payload));
    }
  };

  const handleChange = (e, key) => {
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
  };

  const searchhref = (type) => {
    return (
      <>
        <span
          dangerouslySetInnerHTML={{ __html: type }}
          className="datasource-svgicon"
        />
      </>
    );
  };

  if (metaInfoLoading || datasourceLoading || connectionTypeLoading) {
    return (
      <div className="load ">
        <div className="preload"></div>
      </div>
    );
  } else {
    const noteForTimeZone = (
      <p>Note: Please retrain KPIs if Time Zone is changed</p>
    );
    return (
      <>
        <div className="form-group">
          <label>Connection Name</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter Connection Name"
            value={connectionName}
            disabled={path[2] === 'edit' ? editableStatus('name') : false}
            onChange={(e) => {
              if (path[2] === 'edit') {
                setEditedConnecitonName(e.target.value);
              }
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
          <label>Select Time Zone*</label>
          <Select
            options={timeZonesOptions}
            classNamePrefix="selectcategory"
            isDisabled={
              path[2] === 'edit' ? editableStatus('time_zone') : false
            }
            value={selectedTimeZone}
            onChange={(e) => {
              setSelectedTimeZone(e);
              if (path[2] === 'edit') {
                setEditedTimeZone(e.value);
              }
              setError('');
              setFormError([]);
            }}
            components={{ SingleValue: customSingleValue }}
          />
          {path[2] === 'edit' && (
            <div className="channel-tip">{noteForTimeZone}</div>
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

        {selectedDatasource?.selected?.sourceDefinitionId ===
          '47f25999-dd5e-4636-8c39-e7cea2453331' && (
          <div className="form-group">
            <label>Accounts</label>
            <input
              type="text"
              className="form-control"
              required
              onChange={(e) => handleChange(e, 'accounts')}
              value={
                path[2] === 'edit'
                  ? dsFormData?.accounts['selection_strategy']
                  : dsFormData?.accounts
              }
            />{' '}
            <div className="channel-tip">
              <p>
                {searchhref(
                  selectedDatasource?.selected?.connectionSpecification
                    ?.properties?.accounts?.description
                )}
              </p>
            </div>
            {formError['accounts'] && (
              <div className="connection__fail">
                <p>{formError['accounts']}</p>
              </div>
            )}
          </div>
        )}

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
        {path[2] === 'edit' ? (
          <div className="form-action">
            <button
              className={
                updateDatasourceLoading
                  ? 'btn black-button btn-loading'
                  : 'btn black-button'
              }
              disabled={
                editedConnectionName === '' &&
                editedTimeZone === '' &&
                Object.keys(editedForm).length === 0
                  ? true
                  : false
              }
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
        <Modal
          portalClassName="datasourcemodal"
          isOpen={showModal}
          shouldCloseOnOverlayClick={false}
          className="datasourcemodal">
          <div className="modal-close">
            <img src={Close} alt="Close" onClick={closeModal} />
          </div>
          <div className="sands-of-time">
            <img src={Sands_Of_Time} alt="Sands_Of_Time" />
          </div>
          <div className="modal-body">
            <div className="modal-contents">
              <h3>Data Source Added Successfully</h3>
              <p>
                Please wait for a few minutes for data sync to complete before
                adding a KPI
              </p>
              <div className="next-step-navigate">
                <button className="btn black-button" onClick={closeModal}>
                  <span>Okay</span>
                </button>
              </div>
            </div>
          </div>
        </Modal>
      </>
    );
  }
};

export default DataSourceForm;
