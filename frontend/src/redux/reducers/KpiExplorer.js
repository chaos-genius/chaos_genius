import {
  KPIEXPLORERREQUEST,
  KPIEXPLORERSUCCESS,
  KPIEXPLORERFAILURE,
  KPIEXPLORERFORMREQUEST,
  KPIEXPLORERFORMSUCCESS,
  KPIEXPLORERFORMFAILURE,
  KPIEXPLORERFIELDREQUEST,
  KPIEXPLORERFIELDSUCCESS,
  KPIEXPLORERFIELDFAILURE,
  KPIEXPLORERSUBMITSUCCESS,
  TABLELISTONSCHEMASUCCESS,
  TABLELISTONSCHEMAREQUEST,
  TABLELISTONSCHEMAFAILURE,
  SCHEMAAVAILABILITYSUCCESS,
  SCHEMAAVAILABILITYFAILURE,
  GETALLSCHEMALISTFAILURE,
  SCHEMALISTSUCCESS,
  SCHEMALISTREQUEST,
  TABLEINFODATASUCCESS,
  TABLEINFODATAREQUEST,
  TABLEINFODATAFAILURE,
  KPIEXPLORERSUBMITREQUEST,
  KPIEXPLORERSUBMITFAILURE,
  TESTQUERYSUCCESS,
  TESTQUERYFAILURE,
  TESTQUERYREQUEST,
  KPIDISABLEREQUEST,
  KPIDISABLESUCCESS,
  KPIDISABLEFAILURE,
  KPIFORMEDITREQUEST_META_INFO,
  KPIFORMEDITSUCCESS_META_INFO,
  KPIFORMEDITFAILURE_META_INFO,
  KPIEDITDATAREQUEST,
  KPIEDITDATASUCCESS,
  KPIEDITDATAFAILURE,
  KPIUPDATEREQUEST,
  KPIUPDATESUCCESS,
  KPIUPDATEFAILURE,
  SCHEMAAVAILABILTYREQUEST,
  SUPPORTEDAGGSUCCESS
} from '../actions/ActionConstants';

const initialState = {
  kpiExplorerList: '',
  isLoading: true,
  error: false,
  kpiFormData: [],
  kpiFormLoading: true,
  kpiFormError: false,
  kpiField: [],
  kpiFieldLoading: false,
  dataSourceHasSchema: false,
  schemaNamesList: [],
  kpiFieldError: false,
  schemaAvailabilityLoading: false,
  schemaAvailabilityError: false,
  schemaListLoading: false,
  schemaListError: false,
  tableListOnSchemaLoading: false,
  tableListOnSchema: [],
  tableInfoLoading: false,
  tableInfoData: [],
  kpiSubmit: [],
  kpiSubmitLoading: false,
  kpiSubmitError: false,
  testQueryLoading: true,
  testQueryData: [],
  testQueryError: false,
  kpiDisableLoading: true,
  kpiDisableData: [],
  kpiDisableError: false,
  kpiMetaInfoLoading: false,
  kpiMetaInfoData: [],
  kpiMetaInfoError: false,
  kpiEditDataLoading: false,
  kpiEditData: [],
  kpiEditDataError: false,
  kpiUpdateLoading: false,
  kpiUpdateData: [],
  kpiUpdateError: false,
  supportedAgg: []
};

export const kpiExplorer = (state = initialState, action) => {
  switch (action.type) {
    case KPIEXPLORERREQUEST: {
      return {
        ...state,
        isLoading: true,
        error: false
      };
    }
    case KPIEXPLORERSUCCESS: {
      return {
        ...state,
        isLoading: false,
        kpiExplorerList: action.data,
        error: false
      };
    }
    case KPIEXPLORERFAILURE: {
      return {
        ...state,
        isLoading: false,
        kpiExplorerList: [],
        error: true
      };
    }
    case KPIEXPLORERFORMREQUEST: {
      return {
        ...state,
        kpiFormLoading: true,
        kpiFormError: false
      };
    }
    case KPIEXPLORERFORMSUCCESS: {
      return {
        ...state,
        kpiFormLoading: false,
        kpiFormData: action.data
      };
    }
    case KPIEXPLORERFORMFAILURE: {
      return {
        ...state,
        kpiFormLoading: false,
        kpiFormError: true
      };
    }
    case KPIEXPLORERFIELDREQUEST: {
      return {
        ...state,
        kpiField: [],
        kpiFieldLoading: true,
        kpiFieldError: false
      };
    }
    case KPIEXPLORERFIELDSUCCESS: {
      return {
        ...state,
        kpiFieldLoading: false,
        kpiField: action.data,
        tableListOnSchema: []
      };
    }
    case SCHEMAAVAILABILITYSUCCESS: {
      return {
        ...state,
        schemaAvailabilityLoading: false,
        dataSourceHasSchema: action.data.available.schema
      };
    }
    case TABLEINFODATAREQUEST: {
      return {
        ...state,
        tableInfoData: [],
        tableInfoLoading: true
      };
    }
    case TABLEINFODATASUCCESS: {
      return {
        ...state,
        tableInfoLoading: false,
        tableInfoData: action.data
      };
    }
    case TABLEINFODATAFAILURE: {
      return {
        ...state,
        tableInfoLoading: false
      };
    }
    case TABLELISTONSCHEMAREQUEST: {
      return {
        ...state,
        tableListOnSchema: [],
        tableListOnSchemaLoading: true
      };
    }
    case TABLELISTONSCHEMASUCCESS: {
      return {
        ...state,
        tableListOnSchemaLoading: false,
        tableListOnSchema: action.data
      };
    }
    case TABLELISTONSCHEMAFAILURE: {
      return {
        ...state,
        tableListOnSchemaLoading: false
      };
    }
    case SCHEMALISTSUCCESS: {
      return {
        ...state,
        schemaListLoading: false,
        schemaNamesList: action.data
      };
    }
    case SCHEMALISTREQUEST: {
      return {
        ...state,
        kpiField: [],
        tableListOnSchema: [],
        schemaListLoading: true
      };
    }
    case KPIEXPLORERFIELDFAILURE: {
      return { ...state, kpiFieldLoading: false, kpiFieldError: true };
    }
    case SCHEMAAVAILABILTYREQUEST: {
      return {
        ...state,
        schemaNamesList: [],
        tableListOnSchema: [],
        dataSourceHasSchema: false,
        schemaAvailabilityLoading: true,
        schemaAvailabilityError: false
      };
    }
    case SCHEMAAVAILABILITYFAILURE: {
      return {
        ...state,
        schemaAvailabilityLoading: false,
        schemaAvailabilityError: true
      };
    }
    case GETALLSCHEMALISTFAILURE: {
      return {
        ...state,
        schemaListLoading: false,
        schemaListError: true
      };
    }
    case KPIEXPLORERSUBMITREQUEST: {
      return { ...state, kpiSubmitLoading: true, kpiSubmitError: false };
    }
    case KPIEXPLORERSUBMITSUCCESS: {
      return { ...state, kpiSubmitLoading: false, kpiSubmit: action.data };
    }
    case KPIEXPLORERSUBMITFAILURE: {
      return { ...state, kpiSubmitLoading: false, kpiSubmitError: true };
    }
    case TESTQUERYREQUEST: {
      return { ...state, testQueryLoading: true, testQueryError: false };
    }
    case TESTQUERYSUCCESS: {
      return { ...state, testQueryLoading: false, testQueryData: action.data };
    }
    case TESTQUERYFAILURE: {
      return { ...state, testQueryError: true, testQueryLoading: false };
    }
    case KPIDISABLEREQUEST: {
      return { ...state, kpiDisableLoading: true, kpiDisableError: false };
    }
    case KPIDISABLESUCCESS: {
      return {
        ...state,
        kpiDisableLoading: false,
        kpiDisableData: action.data
      };
    }
    case KPIDISABLEFAILURE: {
      return { ...state, kpiDisableLoading: false, kpiDisableFailure: true };
    }
    case KPIFORMEDITREQUEST_META_INFO: {
      return {
        ...state,
        dataSourceHasSchema: false,
        kpiMetaInfoLoading: true
      };
    }
    case KPIFORMEDITSUCCESS_META_INFO: {
      return {
        ...state,
        kpiMetaInfoLoading: false,
        kpiMetaInfoData: action.data
      };
    }
    case KPIFORMEDITFAILURE_META_INFO: {
      return {
        ...state,
        kpiMetaInfoLoading: false,
        kpiMetaInfoError: true
      };
    }
    case KPIEDITDATAREQUEST: {
      return {
        ...state,
        kpiEditDataLoading: true,
        kpiEditDataError: false
      };
    }
    case KPIEDITDATASUCCESS: {
      return {
        ...state,
        kpiEditDataLoading: false,
        kpiEditData: action.data
      };
    }
    case KPIEDITDATAFAILURE: {
      return {
        ...state,
        kpiEditDataLoading: false,
        kpiEditDataError: true
      };
    }
    case KPIUPDATEREQUEST: {
      return {
        ...state,
        kpiUpdateLoading: true,
        kpiUpdateError: false
      };
    }
    case KPIUPDATESUCCESS: {
      return {
        ...state,
        kpiUpdateData: action.data,
        kpiUpdateLoading: false
      };
    }
    case KPIUPDATEFAILURE: {
      return {
        ...state,
        kpiUpdateLoading: false,
        kpiUpdateError: true
      };
    }
    case SUPPORTEDAGGSUCCESS: {
      return {
        ...state,
        supportedAgg: action.data
      };
    }
    case 'KPI_RESET': {
      return {
        kpiSubmit: [],
        kpiUpdateData: []
      };
    }
    case 'DASHBOARD_KPILIST_RESET': {
      return {
        ...state,
        kpiSubmit: [],
        kpiUpdateData: []
      };
    }
    case 'EVENT_ALERT_QUERY_RESET': {
      return {
        ...state,
        testQueryData: []
      };
    }
    default:
      return state;
  }
};
