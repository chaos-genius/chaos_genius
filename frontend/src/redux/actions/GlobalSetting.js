import { getRequest } from '../../utils/http-helper';
import { GLOBAL_SETTING_URL } from '../../utils/url-helper';
import {
  GLOBAL_SETTING_REQUEST,
  GLOBAL_SETTING_SUCCESS,
  GLOBAL_SETTING_FALIURE
} from './ActionConstants';

export const getGlobalSettingRequest = () => {
  return {
    type: GLOBAL_SETTING_REQUEST
  };
};

export const getGlobalSettingFailure = () => {
  return {
    type: GLOBAL_SETTING_FALIURE
  };
};

export const getGlobalSettingSuccess = (response) => {
  return {
    type: GLOBAL_SETTING_SUCCESS,
    data: response
  };
};

export const getGlobalSetting = () => {
  return async (dispatch) => {
    dispatch(getGlobalSettingRequest());
    const { data, error, status } = await getRequest({
      url: GLOBAL_SETTING_URL,
      headers: {
        'Content-Type': 'application/json'
      },
      noAuth: true
    });
    if (error) {
      dispatch(getGlobalSettingFailure());
    } else if (data && status === 200) {
      dispatch(getGlobalSettingSuccess(data.data));
    }
  };
};
