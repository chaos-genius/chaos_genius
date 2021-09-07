import {
  KPISETTINGFAILURE,
  KPISETTINGREQUEST,
  KPISETTINGSUCCESS
} from '../actions/ActionConstants';

const initialState = {
  kpiSettingData: [],
  kpiSettingLoading: false,
  kpiSettingError: false
};
export const setting = (state = initialState, action) => {
  switch (action.type) {
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
    default:
      return state;
  }
};
