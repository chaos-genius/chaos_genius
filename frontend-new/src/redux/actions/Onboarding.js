import {
  ONBOARDINGSUCCESS,
  ONBOARDINGREQUEST,
  ONBOARDINGFAILURE
} from './ActionConstants';

import { ONBOARDING_URL } from '../../utils/url-helper';

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

export const getOnboardingStatusFailure = () => {
  return {
    type: ONBOARDINGFAILURE
  };
};

export const getOnboardingStatus = () => {
  return async (dispatch) => {
    dispatch(getOnboardingStatusRequested);
    const { data, error, status } = await getRequest({
      url: ONBOARDING_URL
    });
    if (error) {
      dispatch(getOnboardingStatusFailure);
    } else if (data && status === 200) {
      dispatch(getOnboardingStatusSuccess(data.data));
    }
  };
};
