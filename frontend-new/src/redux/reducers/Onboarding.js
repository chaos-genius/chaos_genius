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
  error: false,
  homeKpiData: '',
  homeKpiLoading: false,
  homeKpiError: false
};

export const onboarding = (state = initialState, action) => {
  switch (action.type) {
    case ONBOARDINGREQUEST: {
      return {
        ...state,
        isLoading: true,
        error: false
      };
    }
    case ONBOARDINGSUCCESS: {
      return {
        ...state,
        isLoading: false,
        onboardingList: action.data,
        error: false
      };
    }
    case ONBOARDINGFAILURE: {
      return {
        ...state,
        isLoading: false,
        error: true
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
        homeKpiData: [],
        homeKpiError: true
      };
    }
    default:
      return state;
  }
};
