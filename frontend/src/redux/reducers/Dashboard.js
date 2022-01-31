import {
  DASHBOARDRCAANALYSISFAILURE,
  DASHBOARDRCAANALYSISREQUEST,
  DASHBOARDRCAANALYSISSUCCESS
} from '../actions/ActionConstants';

const initialState = {
  rcaAnalysisData: [],
  rcaAnalysisLoading: true,
  rcaAnalysisError: false
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
    case 'RESET_DASHBOARD_RCA': {
      return {
        ...initialState
      };
    }
    default:
      return state;
  }
};
