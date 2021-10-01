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
  KPIUPDATEFAILURE
} from '../actions/ActionConstants';

const initialState = {
  kpiExplorerList: '',
  isLoading: true,
  error: false,
  kpiFormData: [],
  kpiFormLoading: true,
  kpiFormError: false,
  kpiField: [],
  kpiFieldLoading: true,
  kpiFieldError: false,
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
  kpiUpdateError: false
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
        kpiFieldLoading: true,
        kpiFieldError: false
      };
    }
    case KPIEXPLORERFIELDSUCCESS: {
      return { ...state, kpiFieldLoading: false, kpiField: action.data };
    }
    case KPIEXPLORERFIELDFAILURE: {
      return { ...state, kpiFieldLoading: false, kpiFieldError: true };
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
    case 'KPI_RESET': {
      return {
        kpiSubmit: [],
        kpiUpdateData: []
      };
    }
    default:
      return state;
  }
};
