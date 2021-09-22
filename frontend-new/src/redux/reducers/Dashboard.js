import {
  DASHBOARDAGGREGATIONREQUEST,
  DASHBOARDAGGREGATIONSUCCESS,
  DASHBOARDAGGREGATIONFAILURE,
  DASHBOARDRCAANALYSISFAILURE,
  DASHBOARDRCAANALYSISREQUEST,
  DASHBOARDRCAANALYSISSUCCESS,
  DASHBOARDDIMENSIONREQUEST,
  DASHBOARDDIMENSIONSUCCESS,
  DASHBOARDDIMENSIONFAILURE
} from '../actions/ActionConstants';

const initialState = {
  aggregationLoading: true,
  aggregationData: [],
  aggregationError: false,
  linechartData: [],
  linechartLoading: true,
  linechartError: false,
  rcaAnalysisData: [],
  rcaAnalysisLoading: true,
  rcaAnalysisError: false,
  dimensionLoading: false,
  dimensionData: [],
  dimensionError: false
};

export const dashboard = (state = initialState, action) => {
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

    case DASHBOARDRCAANALYSISREQUEST: {
      return {
        rcaAnalysisLoading: true,
        rcaAnalysisError: false
      };
    }
    case DASHBOARDRCAANALYSISSUCCESS: {
      return {
        rcaAnalysisLoading: false,
        rcaAnalysisData: action.data
      };
    }
    case DASHBOARDRCAANALYSISFAILURE: {
      return {
        rcaAnalysisLoading: false,
        rcaAnalysisError: true
      };
    }
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
    default:
      return state;
  }
};
