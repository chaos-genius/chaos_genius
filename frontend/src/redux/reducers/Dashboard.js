import {
  DASHBOARDRCAANALYSISFAILURE,
  DASHBOARDRCAANALYSISREQUEST,
  DASHBOARDRCAANALYSISSUCCESS,
  GRAPHDOWNLOADFAILURE,
  GRAPHDOWNLOADREQUEST,
  GRAPHDOWNLOADSUCCESS,
  RCADOWNLOADFAILURE,
  RCADOWNLOADREQUEST,
  RCADOWNLOADSUCCESS
} from '../actions/ActionConstants';

const initialState = {
  rcaAnalysisData: [],
  rcaAnalysisLoading: true,
  rcaAnalysisError: false,
  rcaCsv: [],
  rcaCsvLoading: false,
  rcaCsvError: false,
  graphCsv: [],
  graphCsvLoading: false,
  graphCsvError: false
};

export const dashboard = (state = initialState, action) => {
  switch (action.type) {
    case DASHBOARDRCAANALYSISREQUEST: {
      return {
        ...state,
        rcaAnalysisLoading: true,
        rcaAnalysisError: false
      };
    }
    case DASHBOARDRCAANALYSISSUCCESS: {
      return {
        ...state,
        rcaAnalysisLoading: false,
        rcaAnalysisData: action.data
      };
    }
    case DASHBOARDRCAANALYSISFAILURE: {
      return {
        ...state,
        rcaAnalysisLoading: false,
        rcaAnalysisError: true
      };
    }
    case RCADOWNLOADREQUEST: {
      return {
        ...state,
        rcaCsvLoading: true
      };
    }
    case RCADOWNLOADSUCCESS: {
      return {
        ...state,
        rcaCsv: action.data,
        rcaCsvLoading: false
      };
    }
    case RCADOWNLOADFAILURE: {
      return {
        ...state,
        rcaCsvError: true,
        rcaCsvLoading: false
      };
    }
    case GRAPHDOWNLOADREQUEST: {
      return {
        ...state,
        graphCsvLoading: true
      };
    }
    case GRAPHDOWNLOADSUCCESS: {
      return {
        ...state,
        graphCsvLoading: false,
        graphCsv: action.data
      };
    }
    case GRAPHDOWNLOADFAILURE: {
      return {
        ...state,
        graphCsvLoading: false,
        graphCsvError: true
      };
    }
    case 'RCA_CSV_RESET': {
      return {
        ...state,
        rcaCsv: [],
        graphCsv: []
      };
    }
    case 'RESET_DASHBOARD_RCA': {
      return {
        ...initialState
      };
    }
    default:
      return state;
  }
};
