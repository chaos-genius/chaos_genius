import {
  DASHBOARDFAILURE,
  DASHBOARDREQUEST,
  DASHBOARDSUCCESS,
  DASHBOARDDELETEREQUEST,
  DASHBOARDDELETERESPONSE,
  DASHBOARDDELETEFAILURE,
  DASHBOARDCREATEREQUST,
  DASHBOARDCREATESUCCESS,
  DASHBOARDCREATEFAILURE,
  DASHBOARDEDITREQUEST,
  DASHBOARDEDITRESPONSE,
  DASHBOARDEDITFAILURE,
  DASHBOARDUPDATEREQUEST,
  DASHBOARDUPDATESUCCESS,
  DASHBOARDUPDATEFAILURE
} from '../actions/ActionConstants';

const initialState = {
  dashboardList: '',
  dashboardListLoading: false,
  dashboardListError: false,
  dashboardDelete: [],
  dashboardDeleteLoading: false,
  dashboardDeleteError: false,
  createDashboard: [],
  createDashboardLoading: false,
  createDashboardError: false,
  editDashboard: '',
  editDashboardLoading: false,
  editDashboardError: false,
  updateDashboard: [],
  updateDashboardLoading: false,
  updateDashboardError: false
};

export const DashboardHome = (state = initialState, action) => {
  switch (action.type) {
    case DASHBOARDREQUEST: {
      return {
        ...state,
        dashboardListLoading: true,
        dashboardListError: false
      };
    }
    case DASHBOARDSUCCESS: {
      return {
        ...state,
        dashboardListLoading: false,
        dashboardList: action.data,
        dashboardListError: false
      };
    }
    case DASHBOARDFAILURE: {
      return {
        ...state,
        dashboardListLoading: false,
        dashboardList: [],
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
    case DASHBOARDCREATEREQUST: {
      return {
        ...state,
        createDashboardLoading: true
      };
    }
    case DASHBOARDCREATESUCCESS: {
      return {
        ...state,
        createDashboardLoading: false,
        createDashboard: action.data
      };
    }
    case DASHBOARDCREATEFAILURE: {
      return {
        ...state,
        createDashboardLoading: false,
        createDashboardError: true
      };
    }
    case DASHBOARDEDITREQUEST: {
      return {
        ...state,
        editDashboardLoading: true,
        editDashboardError: false
      };
    }
    case DASHBOARDEDITRESPONSE: {
      return {
        ...state,
        editDashboard: action.data,
        editDashboardLoading: false,
        editDashboardError: false
      };
    }
    case DASHBOARDEDITFAILURE: {
      return {
        ...state,
        editDashboardLoading: false,
        editDashboardError: true
      };
    }
    case DASHBOARDUPDATEREQUEST: {
      return {
        ...state,
        updateDashboardLoading: true
      };
    }
    case DASHBOARDUPDATESUCCESS: {
      return {
        ...state,
        updateDashboard: action.data,
        updateDashboardLoading: false
      };
    }
    case DASHBOARDUPDATEFAILURE: {
      return {
        ...state,
        updateDashboardLoading: false,
        updateDashboardError: true
      };
    }
    case 'DASHBOARD_RESET': {
      return {
        ...initialState
      };
    }
    default:
      return state;
  }
};
