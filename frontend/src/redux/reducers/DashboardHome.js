import {
  DASHBOARDFAILURE,
  DASHBOARDREQUEST,
  DASHBOARDSUCCESS,
  DASHBOARDDELETEREQUEST,
  DASHBOARDDELETERESPONSE,
  DASHBOARDDELETEFAILURE
} from '../actions/ActionConstants';

const initialState = {
  dashboardList: '',
  dashboardListLoading: false,
  dashboardListError: false,
  dashboardDelete: '',
  dashboardDeleteLoading: false,
  dashboardDeleteError: false
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
    case DASHBOARDDELETEREQUEST: {
      return {
        ...state,
        dashboardDeleteLoading: true,
        dashboardDeleteError: false
      };
    }
    case DASHBOARDDELETERESPONSE: {
      return {
        ...state,
        dashboardDelete: action.data,
        dashboardDeleteLoading: false
      };
    }
    case DASHBOARDDELETEFAILURE: {
      return {
        ...state,
        dashboardDeleteLoading: false,
        dashboardDeleteError: true
      };
    }
    default:
      return state;
  }
};
