import {
  // ONBOARD_ORGANIZATION,
  ONBOARD_ORGANIZATION_REQUEST,
  ONBOARD_ORGANIZATION_SUCCESS,
  ONBOARD_ORGANIZATION_FAILURE,
  ONBOARD_ORGANIZATION_UPDATE_SUCCESS,
  SAVE_REPORT_SETTINGTIME_REQUEST,
  SAVE_REPORT_SETTINGTIME_FAILURE,
  SAVE_REPORT_SETTINGTIME_SUCCESS,
  GET_REPORT_SETTINGTIME_FAILURE,
  GET_REPORT_SETTINGTIME_REQUEST,
  GET_REPORT_SETTINGTIME_SUCCESS
} from '../actions/ActionConstants';

const initialState = {
  organisationData: [],
  isLoading: true,
  error: false,
  reportSettingTimeRequested: false,
  reportSettingTimeFailure: false,
  reportSettingTimeSuccess: false,
  getreportSettingTimeSuccess: false,
  getreportSettingTimeFailure: false,
  getreportSettingTimeRequest: false,
  reportSettingTime: '',
  reportSettingTimeStatus: ''
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
        reportSettingTimeRequested: true,
        reportSettingTimeFailure: false,
        reportSettingTimeSuccess: false,
        reportSettingTimeStatus: ''
      };
    }
    case SAVE_REPORT_SETTINGTIME_FAILURE: {
      return {
        ...state,
        reportSettingTimeRequested: false,
        reportSettingTimeFailure: true,
        reportSettingTimeStatus: action.data.status
      };
    }
    case SAVE_REPORT_SETTINGTIME_SUCCESS: {
      return {
        ...state,
        reportSettingTimeSuccess: true,
        reportSettingTime: action.data.data,
        reportSettingTimeStatus: action.data.status
      };
    }

    case GET_REPORT_SETTINGTIME_FAILURE: {
      return {
        ...state,
        getreportSettingTimeFailure: true,
        getreportSettingTimeRequest: false
      };
    }
    case GET_REPORT_SETTINGTIME_REQUEST: {
      return {
        ...state,
        getreportSettingTimeRequest: true,
        getreportSettingTimeFailure: false,
        getreportSettingTimeSuccess: false,
        reportSettingTime: ''
      };
    }

    case GET_REPORT_SETTINGTIME_SUCCESS: {
      return {
        ...state,
        getreportSettingTimeFailure: false,
        getreportSettingTimeSuccess: true,
        getreportSettingTimeRequest: false,
        reportSettingTime: action.data?.config_setting?.scheduled_time
      };
    }

    case 'CLEAR_REPORTING': {
      return {
        ...state,
        reportSettingTimeStatus: '',
        reportSettingTimeFailure: false,
        reportSettingTimeRequested: false,
        reportSettingTimeSuccess: false
      };
    }

    default:
      return state;
  }
};
