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
  DELETEDATASOURCEFAILURE
} from './ActionConstants';

import {
  CONNECTION_TYPE,
  CONNECTION_URL,
  CREATE_DATASOURCE,
  DELETE_DATASOURCE,
  TEST_CONNECTION
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
    dispatch(getAllDataSourceRequested);
    const { data, error, status } = await getRequest({
      url: CONNECTION_URL
    });
    if (error) {
      dispatch(getAllDataSourceFailure);
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
    dispatch(getConnectionTypeRequested);
    const { data, error, status } = await getRequest({
      url: CONNECTION_TYPE
    });
    if (error) {
      dispatch(getConnectionTypeFailure);
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

export const deleteDatasource = (id) => {
  return async (dispatch) => {
    dispatch(deleteDatasourceRequested);
    const { data, error, status } = await postRequest({
      url: DELETE_DATASOURCE,
      data: id
    });
    if (error) {
      dispatch(deleteDatesourceFailure);
    } else if (data && status === 200) {
      dispatch(deleteDatasourceSuccess(data.data));
    }
  };
};
