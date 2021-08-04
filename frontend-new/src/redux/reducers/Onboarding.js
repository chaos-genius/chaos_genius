import {
  ONBOARDINGREQUEST,
  ONBOARDINGSUCCESS,
  ONBOARDINGFAILURE
} from '../actions/ActionConstants';

const initialState = {
  onboardingList: [],
  isLoading: true,
  error: false
};

export const onboarding = (state = initialState, action) => {
  switch (action.type) {
    case ONBOARDINGREQUEST: {
      return {
        isLoading: true,
        error: false
      };
    }
    case ONBOARDINGSUCCESS: {
      return {
        isLoading: false,
        onboardingList: action.data,
        error: false
      };
    }
    case ONBOARDINGFAILURE: {
      return {
        isLoading: false,
        onboardingList: [],
        error: true
      };
    }
    default:
      return state;
  }
};
