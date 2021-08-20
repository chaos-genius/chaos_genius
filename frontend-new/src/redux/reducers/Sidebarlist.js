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
    default:
      return state;
  }
};
