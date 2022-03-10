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
  RETRAINSUCCESS
} from '../actions/ActionConstants';

const initialState = {
  anomalyDetectionLoading: true,
  anomalyDetectionData: '',
  anomalyDetectionError: false,
  anomalyQualityData: '',
  anomalyQualityDataLoading: true,
  anomalyQualityDataError: false,
  anomalyDrilldownLoading: true,
  anomalyDrilldownData: '',
  anomalyDrilldownError: false,
  anomalySettingLoading: false,
  anomalySettingData: '',
  anomalySettingError: false,
  retrain: false
};

export const anomaly = (state = initialState, action) => {
  switch (action.type) {
    case ANOMALYDETECTIONREQUEST: {
      return {
        ...state,
        anomalyDetectionLoading: true,
        anomalyDetectionError: false
      };
    }
    case ANOMALYDETECTIONSUCCESS: {
      return {
        ...state,
        anomalyDetectionLoading: false,
        anomalyDetectionData: action.data
      };
    }
    case ANOMALYDETECTIONFAILURE: {
      return {
        ...state,
        anomalyDetectionError: true,
        anomalyDetectionLoading: false,
        anomalyDetectionData: []
      };
    }
    case ANOMALYDATAQUALITYREQUEST: {
      return {
        ...state,
        anomalyQualityDataLoading: true,
        anomalyQualityDataError: false
      };
    }
    case ANOMALYDATAQUALITYSUCCESS: {
      return {
        ...state,
        anomalyQualityData: action.data,
        anomalyQualityDataLoading: false
      };
    }
    case ANOMALYDATAQUALITYFAILURE: {
      return {
        ...state,
        anomalyQualityDataError: true,
        anomalyQualityDataLoading: false
      };
    }
    case ANOMALYDRILLDOWNREQUEST: {
      return {
        ...state,
        anomalyDrilldownLoading: true,
        anomalyDrilldownError: false
      };
    }
    case ANOMALYDRILLDOWNSUCCESS: {
      return {
        ...state,
        anomalyDrilldownLoading: false,
        anomalyDrilldownData: action.data
      };
    }
    case ANOMALYDRILLDOWNFAILURE: {
      return {
        ...state,
        anomalyDrilldownLoading: true,
        anomalyDrilldownError: false
      };
    }
    case ANOMALYSETTINGREQUEST: {
      return {
        ...state,
        anomalySettingLoading: true,
        anomalySettingError: false
      };
    }
    case ANOMALYSETTINGSUCCESS: {
      return {
        ...state,
        anomalySettingLoading: false,
        anomalySettingData: action.data
      };
    }
    case ANOMALYSETTINGFAILURE: {
      return {
        ...state,
        anomalySettingLoading: false,
        anomalySettingError: true,
        anomalySettingData: []
      };
    }
    case RETRAINREQUEST: {
      return {
        ...state,
        retrain: false
      };
    }
    case RETRAINSUCCESS: {
      return {
        ...state,
        retrain: true
      };
    }
    case RETRAINFAILURE: {
      return {
        ...state,
        retrain: false
      };
    }
    case 'RESET': {
      return {
        ...state,
        anomalyDrilldownData: '',
        anomalyQualityData: '',
        retrain: false
      };
    }
    case 'RESET_DRILL': {
      return {
        ...state,
        anomalyDrilldownData: '',
        anomalyDrilldownError: false
      };
    }
    case 'RESET_ANOMALY': {
      return {
        ...initialState
      };
    }

    default:
      return state;
  }
};
