import { attachParams, BASE_URL } from '../../utils/url-helper';

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
  ANOMALYDRILLDOWNFAILURE
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

export const anomalyDetection = (kpi) => {
  return async (dispatch) => {
    dispatch(anomalyDetectionRequest());
    const URL = `${BASE_URL}/api/anomaly-data/${kpi}/anomaly-detection`;
    const { data, error, status } = await getRequest({
      url: URL
    });
    if (error) {
      dispatch(anomalyDetectionFailure());
    } else if (data && status === 200) {
      dispatch(anomalyDetectionSuccess(data.data));
    }
  };
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
      `${BASE_URL}/api/anomaly-data/${kpi}/anomaly-data-quality`,
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
  console.log('Params:', params, kpi);
  return async (dispatch) => {
    dispatch(anomalyDrilldownRequest());
    const URL = attachParams(
      `${BASE_URL}/api/anomaly-data/${kpi}/anomaly-drilldown`,
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
