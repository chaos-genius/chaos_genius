import {
  ALERT_EMAIL_URL,
  ALERT_LIST_URL,
  CHANNEL_CONFIGURATION_URL,
  CREATE_KPI_ALERT_URL,
  EDIT_CHANNEL_URL,
  EMAIL_META_INFO_URL,
  SLACK_META_INFO_URL
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
  EDITCHANNELREQUEST,
  EMAIL_META_INFO_REQUEST,
  EMAIL_META_INFO_SUCCESS,
  EMAIL_META_INFO_FAILURE,
  SLACK_META_INFO_FAILURE,
  SLACK_META_INFO_SUCCESS,
  SLACK_META_INFO_REQUEST,
  ALERTSSUCCESS,
  ALERTSFAILURE,
  ALERTSREQUEST,
  CREATEKPIALERTREQUEST,
  CREATEKPIALERTSUCCESS,
  CREATEKPIALERTFAILURE
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

export const getEmailMetaInfoRequest = () => {
  return {
    type: EMAIL_META_INFO_REQUEST
  };
};

export const getEmailMetaInfoSuccess = (response) => {
  return {
    type: EMAIL_META_INFO_SUCCESS,
    data: response
  };
};

export const getEmailMetaInfoFailure = () => {
  return {
    type: EMAIL_META_INFO_FAILURE
  };
};

export const getEmailMetaInfo = () => {
  return async (dispatch) => {
    dispatch(getEmailMetaInfoRequest());
    const { data, error, status } = await getRequest({
      url: `${EMAIL_META_INFO_URL}`
    });
    if (error) {
      dispatch(getEmailMetaInfoFailure());
    } else if (data && status === 200) {
      dispatch(getEmailMetaInfoSuccess(data.data));
    }
  };
};

export const getSlackMetaInfoRequest = () => {
  return {
    type: SLACK_META_INFO_REQUEST
  };
};

export const getSlackMetaInfoSuccess = (response) => {
  return {
    type: SLACK_META_INFO_SUCCESS,
    data: response
  };
};

export const getSlackMetaInfoFailure = () => {
  return {
    type: SLACK_META_INFO_FAILURE
  };
};

export const getSlackMetaInfo = () => {
  return async (dispatch) => {
    dispatch(getSlackMetaInfoRequest());
    const { data, error, status } = await getRequest({
      url: `${SLACK_META_INFO_URL}`
    });
    if (error) {
      dispatch(getSlackMetaInfoFailure());
    } else if (data && status === 200) {
      dispatch(getSlackMetaInfoSuccess(data.data));
    }
  };
};

export const getAllAlertRequest = () => {
  return {
    type: ALERTSREQUEST
  };
};

export const getAllAlertFailure = () => {
  return {
    type: ALERTSFAILURE
  };
};

export const getAllAlertSuccess = (response) => {
  return {
    type: ALERTSSUCCESS,
    data: response
  };
};

export const getAllAlerts = () => {
  return async (dispatch) => {
    dispatch(getAllAlertRequest());
    const { data, error, status } = await getRequest({
      url: ALERT_LIST_URL
    });
    if (error) {
      dispatch(getAllAlertFailure());
    } else if (data && status === 200) {
      dispatch(getAllAlertSuccess(data.data));
    }
  };
};

export const createKpiAlertRequest = () => {
  return {
    type: CREATEKPIALERTREQUEST
  };
};

export const createKpiAlertSuccess = (response) => {
  return {
    type: CREATEKPIALERTSUCCESS,
    data: response
  };
};

export const createKpiAlertFailure = () => {
  return {
    type: CREATEKPIALERTFAILURE
  };
};

export const createKpiAlert = (payload) => {
  return async (dispatch) => {
    dispatch(createKpiAlertRequest());
    const { data, error, status } = await postRequest({
      url: CREATE_KPI_ALERT_URL,
      data: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json'
      },
      noAuth: true
    });
    if (error) {
      dispatch(createKpiAlertFailure());
    } else if (data && status === 200) {
      dispatch(createKpiAlertSuccess(data));
    }
  };
};
