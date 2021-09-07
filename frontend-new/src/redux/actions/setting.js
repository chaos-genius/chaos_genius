import { postRequest } from '../../utils/http-helper';

import {
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
    const URL = `${' https://a-demo.chaosgenius.io'}/api/anomaly-data/${kpi}/anomaly-params`;
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
