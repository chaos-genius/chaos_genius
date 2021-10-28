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
  DELETEDATASOURCEFAILURE,
  DATASOURCE_META_INFO_REQUEST,
  DATASOURCE_META_INFO_SUCCESS,
  DATASOURCE_META_INFO_FAILURE,
  DATASOURCEEDITDATAREQUEST,
  DATASOURCEEDITDATASUCCESS,
  DATASOURCEEDITDATAFAILURE,
  DATASOURCEUPDATEREQUEST,
  DATASOURCEUPDATESUCCESS,
  DATASOURCEUPDATEFAILURE
} from '../actions/ActionConstants';

const initialState = {
  dataSourcesList: '',
  connectionType: [],
  connectionTypeLoading: false,
  testConnectionResponse: [],
  createDatasourceLoading: false,
  createDatasourceResponse: [],
  createDatasourceError: false,
  deleteDataSourceResponse: [],
  isLoading: true,
  testLoading: false,
  error: false,
  metaInfoLoading: false,
  metaInfoData: [],
  metaInfoError: false,
  datasourceData: [],
  datasourceLoading: false,
  datasourceError: false,
  updateDatasource: [],
  updateDatasourceLoading: false,
  updateDatasourceError: false
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
        connectionTypeLoading: true,
        error: false
      };
    }
    case CONNECTIONTYPESUCCESS: {
      return {
        ...state,
        connectionTypeLoading: false,
        connectionType: action.data
      };
    }
    case CONNECTIONTYPEFAILURE: {
      return {
        ...state,
        connectionTypeLoading: false,
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
        ...state,
        createDatasourceLoading: true
      };
    }
    case CREATEDATASOURCESUCCESS: {
      return {
        ...state,
        createDatasourceLoading: false,
        createDatasourceResponse: action.data
      };
    }
    case CREATEDATASOURCEFAILURE: {
      return {
        ...state,
        createDatasourceLoading: false,
        createDatasourceError: true
      };
    }
    case DELETEDATASOURCEREQUEST: {
      return {
        ...state,
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
    case DATASOURCE_META_INFO_REQUEST: {
      return {
        ...state,
        metaInfoLoading: true
      };
    }
    case DATASOURCE_META_INFO_SUCCESS: {
      return {
        ...state,
        metaInfoLoading: false,
        metaInfoData: action.data
      };
    }
    case DATASOURCE_META_INFO_FAILURE: {
      return {
        ...state,
        metaInfoLoading: false,
        metaInfoError: true
      };
    }
    case DATASOURCEEDITDATAREQUEST: {
      return {
        ...state,
        datasourceLoading: true
      };
    }
    case DATASOURCEEDITDATASUCCESS: {
      return {
        ...state,
        datasourceData: action.data,
        datasourceLoading: false
      };
    }
    case DATASOURCEEDITDATAFAILURE: {
      return {
        ...state,
        datasourceLoading: false,
        datasourceError: true
      };
    }
    case DATASOURCEUPDATEREQUEST: {
      return {
        ...state,
        updateDatasourceLoading: true
      };
    }
    case DATASOURCEUPDATESUCCESS: {
      return {
        ...state,
        updateDatasource: action.data,
        updateDatasourceLoading: false
      };
    }
    case DATASOURCEUPDATEFAILURE: {
      return {
        ...state,
        updateDatasourceLoading: false,
        updateDatasourceError: true
      };
    }
    case 'CREATE_RESPONSE_RESET': {
      return {
        createDatasourceResponse: [],
        testConnectionResponse: [],
        deleteDataSourceResponse: [],
        updateDatasource: [],
        datasourceData: []
      };
    }
    default:
      return state;
  }
};
