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
        isLoading: true,
        error: false
      };
    }
    case KPIEXPLORERSUCCESS: {
      return {
        isLoading: false,
        kpiExplorerList: action.data,
        error: false
      };
    }
    case KPIEXPLORERFAILURE: {
      return {
        isLoading: false,
        kpiExplorerList: [],
        error: true
      };
    }
    case KPIEXPLORERFORMREQUEST: {
      return {
        kpiFormLoading: true,
        kpiFormError: false
      };
    }
    case KPIEXPLORERFORMSUCCESS: {
      return {
        kpiFormLoading: false,
        kpiFormData: action.data
      };
    }
    case KPIEXPLORERFORMFAILURE: {
      return {
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
      return {
        kpiFieldLoading: false,
        kpiField: action.data
      };
    }
    case KPIEXPLORERFIELDFAILURE: {
      return {
        kpiFieldLoading: false,
        kpiFieldError: true
      };
    }
    case KPIEXPLORERSUBMITREQUEST: {
      return {
        kpiSubmitLoading: true,
        kpiSubmitError: false
      };
    }
    case KPIEXPLORERSUBMITSUCCESS: {
      return {
        kpiSubmitLoading: false,
        kpiSubmit: action.data
      };
    }
    case KPIEXPLORERSUBMITFAILURE: {
      return {
        kpiSubmitLoading: false,
        kpiSubmitError: true
      };
    }
    case TESTQUERYREQUEST: {
      return {
        testQueryLoading: true,
        testQueryError: false
      };
    }
    case TESTQUERYSUCCESS: {
      return {
        testQueryLoading: false,
        testQueryData: action.data
      };
    }
    case TESTQUERYFAILURE: {
      return {
        testQueryError: true,
        testQueryLoading: false
      };
    }
    case KPIDISABLEREQUEST: {
      return {
        kpiDisableLoading: true,
        kpiDisableError: false
      };
    }
    case KPIDISABLESUCCESS: {
      return {
        kpiDisableLoading: false,
        kpiDisableData: action.data
      };
    }
    case KPIDISABLEFAILURE: {
      return {
        kpiDisableLoading: false,
        kpiDisableFailure: true
      };
    }
    default:
      return state;
  }
};
