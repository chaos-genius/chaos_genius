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
  KPIDISABLEFAILURE
} from '../actions/ActionConstants';

const initialState = {
  kpiExplorerList: [],
  isLoading: true,
  error: false,
  kpiFormData: [],
  kpiFormLoading: true,
  kpiFormError: false,
  kpiField: [],
  kpiFieldLoading: true,
  kpiFieldError: false,
  kpiSubmit: [],
  kpiSubmitLoading: true,
  kpiSubmitError: false,
  testQueryLoading: true,
  testQueryData: [],
  testQueryError: false,
  kpiDisableLoading: true,
  kpiDisableData: [],
  kpiDisableError: false
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
    default:
      return state;
  }
};
