import {
  DASHBOARD_CONFIG_REQUEST,
  DASHBOARD_CONFIG_SUCCESS,
  DASHBOARD_CONFIG_FAILURE
} from '../actions/ActionConstants';

const initialState = {
  configData: [],
  configLoading: false,
  configError: false
};

export const config = (state = initialState, action) => {
  switch (action.type) {
    case DASHBOARD_CONFIG_REQUEST: {
      return {
        ...state,
        configLoading: true
      };
    }
    case DASHBOARD_CONFIG_SUCCESS: {
      return {
        ...state,
        configData: action.data,
        configLoading: false
      };
    }
    case DASHBOARD_CONFIG_FAILURE: {
      return {
        ...state,
        configLoading: false,
        configError: true
      };
    }
    case 'RESET_CONFIG': {
      return {
        ...initialState
      };
    }
    default:
      return state;
  }
};
