// URL CONSTANTS
import { env } from '../env';

export const BASE_URL = env.REACT_APP_BASE_URL || '';

export const attachParams = (relativeUrl, params) => {
  let baseUrl = BASE_URL;

  if (baseUrl === '') {
    baseUrl = window.location.origin;
  }
  const url = new URL(relativeUrl, baseUrl);
  url.search = new URLSearchParams(params).toString();
  return url;
};

export const DASHBOARD_URL = `${BASE_URL}/api/dashboard`;
export const KPI_URL = `${BASE_URL}/api/kpi`;
export const KPI_RELATIVE_URL = `/api/kpi`;
export const RCA_RELATIVE_URL = `/api/rca`;
export const CONNECTION_URL = `${BASE_URL}/api/connection`;
export const CONNECTION_TYPE = `${BASE_URL}/api/connection/types`;
export const CREATE_DATASOURCE = `${BASE_URL}/api/connection/create`;
export const TEST_CONNECTION = `${BASE_URL}/api/connection/test`;
export const KPI_FORM_OPTION_URL = `${BASE_URL}/api/connection/metadata`;
export const ADD_KPI_GET_AVAILABILITY = `${BASE_URL}/api/connection/get-availability`;
export const KPI_LIST_SCHEMA = `${BASE_URL}/api/connection/list-schema`;
export const KPI_TABLE_LIST_ON_SCHEMA = `${BASE_URL}/api/connection/get-table-list`;
export const KPI_TABLE_INFO_DATA = `${BASE_URL}/api/connection/table-info`;
export const DELETE_DATASOURCE = `${BASE_URL}/api/connection/delete`;
export const DASHBOARD_SIDEBAR_URL = `${BASE_URL}/api/kpi`;
//export const DASHBOARD_DIMENSION = `${BASE_URL}/api/kpi//get-dimensions`;
export const ONBOARDING_URL = `${BASE_URL}/api/config/onboarding-status`;
export const TEST_QUERY_URL = `${BASE_URL}/api/connection/metadata`;
export const ALERT_EMAIL_URL = `${BASE_URL}/api/config/set-config`;
export const CHANNEL_CONFIGURATION_URL = `${BASE_URL}/api/config/get-all-config`;
export const EDIT_CHANNEL_URL = `${BASE_URL}/api/config/get-config`;
export const DATASOURCE_META_INFO_URL = `${BASE_URL}/api/connection/meta-info`;
export const EMAIL_META_INFO_URL = `${BASE_URL}/api/config/get-meta-info/email`;
export const SLACK_META_INFO_URL = `${BASE_URL}/api/config/get-meta-info/slack`;
export const ALERT_LIST_URL = `${BASE_URL}/api/alert`;
export const CREATE_KPI_ALERT_URL = `${BASE_URL}/api/alert/add`;
export const UPDATE_KPI_ALERT_URL = `${BASE_URL}/api/alert`;
export const KPI_ALERT_META_INFO_URL = `${BASE_URL}/api/alert/meta-info`;
export const GET_KPI_ALERT_BY_ID_URL = `${BASE_URL}/api/alert`;
export const SETTING_META_INFO_URL = `${BASE_URL}/api/anomaly-data/anomaly-params/meta-info`;

export const DASHBOARD_LIST_URL = `${BASE_URL}/api/dashboard/list`;
export const DASHBOARD_CREATE_URL = `${BASE_URL}/api/dashboard/create`;
export const DASHBOARD_DELETE_URL = `/api/dashboard/delete`;
export const DASHBOARD_EDIT_URL = `/api/dashboard/get`;
export const DASHBOARD_UPDATE_URL = `${BASE_URL}/api/dashboard/edit`;
export const ORGANIZATION_UPDATE_URL = `${BASE_URL}/api/config/update`;
export const GLOBAL_SETTING_URL = `${BASE_URL}/api/config/global-config`;
export const TASK_MANAGER_API_STATUS_URL = `${BASE_URL}/api/status`;

export const TIME_CUTS_URL = `${BASE_URL}/api/kpi/get-timecuts-list`;
export const VERSION_SETTING_URL = `${BASE_URL}/api/meta/version`;
export const METADATA_PREFETCH_URL = `${BASE_URL}/api/connection/trigger-metadata-prefetch`;
export const TIMEZONE_URL = `${BASE_URL}/api/meta/supported-timezones`;
