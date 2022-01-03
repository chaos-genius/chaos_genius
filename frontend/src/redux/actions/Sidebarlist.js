import { attachParams, DASHBOARD_SIDEBAR_URL } from '../../utils/url-helper';
import {
  DASHBOARDSIDEBARREQUEST,
  DASHBOARDSIDEBARSUCCESS,
  DASHBOARDSIDEBARFAILURE
} from './ActionConstants';
import { getRequest } from '../../utils/http-helper';

export const dashboardSidebarRequested = () => {
  return {
    type: DASHBOARDSIDEBARREQUEST
  };
};

export const dashboardSidebarSuccess = (response) => {
  return {
    type: DASHBOARDSIDEBARSUCCESS,
    data: response
  };
};

export const dashboardSidebarFailure = () => {
  return {
    type: DASHBOARDSIDEBARFAILURE
  };
};

export const getDashboardSidebar = (params) => {
  return async (dispatch) => {
    dispatch(dashboardSidebarRequested());
    const url = attachParams(DASHBOARD_SIDEBAR_URL, params);
    const { data, error, status } = await getRequest({
      url: url
    });
    if (error) {
      dispatch(dashboardSidebarFailure());
    } else if (data && status === 200) {
      dispatch(dashboardSidebarSuccess(data));
    }
  };
};
