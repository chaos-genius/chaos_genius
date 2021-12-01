import {
  GLOBAL_SETTING_FALIURE,
  GLOBAL_SETTING_REQUEST,
  GLOBAL_SETTING_SUCCESS
} from '../actions/ActionConstants';

const initialState = {
  globalSettingLoading: false,
  globalSettingData: [],
  globalSettingFailure: false
};
export const GlobalSetting = (state = initialState, action) => {
  switch (action.type) {
    case GLOBAL_SETTING_REQUEST: {
      return {
        ...state,
        globalSettingLoading: true
      };
    }
    case GLOBAL_SETTING_SUCCESS: {
      return {
        ...state,
        globalSettingData: action.data,
        globalSettingLoading: false
      };
    }
    case GLOBAL_SETTING_FALIURE: {
      return {
        ...state,
        globalSettingLoading: false
      };
    }
    default:
      return state;
  }
};
