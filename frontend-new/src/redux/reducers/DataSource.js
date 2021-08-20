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
  isLoading: false,
  testLoading: false,
  error: false
};

export const dataSource = (state = initialState, action) => {
  switch (action.type) {
    case DATASOURCEREQUEST: {
      return {
        ...state,
        isLoading: true,
        error: false
      };
    }
    case DATASOURCESUCCESS: {
      return {
        ...state,
        isLoading: false,
        dataSourcesList: action.data,
        error: false
      };
    }
    case DATASOURCEFAILURE: {
      return {
        ...state,
        isLoading: false,
        dataSourcesList: [],
        error: true
      };
    }
    case CONNECTIONTYPEREQUEST: {
      return {
        ...state,

        error: false
      };
    }
    case CONNECTIONTYPESUCCESS: {
      return {
        ...state,
        connectionType: action.data
      };
    }
    case CONNECTIONTYPEFAILURE: {
      return {
        ...state,
        error: true
      };
    }
    case TESTCONNECTIONREQUEST: {
      return {
        ...state,
        testLoading: true,
        error: false
      };
    }
    case TESTCONNECTIONSUCCESS: {
      return {
        ...state,
        testLoading: false,
        testConnectionResponse: action.data
      };
    }
    case TESTCONNECTIONFAILURE: {
      return {
        ...state,
        testLoading: false,
        error: true
      };
    }
    case CREATEDATASOURCEREQUEST: {
      return {
        error: false
      };
    }
    case CREATEDATASOURCESUCCESS: {
      return {
        ...state,

        createDatasourceResponse: action.data
      };
    }
    case CREATEDATASOURCEFAILURE: {
      return {
        ...state,

        error: true
      };
    }
    case DELETEDATASOURCEREQUEST: {
      return {
        error: false
      };
    }
    case DELETEDATASOURCESUCSESS: {
      return {
        ...state,
        deleteDataSourceResponse: action.data
      };
    }
    case DELETEDATASOURCEFAILURE: {
      return {
        ...state,
        error: true
      };
    }
    default:
      return state;
  }
};
