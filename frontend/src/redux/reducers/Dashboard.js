import {
  DASHBOARDRCAANALYSISFAILURE,
  DASHBOARDRCAANALYSISREQUEST,
  DASHBOARDRCAANALYSISSUCCESS,
  RCADOWNLOADFAILURE,
  RCADOWNLOADREQUEST,
  RCADOWNLOADSUCCESS
} from '../actions/ActionConstants';
import { rcaDownloadCsv } from '../actions/Dashboard';

const initialState = {
  rcaAnalysisData: [],
  rcaAnalysisLoading: true,
  rcaAnalysisError: false,
  rcaCsv: [],
  rcaCsvLoading: false,
  rcaCsvError: false
};

export const dashboard = (state = initialState, action) => {
  switch (action.type) {
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
    case RCADOWNLOADREQUEST: {
      return {
        rcaCsvLoading: true
      };
    }
    case RCADOWNLOADSUCCESS: {
      return {
        rcaCsv: action.data,
        rcaCsvLoading: false
      };
    }
    case RCADOWNLOADFAILURE: {
      return {
        rcaCsvError: true,
        rcaCsvLoading: false
      };
    }
    case 'RCA_CSV_RESET': {
      return {
        rcaCsv: []
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
