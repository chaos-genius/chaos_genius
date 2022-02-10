import {
  // ONBOARD_ORGANIZATION,
  ONBOARD_ORGANIZATION_REQUEST,
  ONBOARD_ORGANIZATION_SUCCESS,
  ONBOARD_ORGANIZATION_FAILURE,
  ONBOARD_ORGANIZATION_UPDATE_SUCCESS,
  SAVE_REPORT_SETTINGTIME_FAILURE,
  SAVE_REPORT_SETTINGTIME_REQUEST,
  SAVE_REPORT_SETTINGTIME_SUCCESS,
  GET_REPORT_SETTINGTIME_REQUEST,
  GET_REPORT_SETTINGTIME_FAILURE,
  GET_REPORT_SETTINGTIME_SUCCESS
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

export const saveReportSettingTimeRequested = () => {
  return {
    type: SAVE_REPORT_SETTINGTIME_REQUEST
  };
};

export const saveReportSettingTimeFailure = () => {
  return {
    type: SAVE_REPORT_SETTINGTIME_FAILURE
  };
};

export const saveReportSettingTimeSuccess = (data) => {
  return {
    type: SAVE_REPORT_SETTINGTIME_SUCCESS,
    data
  };
};

export const getReportSettingTimeRequested = () => {
  return {
    type: GET_REPORT_SETTINGTIME_REQUEST
  };
};

export const getReportSettingTimeFailure = () => {
  return {
    type: GET_REPORT_SETTINGTIME_FAILURE
  };
};

export const getReportSettingTimeSuccess = (data) => {
  return {
    type: GET_REPORT_SETTINGTIME_SUCCESS,
    data
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
    dispatch(getOnboardingOrgnaizationStatusRequested());
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

export const saveReportSettingTime = (payload) => {
  return async (dispatch) => {
    dispatch(saveReportSettingTimeRequested());
    const { data, error, status } = await postRequest({
      url: ALERT_EMAIL_URL,
      data: {
        config_name: 'alert_digest_settings',
        config_settings: {
          active: true,
          daily_digest: true,
          weekly_digest: false,
          scheduled_time: payload
        }
      },
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      noAuth: true
    });
    if (error) {
      dispatch(saveReportSettingTimeFailure({ status: 'failure' }));
    } else if (data && status === 200) {
      dispatch(
        saveReportSettingTimeSuccess({ data: payload, status: data.status })
      );
    }
  };
};

export const getReportSettingTime = () => {
  return async (dispatch) => {
    dispatch(getReportSettingTimeRequested());
    const { data, error, status } = await postRequest({
      url: EDIT_CHANNEL_URL,
      data: {
        config_name: 'alert_digest_settings'
      },
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      noAuth: true
    });
    if (error) {
      dispatch(getReportSettingTimeFailure());
    } else if (data && status === 200) {
      dispatch(getReportSettingTimeSuccess(data.data));
    }
  };
};
