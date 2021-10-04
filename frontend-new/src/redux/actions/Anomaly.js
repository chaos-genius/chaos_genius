import {
  attachParams,
  BASE_URL,
  SETTING_META_INFO_URL
} from '../../utils/url-helper';

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
  SETTING_META_INFO_REQUEST,
  SETTING_META_INFO_SUCCESS,
  SETTING_META_INFO_FAILURE
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
      dispatch(anomalySettingSuccess(data.data));
    }
  };
};

export const settingMetaInfoRequest = () => {
  return {
    type: SETTING_META_INFO_REQUEST
  };
};

export const settingMetaInfoSuccess = (response) => {
  return {
    type: SETTING_META_INFO_SUCCESS,
    data: response
  };
};

export const settingMetaInfoFailure = () => {
  return {
    type: SETTING_META_INFO_FAILURE
  };
};

export const settingMetaInfo = () => {
  return async (dispatch) => {
    dispatch(settingMetaInfoRequest());

    const { data, error, status } = await getRequest({
      url: SETTING_META_INFO_URL
    });
    if (error) {
      dispatch(settingMetaInfoFailure());
    } else if (data && status === 200) {
      dispatch(settingMetaInfoSuccess(data.data));
    }
  };
};
