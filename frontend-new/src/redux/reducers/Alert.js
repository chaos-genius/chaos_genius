import {
  ALERTEMAILREQUEST,
  ALERTEMAILSUCCESS,
  ALERTEMAILFAILURE,
  CHANNELSTATUSREQUEST,
  CHANNELSTATUSSUCCESS,
  CHANNERSTATUSFAILURE,
  EDITCHANNELREQUEST,
  EDITCHANNELSUCCESS,
  EDITCHANNELFAILURE
} from '../actions/ActionConstants';

const initialState = {
  emailLoading: false,
  emailData: [],
  emailError: false,
  channelStatusLoading: false,
  channelStatusData: [],
  channelStatusError: false,
  editData: [],
  editLoading: false,
  editError: false
};
export const alert = (state = initialState, action) => {
  switch (action.type) {
    case ALERTEMAILREQUEST: {
      return {
        ...state,
        emailLoading: true,
        emailError: false
      };
    }
    case ALERTEMAILSUCCESS: {
      return {
        ...state,
        emailLoading: false,
        emailData: action.data
      };
    }
    case ALERTEMAILFAILURE: {
      return {
        ...state,
        emailLoading: false,
        emailError: true
      };
    }
    case CHANNELSTATUSREQUEST: {
      return {
        ...state,
        channelStatusLoading: true
      };
    }
    case CHANNELSTATUSSUCCESS: {
      return {
        ...state,
        channelStatusData: action.data,
        channelStatusLoading: false
      };
    }
    case CHANNERSTATUSFAILURE: {
      return {
        ...state,
        channelStatusLoading: false,
        channelStatusError: true
      };
    }
    case EDITCHANNELREQUEST: {
      return {
        ...state,
        editLoading: true
      };
    }
    case EDITCHANNELSUCCESS: {
      return {
        ...state,
        editData: action.data,
        editLoading: false
      };
    }
    case EDITCHANNELFAILURE: {
      return {
        ...state,
        editLoading: false,
        editError: true
      };
    }
    case 'RESET_EMAIL_DATA': {
      return {
        ...state,
        emailData: [],
        editData: []
      };
    }
    default:
      return state;
  }
};
