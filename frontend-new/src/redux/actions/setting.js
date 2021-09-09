import { getRequest, postRequest } from '../../utils/http-helper';
import { BASE_URL } from '../../utils/url-helper';
import {
  KPIEDITFAILURE,
  KPIEDITREQUEST,
  KPIEDITSUCCESS,
  KPISETTINGFAILURE,
  KPISETTINGREQUEST,
  KPISETTINGSUCCESS
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
