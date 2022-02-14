import {
  VERSION_SETTING_FALIURE,
  VERSION_SETTING_REQUEST,
  VERSION_SETTING_SUCCESS
} from '../actions/ActionConstants';

const initialState = {
  versionSettingLoading: false,
  versionSettingData: [],
  versionSettingFailure: false
};
export const VersionSetting = (state = initialState, action) => {
  switch (action.type) {
    case VERSION_SETTING_REQUEST: {
      return {
        ...state,
        versionSettingLoading: true
      };
    }
    case VERSION_SETTING_SUCCESS: {
      return {
        ...state,
        versionSettingData: action.data,
        versionSettingLoading: false
      };
    }
    case VERSION_SETTING_FALIURE: {
      return {
        ...state,
        versionSettingLoading: false
      };
    }
    default:
      return state;
  }
};
