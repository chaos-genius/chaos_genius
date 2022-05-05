import { getRequest, postRequest } from '../../utils/http-helper';
import {
  DASHBOARD_LIST_URL,
  DASHBOARD_DELETE_URL,
  DASHBOARD_CREATE_URL,
  DASHBOARD_UPDATE_URL,
  attachParams,
  DASHBOARD_EDIT_URL,
  DASHBOARD_LIST_FOR_FILTER
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
  DASHBOARDCREATESUCCESS,
  DASHBOARDEDITREQUEST,
  DASHBOARDEDITRESPONSE,
  DASHBOARDEDITFAILURE,
  DASHBOARDUPDATEREQUEST,
  DASHBOARDUPDATESUCCESS,
  DASHBOARDUPDATEFAILURE,
  GETDASHBOARDFORFIlTERSUCCESS,
  GETDASHBOARDFORFIlTERFAILURE
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
    const { data, error, status } = await getRequest({
      url: DASHBOARD_LIST_URL
    });
    dispatch(getDashboardRequested());
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

export const getDashboardDelete = (params) => {
  return async (dispatch) => {
    dispatch(getDashboardDeleteRequest());
    const URL = attachParams(DASHBOARD_DELETE_URL, params);
    const { data, error, status } = await postRequest({
      url: URL
    });
    if (error) {
      dispatch(getDashboardDeleteFailure());
    } else if (data && status === 200) {
      dispatch(getDashboardDeleteResponse(data));
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
      dispatch(getCreateDashboardSuccess(data));
    }
  };
};

export const getEditDashboardRequest = () => {
  return {
    type: DASHBOARDEDITREQUEST
  };
};

export const getEditDashboardSuccess = (response) => {
  return {
    type: DASHBOARDEDITRESPONSE,
    data: response
  };
};

export const getEditDashboardFailure = () => {
  return {
    type: DASHBOARDEDITFAILURE
  };
};

export const getEditDashboard = (params) => {
  return async (dispatch) => {
    dispatch(getEditDashboardRequest());
    const URL = attachParams(DASHBOARD_EDIT_URL, params);
    const { data, error, status } = await getRequest({
      url: URL
    });
    if (error) {
      dispatch(getEditDashboardFailure());
    } else if (data && status === 200) {
      dispatch(getEditDashboardSuccess(data.dashboard));
    }
  };
};

export const getUpdateDashboardRequest = () => {
  return {
    type: DASHBOARDUPDATEREQUEST
  };
};

export const getUpdateDashboardSuccess = (response) => {
  return {
    type: DASHBOARDUPDATESUCCESS,
    data: response
  };
};

export const getUpdateDashboardFailure = () => {
  return {
    type: DASHBOARDUPDATEFAILURE
  };
};

export const getUpdateDashboard = (payload) => {
  return async (dispatch) => {
    dispatch(getUpdateDashboardRequest());
    //const URL = attachParams(DASHBOARD_UPDATE_URL, params);
    const { data, error, status } = await postRequest({
      url: DASHBOARD_UPDATE_URL,
      data: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json'
      },
      noAuth: true
    });
    if (error) {
      dispatch(getUpdateDashboardFailure());
    } else if (data && status === 200) {
      dispatch(getUpdateDashboardSuccess(data));
    }
  };
};

export const getDashboardForFilterSuccess = (response) => {
  return {
    type: GETDASHBOARDFORFIlTERSUCCESS,
    data: response.data
  };
};

export const getDashboardForFilterFailure = () => {
  return {
    type: GETDASHBOARDFORFIlTERFAILURE
  };
};

export const getDashboardForFilter = () => {
  return async (dispatch) => {
    const { data, error, status } = await getRequest({
      url: DASHBOARD_LIST_FOR_FILTER
    });
    if (error) {
      dispatch(getDashboardForFilterFailure());
    } else if (data && status === 200) {
      dispatch(getDashboardForFilterSuccess(data));
    }
  };
};
