import { getRequest, postRequest } from '../../utils/http-helper';
import { BASE_URL, SETTING_META_INFO_URL } from '../../utils/url-helper';
import {
  KPIEDITFAILURE,
  KPIEDITREQUEST,
  KPIEDITSUCCESS,
  KPISETTINGFAILURE,
  KPISETTINGREQUEST,
  KPISETTINGSUCCESS,
  SETTING_META_INFO_REQUEST,
  SETTING_META_INFO_SUCCESS,
  SETTING_META_INFO_FAILURE
} from './ActionConstants';

export const kpiSettingRequest = () => {
  return {
    type: KPISETTINGREQUEST
  };
};

export const kpiSettingSuccess = (response) => {
  return {
    type: KPISETTINGSUCCESS,
    data: response
  };
};

export const kpiSettingFailure = () => {
  return {
    type: KPISETTINGFAILURE
  };
};

export const kpiSettingSetup = (kpi, kpiData) => {
  return async (dispatch) => {
    dispatch(kpiSettingRequest());
    const URL = `${BASE_URL}/api/anomaly-data/${kpi}/anomaly-params`;
    const { data, error, status } = await postRequest({
      url: URL,
      data: kpiData,
      headers: {
        'Content-Type': 'application/json'
      },
      noAuth: true
    });
    if (error) {
      dispatch(kpiSettingFailure());
    } else if (data && status === 200) {
      dispatch(kpiSettingSuccess(data));
    }
  };
};

export const kpiEditRequest = () => {
  return {
    type: KPIEDITREQUEST
  };
};

export const kpiEditSuccess = (response) => {
  return {
    type: KPIEDITSUCCESS,
    data: response
  };
};

export const kpiEditFailure = (response) => {
  return {
    type: KPIEDITFAILURE,
    data: response
  };
};

export const kpiEditSetup = (kpi) => {
  return async (dispatch) => {
    dispatch(kpiEditRequest());
    const URL = `${BASE_URL}/api/anomaly-data/${kpi}/anomaly-params`;
    const { data, error, status } = await getRequest({
      url: URL
    });
    if (error) {
      dispatch(kpiEditFailure());
    } else if (data && status === 200) {
      dispatch(kpiEditSuccess(data));
    }
  };
};

export const settingMetaInfoRequest = () => {
  return {
    type: SETTING_META_INFO_REQUEST
  };
};

export const settingMetaInfoSuccess = (response) => {
  return {
    type: SETTING_META_INFO_SUCCESS,
    data: response
  };
};

export const settingMetaInfoFailure = () => {
  return {
    type: SETTING_META_INFO_FAILURE
  };
};

export const settingMetaInfo = () => {
  return async (dispatch) => {
    dispatch(settingMetaInfoRequest());

    const { data, error, status } = await getRequest({
      url: SETTING_META_INFO_URL
    });
    if (error) {
      dispatch(settingMetaInfoFailure());
    } else if (data && status === 200) {
      dispatch(settingMetaInfoSuccess(data));
    }
  };
};
