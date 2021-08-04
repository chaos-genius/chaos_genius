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
        hierarchicalLoading: true,
        hierarchicalError: false
      };
    }
    case DASHBOARDHIERARCHICALSUCCESS: {
      return {
        hierarchicalLoading: false,
        hierarchicalData: action.data
      };
    }
    case DASHBOARDHIERARCHICALFAILURE: {
      return {
        hierarchicalError: true,
        hierarchicalLoading: false
      };
    }
    default:
      return state;
  }
};
