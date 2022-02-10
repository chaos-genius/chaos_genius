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
        hierarchialLoading: true,
        hierarchicalError: false
      };
    }
    case DASHBOARDHIERARCHICALSUCCESS: {
      return {
        hierarchialLoading: false,
        hierarchicalData: action.data
      };
    }
    case DASHBOARDHIERARCHICALFAILURE: {
      return {
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
