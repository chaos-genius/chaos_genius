// URL CONSTANTS

export const BASE_URL = 'https://chaosgenius.mayhemdata.com';

export const attachParams = (baseUrl, params) => {
  const url = new URL(baseUrl);
  url.search = new URLSearchParams(params).toString();
  return url;
};

export const DASHBOARD_URL = `${BASE_URL}/api/dashboard`;
export const KPI_URL = `${BASE_URL}/api/kpi`;
export const CONNECTION_URL = `${BASE_URL}/api/connection`;
export const CONNECTION_TYPE = `${BASE_URL}/api/connection/types`;
export const CREATE_DATASOURCE = `${BASE_URL}/api/connection/create`;
export const TEST_CONNECTION = `${BASE_URL}/api/connection/test`;
export const KPI_FORM_OPTION_URL = `${BASE_URL}/api/connection/metadata`;
export const DELETE_DATASOURCE = `${BASE_URL}/api/connection/delete`;
export const DASHBOARD_SIDEBAR_URL = `${BASE_URL}/api/kpi`;
//export const DASHBOARD_DIMENSION = `${BASE_URL}/api/kpi//get-dimensions`;
export const ONBOARDING_URL = `${BASE_URL}/api/config/onboarding-status`;
export const TEST_QUERY_URL = `${BASE_URL}/api/connection/metadata`;
