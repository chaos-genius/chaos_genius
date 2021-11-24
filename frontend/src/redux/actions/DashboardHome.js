import { getRequest } from '../../utils/http-helper';
import { DASHBOARD_LIST_URL } from '../../utils/url-helper';
import {
  DASHBOARDFAILURE,
  DASHBOARDREQUEST,
  DASHBOARDSUCCESS
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
