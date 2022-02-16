import {
  ALERTEMAILREQUEST,
  ALERTEMAILSUCCESS,
  ALERTEMAILFAILURE,
  CHANNELSTATUSREQUEST,
  CHANNELSTATUSSUCCESS,
  CHANNERSTATUSFAILURE,
  EDITCHANNELREQUEST,
  EDITCHANNELSUCCESS,
  EDITCHANNELFAILURE,
  EMAIL_META_INFO_REQUEST,
  EMAIL_META_INFO_SUCCESS,
  EMAIL_META_INFO_FAILURE,
  SLACK_META_INFO_REQUEST,
  SLACK_META_INFO_SUCCESS,
  SLACK_META_INFO_FAILURE,
  ALERTSREQUEST,
  ALERTSSUCCESS,
  ALERTSFAILURE,
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
  KPIALERTDISABLESUCCESS,
  KPIALERTDISABLEFAILURE,
  KPIALERTENABLEREQUEST,
  KPIALERTENABLERESPONSE,
  KPIALERTENABLEFAILURE,
  KPIALERTDELETEREQUEST,
  KPIALERTDELETERESPONSE,
  KPIALERTDELETEFAILURE
} from '../actions/ActionConstants';

const initialState = {
  changingAlert: undefined,
  emailLoading: false,
  emailData: [],
  emailError: false,
  channelStatusLoading: true,
  channelStatusData: [],
  channelStatusError: false,
  editData: [],
  editLoading: false,
  editError: false,
  slackMetaInfoLoading: false,
  slackMetaInfoData: [],
  slackMetaInfoError: false,
  emailMetaInfoLoading: false,
  emailMetaInfoData: [],
  emailMetaInfoError: false,
  alertList: '',
  alertLoading: true,
  alertError: false,
  createKpiAlertData: [],
  createKpiAlertLoading: false,
  createKpiAlertError: false,
  kpiAlertMetaInfoData: [],
  kpiAlertMetaInfoLoading: false,
  kpiAlertMetaInfoError: false,
  kpiAlertEditData: [],
  kpiAlertEditLoading: false,
  kpiAlertEditError: false,
  updateKpiAlertData: [],
  updateKpiAlertLoading: false,
  updateKpiAlertError: false,
  kpiAlertDisableLoading: false,
  kpiAlertDisableData: [],
  kpiAlertDisableError: false,
  kpiAlertEnableLoading: false,
  kpiAlertEnableData: [],
  kpiAlertEnableError: false,
  kpiAlertDeleteLoading: false,
  kpiAlertDeleteData: [],
  kpiAlertDeleteError: false
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
    case EMAIL_META_INFO_REQUEST: {
      return {
        ...state,
        emailMetaInfoLoading: true
      };
    }
    case EMAIL_META_INFO_SUCCESS: {
      return {
        ...state,
        emailMetaInfoLoading: false,
        emailMetaInfoData: action.data
      };
    }
    case EMAIL_META_INFO_FAILURE: {
      return {
        ...state,
        emailMetaInfoLoading: false,
        emailMetaInfoError: true
      };
    }
    case SLACK_META_INFO_REQUEST: {
      return {
        ...state,
        slackMetaInfoLoading: true
      };
    }
    case SLACK_META_INFO_SUCCESS: {
      return {
        ...state,
        slackMetaInfoLoading: false,
        slackMetaInfoData: action.data
      };
    }
    case SLACK_META_INFO_FAILURE: {
      return {
        ...state,
        slackMetaInfoLoading: false,
        slackMetaInfoError: true
      };
    }
    case ALERTSREQUEST: {
      return {
        ...state,
        alertLoading: true
      };
    }
    case ALERTSSUCCESS: {
      return {
        ...state,
        alertLoading: false,
        alertList: action.data
      };
    }
    case ALERTSFAILURE: {
      return {
        ...state,
        alertLoading: false,
        alertList: [],
        alertError: true
      };
    }
    case CREATEKPIALERTREQUEST: {
      return {
        ...state,
        createKpiAlertLoading: true
      };
    }
    case CREATEKPIALERTSUCCESS: {
      return {
        ...state,
        createKpiAlertData: action.data,
        createKpiAlertLoading: false
      };
    }
    case CREATEKPIALERTFAILURE: {
      return {
        ...state,
        createKpiAlertLoading: false,
        createKpiAlertError: true
      };
    }
    case KPI_ALERT_META_INFO_REQUEST: {
      return {
        ...state,
        kpiAlertMetaInfoLoading: true
      };
    }
    case KPI_ALERT_META_INFO_SUCCESS: {
      return {
        ...state,
        kpiAlertMetaInfoLoading: false,
        kpiAlertMetaInfoData: action.data
      };
    }
    case KPI_ALERT_META_INFO_FAILURE: {
      return {
        ...state,
        kpiAlertMetaInfoLoading: false,
        kpiAlertMetaInfoError: true
      };
    }
    case KPIALERTEDITREQUEST: {
      return {
        ...state,
        kpiAlertEditLoading: true
      };
    }
    case KPIALERTEDITSUCCESS: {
      return {
        ...state,
        kpiAlertEditLoading: false,
        kpiAlertEditData: action.data
      };
    }
    case KPIALERTEDITFAILURE: {
      return {
        ...state,
        kpiAlertEditLoading: false,
        kpiAlertEditError: true
      };
    }
    case KPIALERTUPDATEREQUEST: {
      return {
        ...state,
        updateKpiAlertLoading: true
      };
    }
    case KPIALERTUPDATESUCCESS: {
      return {
        ...state,
        updateKpiAlertLoading: false,
        updateKpiAlertData: action.data
      };
    }
    case KPIALERTUPDATEFAILURE: {
      return {
        ...state,
        updateKpiAlertLoading: false,
        updateKpiAlertError: false
      };
    }
    case KPIALERTDISABLEREQUEST: {
      return {
        ...state,
        kpiAlertDisableLoading: true
      };
    }
    case KPIALERTDISABLESUCCESS: {
      return {
        ...state,
        kpiAlertDisableLoading: false,
        kpiAlertDisableData: action.data
      };
    }
    case KPIALERTDISABLEFAILURE: {
      return {
        ...state,
        kpiAlertDisableLoading: false,
        kpiAlertDisableError: true
      };
    }
    case KPIALERTENABLEREQUEST: {
      return {
        ...state,
        kpiAlertEnableLoading: true,
        kpiAlertEnableError: false
      };
    }
    case KPIALERTENABLERESPONSE: {
      return {
        ...state,
        kpiAlertEnableLoading: false,
        kpiAlertEnableData: action.data,
        kpiAlertEnableError: false
      };
    }
    case KPIALERTENABLEFAILURE: {
      return {
        kpiAlertEnableLoading: false,
        kpiAlertEnableError: true
      };
    }
    case KPIALERTDELETEREQUEST: {
      return {
        kpiAlertDeleteLoading: true,
        kpiAlertDeleteError: false
      };
    }
    case KPIALERTDELETERESPONSE: {
      return {
        ...state,
        kpiAlertDeleteLoading: false,
        kpiAlertDeleteData: action.data,
        kpiAlertEnableError: false
      };
    }
    case KPIALERTDELETEFAILURE: {
      return {
        kpiAlertDeleteLoading: false,
        kpiAlertDeleteError: true
      };
    }
    case 'RESET_EMAIL_DATA': {
      return {
        ...state,
        emailData: [],
        editData: [],
        kpiAlertEditData: [],
        updateKpiAlertData: [],
        kpiAlertDisableData: []
      };
    }
    case 'RESET_ALERT_DATA_Data': {
      return {
        ...state,
        createKpiAlertData: [],
        kpiAlertEditData: [],
        updateKpiAlertData: [],
        kpiAlertDisableData: []
      };
    }
    case 'RESET_ENABLE_DISABLE_DATA': {
      return {
        ...state,
        kpiAlertEnableData: [],
        kpiAlertDisableData: []
      };
    }

    case 'RESET_DELETE_DATA': {
      return {
        ...state,
        kpiAlertDeleteData: []
      };
    }

    case 'CHANGING_ALERT': {
      return { ...state, changingAlert: action.data };
    }
    case 'RESET_CHANGING_ALERT': {
      return {
        ...state,
        changingAlert: undefined
      };
    }
    default:
      return state;
  }
};
