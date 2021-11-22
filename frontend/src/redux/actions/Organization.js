import {
  // ONBOARD_ORGANIZATION,
  ONBOARD_ORGANIZATION_REQUEST,
  ONBOARD_ORGANIZATION_SUCCESS,
  ONBOARD_ORGANIZATION_FAILURE
} from './ActionConstants';

import { ONBOARDING_ORGANIZATION_URL } from '../../utils/url-helper';
import { postRequest } from '../../utils/http-helper';

export const getOnboardingOrgnaizationStatusRequested = () => {
  return {
    type: ONBOARD_ORGANIZATION_REQUEST
  };
};

export const getOnboardingOrgnaizationStatusFailure = () => {
  return {
    type: ONBOARD_ORGANIZATION_FAILURE
  };
};

export const getOnboardingOrgnaizationStatusSuccess = () => {
  return {
    type: ONBOARD_ORGANIZATION_SUCCESS
  };
};

export const onboardingOrganizationStatus = (payload) => {
  return async (dispatch) => {
    dispatch(getOnboardingOrgnaizationStatusRequested);
    const { data, error, status } = await postRequest({
      url: ONBOARDING_ORGANIZATION_URL + '/',
      data: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      noAuth: true
    });
    if (error) {
      dispatch(getOnboardingOrgnaizationStatusFailure);
    } else if (data && status === 200) {
      dispatch(getOnboardingOrgnaizationStatusSuccess(data.data));
    }
  };
};
