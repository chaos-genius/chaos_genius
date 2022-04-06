import {
  DATASOURCEREQUEST,
  DATASOURCESUCCESS,
  DATASOURCEFAILURE,
  CONNECTIONTYPESUCCESS,
  CONNECTIONTYPEREQUEST,
  CONNECTIONTYPEFAILURE,
  TESTCONNECTIONFAILURE,
  TESTCONNECTIONSUCCESS,
  TESTCONNECTIONREQUEST,
  CREATEDATASOURCESUCCESS,
  CREATEDATASOURCEREQUEST,
  CREATEDATASOURCEFAILURE,
  DELETEDATASOURCEREQUEST,
  DELETEDATASOURCESUCSESS,
  DELETEDATASOURCEFAILURE,
  DATASOURCE_META_INFO_REQUEST,
  DATASOURCE_META_INFO_SUCCESS,
  DATASOURCE_META_INFO_FAILURE,
  DATASOURCEEDITDATAFAILURE,
  DATASOURCEEDITDATASUCCESS,
  DATASOURCEEDITDATAREQUEST,
  DATASOURCEUPDATEREQUEST,
  DATASOURCEUPDATESUCCESS,
  DATASOURCEUPDATEFAILURE,
  SYNCSCHEMAREQUESTED,
  SYNCSCHEMAFAILURE,
  SYNCSCHEMASUCCESS,
  TIMEZONESREQUEST,
  TIMEZONESFAILURE,
  TIMEZONESSUCCESS
} from './ActionConstants';

import {
  CONNECTION_TYPE,
  CONNECTION_URL,
  CREATE_DATASOURCE,
  DATASOURCE_META_INFO_URL,
  DELETE_DATASOURCE,
  METADATA_PREFETCH_URL,
  TEST_CONNECTION,
  TIMEZONE_URL
} from '../../utils/url-helper';

import { getRequest, postRequest } from '../../utils/http-helper';

export const getAllDataSourceRequested = () => {
  return {
    type: DATASOURCEREQUEST
  };
};

export const getAllDataSourceSuccess = (response) => {
  return {
    type: DATASOURCESUCCESS,
    data: response
  };
};

export const getAllDataSourceFailure = () => {
  return {
    type: DATASOURCEFAILURE
  };
};

export const getAllDataSources = () => {
  return async (dispatch) => {
    dispatch(getAllDataSourceRequested());
    const { data, error, status } = await getRequest({
      url: CONNECTION_URL
    });
    if (error) {
      dispatch(getAllDataSourceFailure());
    } else if (data && status === 200) {
      dispatch(getAllDataSourceSuccess(data.data));
    }
  };
};

export const getConnectionTypeRequested = () => {
  return {
    type: CONNECTIONTYPEREQUEST
  };
};

export const getConnectionTypeSuccess = (response) => {
  return {
    type: CONNECTIONTYPESUCCESS,
    data: response
  };
};

export const getConnectionTypeFailure = () => {
  return {
    type: CONNECTIONTYPEFAILURE
  };
};

export const getConnectionType = () => {
  return async (dispatch) => {
    dispatch(getConnectionTypeRequested());
    const { data, error, status } = await getRequest({
      url: CONNECTION_TYPE
    });
    if (error) {
      dispatch(getConnectionTypeFailure());
    } else if (data && status === 200) {
      dispatch(getConnectionTypeSuccess(data.data));
    }
  };
};

export const testConnectionRequested = () => {
  return {
    type: TESTCONNECTIONREQUEST
  };
};

export const testConnectionSuccess = (response) => {
  return {
    type: TESTCONNECTIONSUCCESS,
    data: response
  };
};

export const testConnectionFailure = () => {
  return {
    type: TESTCONNECTIONFAILURE
  };
};

export const testDatasourceConnection = (formData) => {
  return async (dispatch) => {
    dispatch(testConnectionRequested());
    const { data, error, status } = await postRequest({
      url: TEST_CONNECTION,
      data: formData
    });
    if (error) {
      dispatch(testConnectionFailure());
    } else if (data && status === 200) {
      dispatch(testConnectionSuccess(data.data));
    }
  };
};

export const createDatasourceRequested = () => {
  return {
    type: CREATEDATASOURCEREQUEST
  };
};

export const createDatasourceSuccess = (response) => {
  return {
    type: CREATEDATASOURCESUCCESS,
    data: response
  };
};

export const createDatesourceFailure = () => {
  return {
    type: CREATEDATASOURCEFAILURE
  };
};

export const createDataSource = (formData) => {
  return async (dispatch) => {
    dispatch(createDatasourceRequested());
    const { data, error, status } = await postRequest({
      url: CREATE_DATASOURCE,
      data: formData
    });
    if (error) {
      dispatch(createDatesourceFailure());
    } else if (data && status === 200) {
      dispatch(createDatasourceSuccess(data));
    }
  };
};

export const deleteDatasourceRequested = () => {
  return {
    type: DELETEDATASOURCEREQUEST
  };
};

export const deleteDatasourceSuccess = (response) => {
  return {
    type: DELETEDATASOURCESUCSESS,
    data: response
  };
};

export const deleteDatesourceFailure = () => {
  return {
    type: DELETEDATASOURCEFAILURE
  };
};

export const syncSchemaRequested = () => {
  return {
    type: SYNCSCHEMAREQUESTED
  };
};

export const syncSchemaFailure = () => {
  return {
    type: SYNCSCHEMAFAILURE
  };
};

export const syncSchemaSuccess = (response) => {
  return {
    type: SYNCSCHEMASUCCESS,
    data: response
  };
};

export const deleteDatasource = (id) => {
  return async (dispatch) => {
    dispatch(deleteDatasourceRequested());
    const { data, error, status } = await postRequest({
      url: DELETE_DATASOURCE,
      data: id
    });
    if (error) {
      dispatch(deleteDatesourceFailure());
    } else if (data && status === 200) {
      dispatch(deleteDatasourceSuccess(data));
    }
  };
};

export const setSyncSchema = (datasource) => {
  return async (dispatch) => {
    dispatch(syncSchemaRequested());
    const { data, error, status } = await postRequest({
      url: METADATA_PREFETCH_URL,
      data: { data_source_id: datasource?.id }
    });
    if (error) {
      dispatch(syncSchemaFailure());
    } else if (data && status === 200) {
      dispatch(syncSchemaSuccess({ ...data, data_source_id: datasource?.id }));
    }
  };
};

export const getDatasourceMetaInfoRequest = () => {
  return {
    type: DATASOURCE_META_INFO_REQUEST
  };
};
export const getDatasourceMetaInfoSuccess = (response) => {
  return {
    type: DATASOURCE_META_INFO_SUCCESS,
    data: response
  };
};

export const getDatasourceMetaInfoFailure = () => {
  return {
    type: DATASOURCE_META_INFO_FAILURE
  };
};

export const getDatasourceMetaInfo = () => {
  return async (dispatch) => {
    dispatch(getDatasourceMetaInfoRequest());
    const { data, error, status } = await getRequest({
      url: DATASOURCE_META_INFO_URL
    });
    if (error) {
      dispatch(getDatasourceMetaInfoFailure());
    } else if (data && status === 200) {
      dispatch(getDatasourceMetaInfoSuccess(data.data));
    }
  };
};

export const getTimeZonesRequest = () => {
  return {
    type: TIMEZONESREQUEST
  };
};

export const getTimeZonesFailure = () => {
  return {
    type: TIMEZONESFAILURE
  };
};

export const getTimeZonesSuccess = (response) => {
  return {
    type: TIMEZONESSUCCESS,
    data: response
  };
};

export const getTimeZones = () => {
  return async (dispatch) => {
    dispatch(getTimeZonesRequest());
    const { data, error, status } = await getRequest({
      url: TIMEZONE_URL
    });
    if (error) {
      dispatch(getTimeZonesFailure());
    } else if (data && status === 200) {
      dispatch(getTimeZonesSuccess(data));
    }
  };
};

export const getDatasourceByIdRequest = () => {
  return {
    type: DATASOURCEEDITDATAREQUEST
  };
};
export const getDatasourceByIdSuccess = (response) => {
  return {
    type: DATASOURCEEDITDATASUCCESS,
    data: response
  };
};

export const getDatasourceByIdFailure = () => {
  return {
    type: DATASOURCEEDITDATAFAILURE
  };
};

export const getDatasourceById = (id) => {
  return async (dispatch) => {
    dispatch(getDatasourceByIdRequest());
    const { data, error, status } = await getRequest({
      url: `${CONNECTION_URL}/${id}`
    });
    if (error) {
      dispatch(getDatasourceByIdFailure());
    } else if (data && status === 200) {
      dispatch(getDatasourceByIdSuccess(data.data));
    }
  };
};

export const updateDatasourceByIdRequest = () => {
  return {
    type: DATASOURCEUPDATEREQUEST
  };
};
export const updateDatasourceByIdSuccess = (response) => {
  return {
    type: DATASOURCEUPDATESUCCESS,
    data: response
  };
};

export const updateDatasourceByIdFailure = () => {
  return {
    type: DATASOURCEUPDATEFAILURE
  };
};

export const updateDatasourceById = (id, updateData) => {
  return async (dispatch) => {
    dispatch(updateDatasourceByIdRequest());
    const { data, error, status } = await postRequest({
      url: `${CONNECTION_URL}/${id}/test-and-update`,
      data: JSON.stringify(updateData),
      headers: {
        'Content-Type': 'application/json;charset=UTF-8'
      },
      noAuth: true
    });
    if (error) {
      dispatch(updateDatasourceByIdFailure());
    } else if (data && status === 200) {
      dispatch(updateDatasourceByIdSuccess(data));
    }
  };
};
