import {
  ONBOARDINGREQUEST,
  ONBOARDINGSUCCESS,
  ONBOARDINGFAILURE,
  HOMEKPIVIEWREQUEST,
  HOMEKPIVIEWSUCCESS,
  HOMEKPIVIEWFAILURE
} from '../actions/ActionConstants';

const initialState = {
  onboardingList: [],
  isLoading: true,
  error: '',
  homeKpiData: [],
  homeKpiLoading: true,
  homeKpiError: false
};

export const onboarding = (state = initialState, action) => {
  switch (action.type) {
    case ONBOARDINGREQUEST: {
      return {
        ...state,
        isLoading: true
      };
    }
    case ONBOARDINGSUCCESS: {
      return {
        ...state,
        isLoading: false,
        error: '',
        onboardingList: action.data
      };
    }
    case ONBOARDINGFAILURE: {
      return {
        ...state,
        isLoading: false,
        error: action.data
      };
    }
    case HOMEKPIVIEWREQUEST: {
      return {
        ...state,
        homeKpiLoading: true
      };
    }
    case HOMEKPIVIEWSUCCESS: {
      return {
        ...state,
        homeKpiLoading: false,
        homeKpiData: action.data
      };
    }
    case HOMEKPIVIEWFAILURE: {
      return {
        ...state,
        homeKpiLoading: false,
        homeKpiError: true
      };
    }
    case 'RESET_KPI_HOME_DATA':
      return {
        ...state,
        homeKpiData: [],
        homeKpiLoading: true,
        homeKpiError: false
      };

    default:
      return state;
  }
};
