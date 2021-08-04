import {
  KPIEXPLORERREQUEST,
  KPIEXPLORERSUCCESS,
  KPIEXPLORERFAILURE,
  KPIEXPLORERFORMREQUEST,
  KPIEXPLORERFORMSUCCESS,
  KPIEXPLORERFORMFAILURE,
  KPIEXPLORERFIELDREQUEST,
  KPIEXPLORERFIELDSUCCESS,
  KPIEXPLORERFIELDFAILURE,
  KPIEXPLORERSUBMITREQUEST,
  KPIEXPLORERSUBMITSUCCESS,
  KPIEXPLORERSUBMITFAILURE
} from './ActionConstants';

import {
  KPI_URL,
  CONNECTION_URL,
  KPI_FORM_OPTION_URL
} from '../../utils/url-helper';

import { getRequest, postRequest } from '../../utils/http-helper';

export const getAllKpiExplorerRequested = () => {
  return {
    type: KPIEXPLORERREQUEST
  };
};

export const getAllKpiExplorerSuccess = (response) => {
  return {
    type: KPIEXPLORERSUCCESS,
    data: response
  };
};

export const getAllKpiExplorerFailure = () => {
  return {
    type: KPIEXPLORERFAILURE
  };
};

export const getAllKpiExplorer = () => {
  return async (dispatch) => {
    dispatch(getAllKpiExplorerRequested);
    const { data, error, status } = await getRequest({
      url: KPI_URL
    });
    if (error) {
      dispatch(getAllKpiExplorerFailure);
    } else if (data && status === 200) {
      dispatch(getAllKpiExplorerSuccess(data.data));
    }
  };
};

export const getAllKpiExplorerFormRequested = () => {
  return {
    type: KPIEXPLORERFORMREQUEST
  };
};

export const getAllKpiExplorerFormSuccess = (response) => {
  return {
    type: KPIEXPLORERFORMSUCCESS,
    data: response
  };
};

export const getAllKpiExplorerFormFailure = () => {
  return {
    type: KPIEXPLORERFORMFAILURE
  };
};

export const getAllKpiExplorerForm = () => {
  return async (dispatch) => {
    dispatch(getAllKpiExplorerFormRequested);
    const { data, error, status } = await getRequest({
      url: CONNECTION_URL
    });
    if (error) {
      dispatch(getAllKpiExplorerFormFailure);
    } else if (data && status === 200) {
      dispatch(getAllKpiExplorerFormSuccess(data.data));
    }
  };
};

export const getAllKpiExplorerFieldRequested = () => {
  return {
    type: KPIEXPLORERFIELDREQUEST
  };
};

export const getAllKpiExplorerFieldFailure = () => {
  return {
    type: KPIEXPLORERFIELDFAILURE
  };
};

export const getAllKpiExplorerFieldSuccess = (response) => {
  return {
    type: KPIEXPLORERFIELDSUCCESS,
    data: response
  };
};

export const getAllKpiExplorerField = (option) => {
  return async (dispatch) => {
    dispatch(getAllKpiExplorerFieldRequested);
    const { data, error, status } = await postRequest({
      url: KPI_FORM_OPTION_URL,
      data: option
    });
    if (error) {
      dispatch(getAllKpiExplorerFieldFailure);
    } else if (data && status === 200) {
      dispatch(getAllKpiExplorerFieldSuccess(data.data));
    }
  };
};

export const getAllKpiExplorerSubmitRequested = () => {
  return {
    type: KPIEXPLORERSUBMITREQUEST
  };
};

export const getAllKpiExplorerSubmitFailure = () => {
  return {
    type: KPIEXPLORERSUBMITFAILURE
  };
};

export const getAllKpiExplorerSubmitSuccess = (response) => {
  return {
    type: KPIEXPLORERSUBMITSUCCESS,
    data: response
  };
};

export const getAllKpiExplorerSubmit = (payload) => {
  return async (dispatch) => {
    dispatch(getAllKpiExplorerSubmitRequested);
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Access-Control-Allow-Origin', '*');
    headers.append('Access-Control-Allow-Credentials', true);
    const { data, error, status } = await postRequest({
      url: KPI_URL,
      data: JSON.stringify(payload),
      headers: headers
    });
    if (error) {
      dispatch(getAllKpiExplorerSubmitFailure);
    } else if (data && status === 200) {
      dispatch(getAllKpiExplorerSubmitSuccess(data));
    }
  };
};
