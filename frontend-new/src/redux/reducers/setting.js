import {
  KPIEDITREQUEST,
  KPIEDITFAILURE,
  KPIEDITSUCCESS,
  KPISETTINGFAILURE,
  KPISETTINGREQUEST,
  KPISETTINGSUCCESS
} from '../actions/ActionConstants';

const initialState = {
  kpiSettingData: [],
  kpiSettingLoading: false,
  kpiSettingError: false,
  kpiEditData: [],
  kpiEditLoading: false,
  kpiEditError: []
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
