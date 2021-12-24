import {
  // ONBOARD_ORGANIZATION,
  ONBOARD_ORGANIZATION_REQUEST,
  ONBOARD_ORGANIZATION_SUCCESS,
  ONBOARD_ORGANIZATION_FAILURE,
  ONBOARD_ORGANIZATION_UPDATE_SUCCESS
} from './ActionConstants';

import {
  EDIT_CHANNEL_URL,
  ALERT_EMAIL_URL,
  ORGANIZATION_UPDATE_URL
} from '../../utils/url-helper';
import { postRequest, putRequest } from '../../utils/http-helper';

// import {getOnboardingStatus } from './Onboarding'

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

export const getOnboardingOrgnaizationStatusSuccess = (response) => {
  return {
    type: ONBOARD_ORGANIZATION_SUCCESS,
    data: response
  };
};

export const getOnboardingOrgnaizationUpdateStatusSuccess = (response) => {
  return {
    type: ONBOARD_ORGANIZATION_UPDATE_SUCCESS,
    data: response
  };
};

export const onboardOrganisation = (payload) => {
  return async (dispatch) => {
    dispatch(getOnboardingOrgnaizationStatusRequested());
    const { data, error, status } = await postRequest({
      url: ALERT_EMAIL_URL,
      data: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      noAuth: true
    });
    if (error) {
      dispatch(getOnboardingOrgnaizationStatusFailure());
    } else if (data && status === 200) {
      dispatch(onboardingOrganisationStatus());
    }
  };
};

export const onboardingOrganisationStatus = () => {
  const reqObject = {
    config_name: 'organisation_settings'
  };
  return async (dispatch) => {
    const { data, error, status } = await postRequest({
      url: EDIT_CHANNEL_URL,
      data: reqObject,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      noAuth: true
    });
    if (error) {
      dispatch(getOnboardingOrgnaizationStatusFailure());
    } else if (data && status === 200) {
      dispatch(getOnboardingOrgnaizationStatusSuccess(data.data));
    }
  };
};

export const onboardOrganisationUpdate = (payload) => {
  return async (dispatch) => {
    dispatch(getOnboardingOrgnaizationStatusRequested);
    const { data, error, status } = await putRequest({
      url: ORGANIZATION_UPDATE_URL,
      data: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      noAuth: true
    });
    if (error) {
      dispatch(getOnboardingOrgnaizationStatusFailure());
    } else if (data && status === 200) {
      dispatch(onboardingOrganisationStatus());
    }
  };
};
