import {
  DASHBOARDAGGREGATIONREQUEST,
  DASHBOARDAGGREGATIONSUCCESS,
  DASHBOARDAGGREGATIONFAILURE,
  DASHBOARDLINECHARTFAILURE,
  DASHBOARDLINECHARTREQUEST,
  DASHBOARDLINECHARTSUCCESS,
  DASHBOARDRCAANALYSISFAILURE,
  DASHBOARDRCAANALYSISREQUEST,
  DASHBOARDRCAANALYSISSUCCESS,
  DASHBOARDSIDEBARFAILURE,
  DASHBOARDSIDEBARREQUEST,
  DASHBOARDSIDEBARSUCCESS,
  DASHBOARDDIMENSIONREQUEST,
  DASHBOARDDIMENSIONSUCCESS,
  DASHBOARDDIMENSIONFAILURE
} from '../actions/ActionConstants';

const initialState = {
  sidebarLoading: true,
  sidebarError: false,
  sidebarList: [],
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
    case DASHBOARDSIDEBARREQUEST: {
      return {
        sidebarLoading: true,
        sidebarError: false
      };
    }

    case DASHBOARDSIDEBARSUCCESS: {
      return {
        sidebarLoading: false,
        sidebarList: action.data
      };
    }
    case DASHBOARDSIDEBARFAILURE: {
      return {
        sidebarLoading: false,
        sidebarError: true
      };
    }
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
