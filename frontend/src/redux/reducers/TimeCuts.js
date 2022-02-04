import {
  TIME_CUTS_FALIURE,
  TIME_CUTS_REQUEST,
  TIME_CUTS_SUCCESS
} from '../actions/ActionConstants';

const initialState = {
  timeCutsLoading: false,
  timeCutsData: [],
  timeCutsFailure: false,
  activeTimeCut: {}
};
export const TimeCuts = (state = initialState, action) => {
  switch (action.type) {
    case TIME_CUTS_REQUEST: {
      return {
        ...state,
        timeCutsLoading: true
      };
    }
    case TIME_CUTS_SUCCESS: {
      return {
        ...state,
        timeCutsData: action.data,
        timeCutsLoading: false
      };
    }
    case TIME_CUTS_FALIURE: {
      return {
        ...state,
        timeCutsLoading: false
      };
    }
    case 'ACTIVE_TIMECUT': {
      return {
        ...state,
        activeTimeCut: action.data
      };
    }
    case 'CLEAR_TIMECUTS': {
      return {
        ...initialState
      };
    }
    default:
      return state;
  }
};
