import {
  DASHBOARDAGGREGATIONREQUEST,
  DASHBOARDAGGREGATIONSUCCESS,
  DASHBOARDAGGREGATIONFAILURE
} from '../actions/ActionConstants';

const initialState = {
  aggregationLoading: true,
  aggregationData: [],
  aggregationError: false
};

export const aggregation = (state = initialState, action) => {
  switch (action.type) {
    case DASHBOARDAGGREGATIONREQUEST: {
      return {
        aggregationLoading: true,
        aggregationError: false
      };
    }
    case DASHBOARDAGGREGATIONSUCCESS: {
      return {
        aggregationLoading: false,
        aggregationData: action.data
      };
    }
    case DASHBOARDAGGREGATIONFAILURE: {
      return {
        aggregationLoading: false,
        aggregationError: true
      };
    }
    case 'RESET_AGGREGATION': {
      return {
        ...initialState
      };
    }
    default:
      return state;
  }
};
