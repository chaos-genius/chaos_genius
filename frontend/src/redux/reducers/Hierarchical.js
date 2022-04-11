import {
  DASHBOARDHIERARCHICALREQUEST,
  DASHBOARDHIERARCHICALFAILURE,
  DASHBOARDHIERARCHICALSUCCESS
} from '../actions/ActionConstants';

const initialState = {
  hierarchialLoading: true,
  hierarchialData: [],
  hierarchialError: false
};

export const hierarchial = (state = initialState, action) => {
  switch (action.type) {
    case DASHBOARDHIERARCHICALREQUEST: {
      return {
        ...state,
        hierarchialLoading: true,
        hierarchicalError: false
      };
    }
    case DASHBOARDHIERARCHICALSUCCESS: {
      return {
        ...state,
        hierarchialLoading: false,
        hierarchicalData: action.data
      };
    }
    case DASHBOARDHIERARCHICALFAILURE: {
      return {
        ...state,
        hierarchicalError: true,
        hierarchialLoading: false
      };
    }
    case 'RESET_HIERARCHIAL_DATA': {
      return {
        ...initialState
      };
    }
    default:
      return state;
  }
};
