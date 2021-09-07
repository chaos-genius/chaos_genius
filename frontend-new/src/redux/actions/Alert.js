import {
  ALERT_EMAIL_URL,
  CHANNEL_CONFIGURATION_URL,
  EDIT_CHANNEL_URL
} from '../../utils/url-helper';

import { getRequest, postRequest } from '../../utils/http-helper';

import {
  ALERTEMAILREQUEST,
  ALERTEMAILSUCCESS,
  ALERTEMAILFAILURE,
  CHANNELSTATUSSUCCESS,
  CHANNERSTATUSFAILURE,
  CHANNELSTATUSREQUEST,
  EDITCHANNELSUCCESS,
  EDITCHANNELFAILURE,
  EDITCHANNELREQUEST
} from './ActionConstants';

export const getAlertEmailRequest = () => {
  return {
    type: ALERTEMAILREQUEST
  };
};

export const getAlertEmailFailure = () => {
  return {
    type: ALERTEMAILFAILURE
  };
};

export const getAlertEmailSuccess = (response) => {
  return {
    type: ALERTEMAILSUCCESS,
    data: response
  };
};

export const getAllAlertEmail = (details) => {
  return async (dispatch) => {
    dispatch(getAlertEmailRequest());
    const { data, error, status } = await postRequest({
      url: ALERT_EMAIL_URL,
      headers: {
        'Content-Type': 'application/json'
      },
      data: JSON.stringify(details),
      noAuth: true
    });
    if (error) {
      dispatch(getAlertEmailFailure());
    } else if (data && status === 200) {
      dispatch(getAlertEmailSuccess(data));
    }
  };
};

export const getChannelStatusRequest = () => {
  return {
    type: CHANNELSTATUSREQUEST
  };
};

export const getChannelStatusFailure = () => {
  return {
    type: CHANNERSTATUSFAILURE
  };
};

export const getChannelStatusSuccess = (response) => {
  return {
    type: CHANNELSTATUSSUCCESS,
    data: response
  };
};

export const getChannelStatus = () => {
  return async (dispatch) => {
    dispatch(getChannelStatusRequest());
    const { data, error, status } = await getRequest({
      url: CHANNEL_CONFIGURATION_URL
    });
    if (error) {
      dispatch(getChannelStatusFailure());
    } else if (data && status === 200) {
      dispatch(getChannelStatusSuccess(data.data));
    }
  };
};

export const getEditRequest = () => {
  return {
    type: EDITCHANNELREQUEST
  };
};

export const getEditFailure = () => {
  return {
    type: EDITCHANNELFAILURE
  };
};

export const getEditSuccess = (response) => {
  return {
    type: EDITCHANNELSUCCESS,
    data: response
  };
};

export const getEditChannel = (editData) => {
  return async (dispatch) => {
    dispatch(getEditRequest());
    const { data, error, status } = await postRequest({
      url: EDIT_CHANNEL_URL,
      data: JSON.stringify(editData),
      headers: {
        'Content-Type': 'application/json'
      },
      noAuth: true
    });
    if (error) {
      dispatch(getEditFailure());
    } else if (data && status === 200) {
      dispatch(getEditSuccess(data.data));
    }
  };
};
