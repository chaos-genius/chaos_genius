import {
  DASHBOARDFAILURE,
  DASHBOARDREQUEST,
  DASHBOARDSUCCESS
} from '../actions/ActionConstants';

const initialState = {
  dashboardList: '',
  dashboardListLoading: false,
  dashboardListError: false
};

export const DashboardHome = (state = initialState, action) => {
  switch (action.type) {
    case DASHBOARDREQUEST: {
      return {
        ...state,
        dashboardListLoading: true
      };
    }
    case DASHBOARDSUCCESS: {
      return {
        ...state,
        dashboardListLoading: false,
        dashboardList: action.data
      };
    }
    case DASHBOARDFAILURE: {
      return {
        ...state,
        dashboardListLoading: false,
        dashboardListError: true
      };
    }
    default:
      return state;
  }
};
