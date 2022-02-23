import {
  DASHBOARDLINECHARTFAILURE,
  DASHBOARDLINECHARTREQUEST,
  DASHBOARDLINECHARTSUCCESS
} from '../actions/ActionConstants';

const initialState = {
  linechartData: [],
  linechartLoading: true,
  linechartError: false
};

export const lineChart = (state = initialState, action) => {
  switch (action.type) {
    case DASHBOARDLINECHARTREQUEST: {
      return {
        linechartLoading: true,
        linechartError: false
      };
    }
    case DASHBOARDLINECHARTSUCCESS: {
      return { linechartLoading: false, linechartData: action.data };
    }
    case DASHBOARDLINECHARTFAILURE: {
      return {
        linechartLoading: false,
        linechartError: true
      };
    }
    case 'RESET_LINECHART': {
      return {
        ...initialState
      };
    }
    default:
      return state;
  }
};
