import {
  // ONBOARD_ORGANIZATION,
  ONBOARD_ORGANIZATION_REQUEST,
  ONBOARD_ORGANIZATION_SUCCESS,
  ONBOARD_ORGANIZATION_FAILURE,
  ONBOARD_ORGANIZATION_UPDATE_SUCCESS,
  SAVE_REPORT_SETTINGTIME_REQUEST,
  SAVE_REPORT_SETTINGTIME_FAILURE,
  SAVE_REPORT_SETTINGTIME_SUCCESS
} from '../actions/ActionConstants';

const initialState = {
  organisationData: [],
  isLoading: true,
  error: false,
  reportSettingTimeRequested: false,
  reportSettingTimeFailure: false,
  reportSettingTimeSuccess: false
};

export const organisation = (state = initialState, action) => {
  switch (action.type) {
    case ONBOARD_ORGANIZATION_SUCCESS: {
      return {
        ...state,
        isLoading: false,
        organisationData: action.data,
        error: false
      };
    }

    case ONBOARD_ORGANIZATION_UPDATE_SUCCESS: {
      return {
        ...state,
        isLoading: false,
        organisationData: action.data,
        error: false
      };
    }

    case ONBOARD_ORGANIZATION_REQUEST: {
      return {
        ...state,
        isLoading: true,
        error: false
      };
    }
    case ONBOARD_ORGANIZATION_FAILURE: {
      return {
        ...state,
        isLoading: false,
        error: true
      };
    }
    case SAVE_REPORT_SETTINGTIME_REQUEST: {
      return {
        ...state,
        reportSettingTimeRequested: true
      };
    }
    case SAVE_REPORT_SETTINGTIME_FAILURE: {
      return {
        ...state,
        reportSettingTimeRequested: false,
        reportSettingTimeFailure: true
      };
    }
    case SAVE_REPORT_SETTINGTIME_SUCCESS: {
      return {
        ...state,
        reportSettingTimeSuccess: true
      };
    }
    default:
      return state;
  }
};
