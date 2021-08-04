import {
  DATASOURCEREQUEST,
  DATASOURCESUCCESS,
  DATASOURCEFAILURE,
  CONNECTIONTYPEREQUEST,
  CONNECTIONTYPESUCCESS,
  CONNECTIONTYPEFAILURE,
  TESTCONNECTIONREQUEST,
  TESTCONNECTIONSUCCESS,
  TESTCONNECTIONFAILURE,
  CREATEDATASOURCEREQUEST,
  CREATEDATASOURCESUCCESS,
  CREATEDATASOURCEFAILURE,
  DELETEDATASOURCEREQUEST,
  DELETEDATASOURCESUCSESS,
  DELETEDATASOURCEFAILURE
} from '../actions/ActionConstants';

const initialState = {
  dataSourcesList: [],
  connectionType: [],
  testConnectionResponse: [],
  createDatasourceResponse: [],
  deleteDataSourceResponse: [],
  isLoading: true,
  testLoading: true,
  error: false
};

export const dataSource = (state = initialState, action) => {
  switch (action.type) {
    case DATASOURCEREQUEST: {
      return {
        isLoading: true,
        error: false
      };
    }
    case DATASOURCESUCCESS: {
      return {
        isLoading: false,
        dataSourcesList: action.data,
        error: false
      };
    }
    case DATASOURCEFAILURE: {
      return {
        isLoading: false,
        dataSourcesList: [],
        error: true
      };
    }
    case CONNECTIONTYPEREQUEST: {
      return {
        isLoading: true,
        error: false
      };
    }
    case CONNECTIONTYPESUCCESS: {
      return {
        isLoading: false,
        connectionType: action.data
      };
    }
    case CONNECTIONTYPEFAILURE: {
      return {
        isLoading: false,
        error: true
      };
    }
    case TESTCONNECTIONREQUEST: {
      return {
        testLoading: true,
        error: false
      };
    }
    case TESTCONNECTIONSUCCESS: {
      return {
        testLoading: false,
        testConnectionResponse: action.data
      };
    }
    case TESTCONNECTIONFAILURE: {
      return {
        testLoading: false,
        error: true
      };
    }
    case CREATEDATASOURCEREQUEST: {
      return {
        isLoading: true,
        error: false
      };
    }
    case CREATEDATASOURCESUCCESS: {
      return {
        isLoading: false,
        createDatasourceResponse: action.data
      };
    }
    case CREATEDATASOURCEFAILURE: {
      return {
        isLoading: false,
        error: true
      };
    }
    case DELETEDATASOURCEREQUEST: {
      return {
        isLoading: true,
        error: false
      };
    }
    case DELETEDATASOURCESUCSESS: {
      return {
        isLoading: false,
        deleteDataSourceResponse: action.data
      };
    }
    case DELETEDATASOURCEFAILURE: {
      return {
        isLoading: false,
        error: true
      };
    }
    default:
      return state;
  }
};
