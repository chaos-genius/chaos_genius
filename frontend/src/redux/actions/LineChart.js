import { attachParams, SUMMARY_URL } from '../../utils/url-helper';
import {
  DASHBOARDLINECHARTREQUEST,
  DASHBOARDLINECHARTSUCCESS,
  DASHBOARDLINECHARTFAILURE
} from './ActionConstants';
import { getRequest } from '../../utils/http-helper';
export const dashboardLinechartRequested = () => {
  return {
    type: DASHBOARDLINECHARTREQUEST
  };
};

export const dashboardLinechartSuccess = (response) => {
  return {
    type: DASHBOARDLINECHARTSUCCESS,
    data: response
  };
};

export const dashboardLinechartFailure = () => {
  return {
    type: DASHBOARDLINECHARTFAILURE
  };
};

export const getDashboardLinechart = (id, params) => {
  return async (dispatch) => {
    const url = attachParams(`${SUMMARY_URL}/${id}/kpi-line-data`, params);
    dispatch(dashboardLinechartRequested());
    const { data, error, status } = await getRequest({
      url: url
    });
    if (error) {
      dispatch(dashboardLinechartFailure());
    } else if (data && status === 200) {
      dispatch(dashboardLinechartSuccess(data.data));
    }
  };
};
