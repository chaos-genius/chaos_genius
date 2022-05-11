import {
  ONBOARDINGSUCCESS,
  ONBOARDINGREQUEST,
  ONBOARDINGFAILURE,
  HOMEKPIVIEWREQUEST,
  HOMEKPIVIEWSUCCESS,
  HOMEKPIVIEWFAILURE
} from './ActionConstants';

import {
  attachParams,
  KPI_RELATIVE_URL,
  ONBOARDING_URL
} from '../../utils/url-helper';

import { getRequest } from '../../utils/http-helper';

export const getOnboardingStatusRequested = () => {
  return {
    type: ONBOARDINGREQUEST
  };
};

export const getOnboardingStatusSuccess = (response) => {
  return {
    type: ONBOARDINGSUCCESS,
    data: response
  };
};

export const getOnboardingStatusFailure = (status) => {
  return {
    type: ONBOARDINGFAILURE,
    data: status
  };
};

export const getOnboardingStatus = () => {
  return async (dispatch) => {
    dispatch(getOnboardingStatusRequested);
    const { data, error, status } = await getRequest({
      url: ONBOARDING_URL
    });
    if (error) {
      dispatch(getOnboardingStatusFailure(status));
    } else if (data && status === 200) {
      dispatch(getOnboardingStatusSuccess(data.data));
    }
  };
};

export const getHomeKpiRequested = () => {
  return {
    type: HOMEKPIVIEWREQUEST
  };
};

export const getHomeKpiSuccess = (response) => {
  return {
    type: HOMEKPIVIEWSUCCESS,
    data: response
  };
};

export const getHomeKpiFailure = () => {
  return {
    type: HOMEKPIVIEWFAILURE
  };
};

export const getHomeKpi = (params) => {
  return async (dispatch) => {
    const url = attachParams(`${KPI_RELATIVE_URL}/get-dashboard-list`, params);
    dispatch(getHomeKpiRequested());
    const { data, error, status } = await getRequest({
      url: url
    });
    if (error) {
      dispatch(getHomeKpiFailure());
    } else if (data && status === 200) {
      dispatch(getHomeKpiSuccess(data));
    }
  };
};
