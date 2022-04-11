import {
  DASHBOARDSIDEBARFAILURE,
  DASHBOARDSIDEBARREQUEST,
  DASHBOARDSIDEBARSUCCESS
} from '../actions/ActionConstants';

const initialState = {
  sidebarLoading: true,
  sidebarError: false,
  sidebarList: []
};

export const sidebar = (state = initialState, action) => {
  switch (action.type) {
    case DASHBOARDSIDEBARREQUEST: {
      return {
        ...state,
        sidebarLoading: true,
        sidebarError: false
      };
    }

    case DASHBOARDSIDEBARSUCCESS: {
      return {
        ...state,
        sidebarLoading: false,
        sidebarList: action.data
      };
    }
    case DASHBOARDSIDEBARFAILURE: {
      return {
        ...state,
        sidebarLoading: false,
        sidebarError: true
      };
    }
    case 'SIDEBAR_RESET': {
      return {
        ...state,
        sidebarList: []
      };
    }
    default:
      return state;
  }
};
