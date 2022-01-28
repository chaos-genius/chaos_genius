import {
  DASHBOARDDIMENSIONREQUEST,
  DASHBOARDDIMENSIONSUCCESS,
  DASHBOARDDIMENSIONFAILURE
} from '../actions/ActionConstants';

const initialState = {
  dimensionLoading: true,
  dimensionData: [],
  dimensionError: false
};

export const dimension = (state = initialState, action) => {
  switch (action.type) {
    case DASHBOARDDIMENSIONREQUEST: {
      return {
        dimensionLoading: true,
        dimensionError: false
      };
    }
    case DASHBOARDDIMENSIONSUCCESS: {
      return {
        dimensionLoading: false,
        dimensionData: action.data
      };
    }
    case DASHBOARDDIMENSIONFAILURE: {
      return {
        dimensionError: true,
        dimensionLoading: false
      };
    }
    case 'RESET_DATA': {
      return {
        ...initialState
      };
    }
    default:
      return state;
  }
};
