import {
  ALERT_EMAIL_URL,
  ALERT_LIST_URL,
  attachParams,
  BASE_URL,
  CHANNEL_CONFIGURATION_URL,
  CREATE_KPI_ALERT_URL,
  EDIT_CHANNEL_URL,
  EMAIL_META_INFO_URL,
  GET_KPI_ALERT_BY_ID_URL,
  KPI_ALERT_META_INFO_URL,
  SLACK_META_INFO_URL,
  UPDATE_KPI_ALERT_URL,
  ALERT_CHANNEL_FOR_FILTER,
  ALERT_STATUS_FOR_FILTER
} from '../../utils/url-helper';

import { getRequest, postRequest, putRequest } from '../../utils/http-helper';

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
  CREATEKPIALERTFAILURE,
  KPI_ALERT_META_INFO_REQUEST,
  KPI_ALERT_META_INFO_SUCCESS,
  KPI_ALERT_META_INFO_FAILURE,
  KPIALERTEDITREQUEST,
  KPIALERTEDITSUCCESS,
  KPIALERTEDITFAILURE,
  KPIALERTUPDATEREQUEST,
  KPIALERTUPDATESUCCESS,
  KPIALERTUPDATEFAILURE,
  KPIALERTDISABLEREQUEST,
  KPIALERTDISABLEFAILURE,
  KPIALERTDISABLESUCCESS,
  KPIALERTENABLERESPONSE,
  KPIALERTENABLEFAILURE,
  KPIALERTENABLEREQUEST,
  KPIALERTDELETEREQUEST,
  KPIALERTDELETERESPONSE,
  KPIALERTDELETEFAILURE,
  ALERTCHANNELFORFILTERSUCCESS,
  ALERTCHANNELFORFILTERFAILURE,
  ALERTSTATUSFORFILTERSUCCESS,
  ALERTSTATUSFORFILTERFAILURE
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

export const getAllAlerts = (pgInfo) => {
  return async (dispatch) => {
    dispatch(getAllAlertRequest());
    const url = attachParams(ALERT_LIST_URL, pgInfo);
    const { data, error, status } = await getRequest({
      url: url
    });
    if (error) {
      dispatch(getAllAlertFailure());
    } else if (data && status === 200) {
      dispatch(getAllAlertSuccess(data));
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

export const kpiAlertMetaInfoRequest = () => {
  return {
    type: KPI_ALERT_META_INFO_REQUEST
  };
};

export const kpiAlertMetaInfoSuccess = (response) => {
  return {
    type: KPI_ALERT_META_INFO_SUCCESS,
    data: response
  };
};

export const kpiAlertMetaInfoFailure = () => {
  return {
    type: KPI_ALERT_META_INFO_FAILURE
  };
};

export const kpiAlertMetaInfo = () => {
  return async (dispatch) => {
    dispatch(kpiAlertMetaInfoRequest());
    const { data, error, status } = await getRequest({
      url: `${KPI_ALERT_META_INFO_URL}`
    });
    if (error) {
      dispatch(kpiAlertMetaInfoFailure());
    } else if (data && status === 200) {
      dispatch(kpiAlertMetaInfoSuccess(data.data));
    }
  };
};

export const getKpiAlertByIdRequest = () => {
  return {
    type: KPIALERTEDITREQUEST
  };
};

export const getKpiAlertByIdSuccess = (response) => {
  return {
    type: KPIALERTEDITSUCCESS,
    data: response
  };
};

export const getKpiAlertByIdFailure = () => {
  return {
    type: KPIALERTEDITFAILURE
  };
};

export const getKpiAlertById = (id) => {
  return async (dispatch) => {
    dispatch(getKpiAlertByIdRequest());
    const { data, error, status } = await getRequest({
      url: `${GET_KPI_ALERT_BY_ID_URL}/${id}/get-info`
    });
    if (error) {
      dispatch(getKpiAlertByIdFailure());
    } else if (data && status === 200) {
      dispatch(getKpiAlertByIdSuccess(data.data));
    }
  };
};

export const updateKpiAlertRequest = () => {
  return {
    type: KPIALERTUPDATEREQUEST
  };
};

export const updateKpiAlertSuccess = (response) => {
  return {
    type: KPIALERTUPDATESUCCESS,
    data: response
  };
};

export const updateKpiAlertFailure = () => {
  return {
    type: KPIALERTUPDATEFAILURE
  };
};

export const updateKpiAlert = (id, payload) => {
  return async (dispatch) => {
    dispatch(updateKpiAlertRequest());
    const { data, error, status } = await putRequest({
      url: `${UPDATE_KPI_ALERT_URL}/${id}/update`,
      data: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json'
      },
      noAuth: true
    });
    if (error) {
      dispatch(updateKpiAlertFailure());
    } else if (data && status === 200) {
      dispatch(updateKpiAlertSuccess(data));
    }
  };
};

export const kpiAlertDisableRequest = () => {
  return {
    type: KPIALERTDISABLEREQUEST
  };
};

export const kpiAlertDisableSuccess = (response) => {
  return {
    type: KPIALERTDISABLESUCCESS,
    data: response
  };
};

export const kpiAlertDisableFailure = () => {
  return {
    type: KPIALERTDISABLEFAILURE
  };
};

export const kpiAlertDisable = (id) => {
  return async (dispatch) => {
    dispatch(kpiAlertDisableRequest());
    const { data, error, status } = await getRequest({
      url: `${BASE_URL}/api/alert/${id}/disable`
    });
    if (error) {
      dispatch(kpiAlertDisableFailure());
    } else if (data && status === 200) {
      dispatch(kpiAlertDisableSuccess(data));
    }
  };
};

export const kpiAlertEnableRequest = () => {
  return {
    type: KPIALERTENABLEREQUEST
  };
};

export const kpiAlertEnableFailure = () => {
  return {
    type: KPIALERTENABLEFAILURE
  };
};

export const kpiAlertEnableSuccess = (response) => {
  return {
    type: KPIALERTENABLERESPONSE,
    data: response
  };
};

export const kpiAlertEnable = (id) => {
  return async (dispatch) => {
    dispatch(kpiAlertEnableRequest());
    const { data, error, status } = await getRequest({
      url: `${BASE_URL}/api/alert/${id}/enable`
    });
    if (error) {
      dispatch(kpiAlertEnableFailure());
    } else if (data && status === 200) {
      dispatch(kpiAlertEnableSuccess(data));
    }
  };
};

export const kpiAlertDeleteRequest = () => {
  return {
    type: KPIALERTDELETEREQUEST
  };
};

export const kpiAlertDeleteFailure = () => {
  return {
    type: KPIALERTDELETEFAILURE
  };
};

export const kpiAlertDeleteSuccess = (response) => {
  return {
    type: KPIALERTDELETERESPONSE,
    data: response
  };
};

export const kpiAlertDeleteById = (id) => {
  return async (dispatch) => {
    dispatch(kpiAlertDeleteRequest());
    const { data, error, status } = await getRequest({
      url: `${BASE_URL}/api/alert/${id}/delete`
    });
    if (error) {
      dispatch(kpiAlertDeleteFailure());
    } else if (data && status === 200) {
      dispatch(kpiAlertDeleteSuccess(data));
    }
  };
};

export const alertChannelForFilterFailure = () => {
  return {
    type: ALERTCHANNELFORFILTERFAILURE
  };
};

export const alertChannelForFilterSuccess = (response) => {
  return {
    type: ALERTCHANNELFORFILTERSUCCESS,
    data: response.data
  };
};

export const getAlertChannelForFilter = () => {
  return async (dispatch) => {
    const { data, error, status } = await getRequest({
      url: ALERT_CHANNEL_FOR_FILTER
    });
    if (error) {
      dispatch(alertChannelForFilterFailure());
    } else if (data && status === 200) {
      dispatch(alertChannelForFilterSuccess(data));
    }
  };
};

export const alertStatusForFilterSuccess = (response) => {
  return {
    type: ALERTSTATUSFORFILTERSUCCESS,
    data: response.data
  };
};

export const alertStatusForFilterFailure = () => {
  return {
    type: ALERTSTATUSFORFILTERFAILURE
  };
};

export const getAlertStatusForFilter = () => {
  return async (dispatch) => {
    const { data, error, status } = await getRequest({
      url: ALERT_STATUS_FOR_FILTER
    });
    if (error) {
      dispatch(alertStatusForFilterFailure());
    } else if (data && status === 200) {
      dispatch(alertStatusForFilterSuccess(data));
    }
  };
};
