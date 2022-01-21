import { getRequest } from '../../utils/http-helper';
import { VERSION_SETTING_URL } from '../../utils/url-helper';
import {
  VERSION_SETTING_REQUEST,
  VERSION_SETTING_SUCCESS,
  VERSION_SETTING_FALIURE
} from './ActionConstants';

export const getVersionSettingRequest = () => {
  return {
    type: VERSION_SETTING_REQUEST
  };
};

export const getVersionSettingFailure = () => {
  return {
    type: VERSION_SETTING_FALIURE
  };
};

export const getVersionSettingSuccess = (response) => {
  return {
    type: VERSION_SETTING_SUCCESS,
    data: response
  };
};

export const getVersionSetting = () => {
  return async (dispatch) => {
    dispatch(getVersionSettingRequest());
    const { data, error, status } = await getRequest({
      url: VERSION_SETTING_URL,
      headers: {
        'Content-Type': 'application/json'
      },
      noAuth: true
    });
    if (error) {
      dispatch(getVersionSettingFailure());
    } else if (data && status === 200) {
      dispatch(getVersionSettingSuccess(data && data.extra));
    }
  };
};
