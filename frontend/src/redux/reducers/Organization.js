import {
  // ONBOARD_ORGANIZATION,
  ONBOARD_ORGANIZATION_REQUEST,
  ONBOARD_ORGANIZATION_SUCCESS,
  ONBOARD_ORGANIZATION_FAILURE
} from '../actions/ActionConstants';

const initialState = {
  organizationData: [],
  isLoading: true,
  error: false
};

export const organization = (state = initialState, action) => {
  switch (action.type) {
    case ONBOARD_ORGANIZATION_SUCCESS: {
      return {
        ...state,
        isLoading: false,
        organizationData: action.data,
        error: false
      };
    }
    case ONBOARD_ORGANIZATION_REQUEST: {
      return {
        ...state,
        isLoading: false,
        error: false
      };
    }
    case ONBOARD_ORGANIZATION_FAILURE: {
      return {
        ...state,
        isLoading: false,
        error: true
      };
    }
    default:
      return state;
  }
};
