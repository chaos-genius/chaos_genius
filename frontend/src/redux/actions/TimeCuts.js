import { getRequest } from '../../utils/http-helper';
import { TIME_CUTS_URL } from '../../utils/url-helper';
import {
  TIME_CUTS_REQUEST,
  TIME_CUTS_SUCCESS,
  TIME_CUTS_FALIURE
} from './ActionConstants';

export const getTimeCutsRequest = () => {
  return {
    type: TIME_CUTS_REQUEST
  };
};

export const getTimeCutsFailure = () => {
  return {
    type: TIME_CUTS_FALIURE
  };
};

export const getTimeCutsSuccess = (response) => {
  return {
    type: TIME_CUTS_SUCCESS,
    data: response
  };
};

export const getTimeCuts = () => {
  return async (dispatch) => {
    dispatch(getTimeCutsRequest());
    const { data, error, status } = await getRequest({
      url: TIME_CUTS_URL,
      headers: {
        'Content-Type': 'application/json'
      },
      noAuth: true
    });
    if (error) {
      dispatch(getTimeCutsFailure());
    } else if (data && status === 200) {
      dispatch(getTimeCutsSuccess(data.data));
    }
  };
};
