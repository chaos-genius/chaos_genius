import { getRequest, postRequest } from '../../utils/http-helper';
import {
  DASHBOARD_LIST_URL,
  DASHBOARD_DELETE_URL,
  DASHBOARD_CREATE_URL
} from '../../utils/url-helper';
import {
  DASHBOARDFAILURE,
  DASHBOARDREQUEST,
  DASHBOARDSUCCESS,
  DASHBOARDDELETEREQUEST,
  DASHBOARDDELETERESPONSE,
  DASHBOARDDELETEFAILURE,
  DASHBOARDCREATEREQUST,
  DASHBOARDCREATEFAILURE,
  DASHBOARDCREATESUCCESS
} from './ActionConstants';

export const getDashboardRequested = () => {
  return {
    type: DASHBOARDREQUEST
  };
};

export const getDashboardSuccess = (response) => {
  return {
    type: DASHBOARDSUCCESS,
    data: response
  };
};

export const getDashboardFailure = () => {
  return {
    type: DASHBOARDFAILURE
  };
};

export const getDashboard = () => {
  return async (dispatch) => {
    dispatch(getDashboardRequested());
    const { data, error, status } = await getRequest({
      url: DASHBOARD_LIST_URL
    });
    if (error) {
      dispatch(getDashboardFailure());
    } else if (data && status === 200) {
      dispatch(getDashboardSuccess(data.data));
    }
  };
};

export const getDashboardDeleteRequest = () => {
  return {
    type: DASHBOARDDELETEREQUEST
  };
};

export const getDashboardDeleteResponse = (response) => {
  return {
    type: DASHBOARDDELETERESPONSE,
    data: response
  };
};

export const getDashboardDeleteFailure = () => {
  return {
    type: DASHBOARDDELETEFAILURE
  };
};

export const getDashboardDelete = (id) => {
  return async (dispatch) => {
    dispatch(getDashboardDeleteRequest());
    const { data, error, status } = await postRequest({
      url: `${DASHBOARD_DELETE_URL}?dashboard_id=${id}`
    });
    if (error) {
      dispatch(getDashboardDeleteFailure());
    } else if (data && status === 200) {
      dispatch(getDashboardDeleteResponse(data.data));
    }
  };
};

export const getCreateDashboardRequest = () => {
  return {
    type: DASHBOARDCREATEREQUST
  };
};

export const getCreateDashboardSuccess = (response) => {
  return {
    type: DASHBOARDCREATESUCCESS,
    data: response
  };
};

export const getCreateDashboardFailure = () => {
  return {
    type: DASHBOARDCREATEFAILURE
  };
};

export const getCreateDashboard = (dashboard) => {
  return async (dispatch) => {
    dispatch(getCreateDashboardRequest());
    const { data, error, status } = await postRequest({
      url: DASHBOARD_CREATE_URL,
      data: dashboard
    });
    if (error) {
      dispatch(getCreateDashboardFailure());
    } else if (data && status === 200) {
      dispatch(getCreateDashboardSuccess(data.data));
    }
  };
};
