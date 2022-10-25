import { attachParams, BASE_URL } from '../../utils/url-helper';
import { env } from '../../env';
import { getRequest } from '../../utils/http-helper';
import {
  ANOMALYDATAQUALITYFAILURE,
  ANOMALYDATAQUALITYREQUEST,
  ANOMALYDATAQUALITYSUCCESS,
  ANOMALYDETECTIONFAILURE,
  ANOMALYDETECTIONREQUEST,
  ANOMALYDETECTIONSUCCESS,
  ANOMALYDRILLDOWNREQUEST,
  ANOMALYDRILLDOWNSUCCESS,
  ANOMALYDRILLDOWNFAILURE,
  ANOMALYSETTINGREQUEST,
  ANOMALYSETTINGSUCCESS,
  ANOMALYSETTINGFAILURE,
  RETRAINFAILURE,
  RETRAINREQUEST,
  RETRAINSUCCESS,
  ANOMALYDOWNLOADREQUEST,
  ANOMALYDOWNLOADSUCCESS,
  ANOMALYDOWNLOADFAILURE
} from './ActionConstants';

export const anomalyDetectionRequest = () => {
  return {
    type: ANOMALYDETECTIONREQUEST
  };
};

export const anomalyDetectionSuccess = (response) => {
  return {
    type: ANOMALYDETECTIONSUCCESS,
    data: response
  };
};

export const anomalyDetectionFailure = () => {
  return {
    type: ANOMALYDETECTIONFAILURE
  };
};

export const anomalyDetection = (kpi, dimFilterObj) => {
  return async (dispatch) => {
    let URL =
      dimFilterObj &&
      dimFilterObj?.dimension &&
      dimFilterObj?.value !== undefined &&
      dimFilterObj?.value !== null
        ? `${BASE_URL}/api/anomaly-data/${kpi}/anomaly-detection?dimension=${dimFilterObj?.dimension}&value=${dimFilterObj?.value}`
        : `${BASE_URL}/api/anomaly-data/${kpi}/anomaly-detection`;
    dispatch(anomalyDetectionRequest());
    const { data, error, status } = await getRequest({
      url: URL
    });
    if (error) {
      dispatch(anomalyDetectionFailure());
    } else if (data && status === 200) {
      dispatch(anomalyDetectionSuccess(data));
    }
  };
};

export const retrainRequested = () => {
  return {
    type: RETRAINREQUEST
  };
};

export const retrainSuccess = (response) => {
  return {
    type: RETRAINSUCCESS,
    data: response
  };
};

export const retrainFailure = () => {
  return {
    type: RETRAINFAILURE
  };
};

export const setRetrain = (kpi, customToast) => {
  if (env.REACT_APP_IS_DEMO === 'true') {
    if (customToast) {
      customToast({
        type: 'error',
        header: 'This is a demo version'
      });
    }
    return {
      type: 'default'
    };
  } else {
    return async (dispatch) => {
      dispatch(retrainRequested());

      const { data, error, status } = await getRequest({
        url: `${BASE_URL}/api/anomaly-data/${kpi}/retrain`
      });
      if (error) {
        dispatch(retrainFailure());
      } else if (data && status === 200) {
        dispatch(retrainSuccess(data));
      }
    };
  }
};

export const anomalyQualityDataRequest = () => {
  return {
    type: ANOMALYDATAQUALITYREQUEST
  };
};

export const anomalyQualityDataSuccess = (response) => {
  return {
    type: ANOMALYDATAQUALITYSUCCESS,
    data: response
  };
};

export const anomalyQualityDataFailure = () => {
  return {
    type: ANOMALYDATAQUALITYFAILURE
  };
};

export const getAnomalyQualityData = (kpi, params) => {
  return async (dispatch) => {
    dispatch(anomalyQualityDataRequest());
    const URL = attachParams(
      `/api/anomaly-data/${kpi}/anomaly-data-quality`,
      params
    );
    const { data, error, status } = await getRequest({
      url: URL
    });
    if (error) {
      dispatch(anomalyQualityDataFailure());
    } else if (data && status === 200) {
      dispatch(anomalyQualityDataSuccess(data.data));
    }
  };
};

export const anomalyDrilldownRequest = () => {
  return {
    type: ANOMALYDRILLDOWNREQUEST
  };
};

export const anomalyDrilldownSuccess = (response) => {
  return {
    type: ANOMALYDRILLDOWNSUCCESS,
    data: response
  };
};

export const anomalyDrilldownFailure = () => {
  return {
    type: ANOMALYDRILLDOWNFAILURE
  };
};

export const anomalyDrilldown = (kpi, params) => {
  return async (dispatch) => {
    dispatch(anomalyDrilldownRequest());
    const URL = attachParams(
      `/api/anomaly-data/${kpi}/anomaly-drilldown`,
      params
    );
    const { data, error, status } = await getRequest({
      url: URL
    });
    if (error) {
      dispatch(anomalyDrilldownFailure());
    } else if (data && status === 200) {
      dispatch(anomalyDrilldownSuccess(data.data));
    }
  };
};

export const anomalySettingRequested = () => {
  return {
    type: ANOMALYSETTINGREQUEST
  };
};

export const anomalySettingSuccess = (response) => {
  return {
    type: ANOMALYSETTINGSUCCESS,
    data: response
  };
};

export const anomalySettingFailure = () => {
  return {
    type: ANOMALYSETTINGFAILURE
  };
};

export const anomalySetting = (id) => {
  return async (dispatch) => {
    dispatch(anomalySettingRequested());

    const { data, error, status } = await getRequest({
      url: `${BASE_URL}/api/anomaly-data/${id}/settings`
    });
    if (error) {
      dispatch(anomalySettingFailure());
    } else if (data && status === 200) {
      dispatch(anomalySettingSuccess(data));
    }
  };
};

export const anomalyDownloadRequest = () => {
  return {
    type: ANOMALYDOWNLOADREQUEST
  };
};

export const anomalyDownloadSuccess = (response) => {
  return {
    type: ANOMALYDOWNLOADSUCCESS,
    data: response
  };
};

export const anomalyDownloadFailure = () => {
  return {
    type: ANOMALYDOWNLOADFAILURE
  };
};

export const anomalyDownloadCsv = (id, params) => {
  return async (dispatch) => {
    dispatch(anomalyDownloadRequest());
    const url = `${BASE_URL}/api/downloads/${id}/anomaly_data`;
    const finalUrl =
      Object.keys(params).length === 0 && params.constructor === Object
        ? url
        : attachParams(url, params);
    const { data, error, status } = await getRequest({
      url: finalUrl
    });
    if (error) {
      dispatch(anomalyDownloadFailure());
    } else if (data && status === 200) {
      dispatch(anomalyDownloadSuccess(data));
    }
  };
};
