import {
  KPIEDITREQUEST,
  KPIEDITFAILURE,
  KPIEDITSUCCESS,
  KPISETTINGFAILURE,
  KPISETTINGREQUEST,
  KPISETTINGSUCCESS,
  SETTING_META_INFO_REQUEST,
  SETTING_META_INFO_SUCCESS,
  SETTING_META_INFO_FAILURE
} from '../actions/ActionConstants';

const initialState = {
  kpiSettingData: [],
  kpiSettingLoading: false,
  kpiSettingError: false,
  kpiEditData: [],
  kpiEditLoading: false,
  kpiEditError: [],
  metaInfoLoading: false,
  metaInfoData: [],
  metaInfoError: false
};
export const setting = (state = initialState, action) => {
  switch (action.type) {
    case KPIEDITREQUEST: {
      return {
        ...state,
        kpiEditLoading: true
      };
    }
    case KPIEDITSUCCESS: {
      return {
        ...state,
        kpiEditData: action.data,
        kpiEditLoading: false
      };
    }
    case KPIEDITFAILURE: {
      return {
        ...state,
        kpiEditError: action.data,
        kpiEditLoading: false
      };
    }
    case KPISETTINGREQUEST: {
      return {
        ...state,
        kpiSettingLoading: true,
        kpiSettingError: false
      };
    }
    case KPISETTINGSUCCESS: {
      return {
        ...state,
        kpiSettingLoading: false,
        kpiSettingData: action.data
      };
    }
    case KPISETTINGFAILURE: {
      return {
        ...state,
        kpiSettingLoading: false,
        kpiSettingError: true
      };
    }
    case SETTING_META_INFO_REQUEST: {
      return {
        ...state,
        metaInfoLoading: true
      };
    }
    case SETTING_META_INFO_SUCCESS: {
      return {
        ...state,
        metaInfoLoading: false,
        metaInfoData: action.data
      };
    }
    case SETTING_META_INFO_FAILURE: {
      return {
        ...state,
        metaInfoLoading: false,
        metaInfoError: true
      };
    }
    case 'SETTING_RESET': {
      return {
        kpiSettingData: [],
        kpiEditData: []
      };
    }
    default:
      return state;
  }
};
