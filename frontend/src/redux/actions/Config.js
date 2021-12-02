import { attachParams, BASE_URL } from '../../utils/url-helper';
import { getRequest } from '../../utils/http-helper';
import {
  DASHBOARD_CONFIG_REQUEST,
  DASHBOARD_CONFIG_SUCCESS,
  DASHBOARD_CONFIG_FAILURE
} from './ActionConstants';

export const getDashboardConfigRequest = () => {
  return {
    type: DASHBOARD_CONFIG_REQUEST
  };
};

export const getDashboardConfigSuccess = (response) => {
  return {
    type: DASHBOARD_CONFIG_SUCCESS,
    data: response
  };
};

export const getDashboardConfigFailure = () => {
  return {
    type: DASHBOARD_CONFIG_FAILURE
  };
};

export const getDashboardConfig = (params) => {
  return async (dispatch) => {
    const url = attachParams(`${BASE_URL}/api/config/dashboard_config`, params);
    dispatch(getDashboardConfigRequest());
    const { data, error, status } = await getRequest({
      url: url
    });
    if (error) {
      dispatch(getDashboardConfigFailure());
    } else if (data && status === 200) {
      dispatch(getDashboardConfigSuccess(data.data));
    }
  };
};
