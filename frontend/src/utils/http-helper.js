import axios from 'axios';
import { env } from '../env';

//import { forceLogout } from './user-helper';
import { getCookie } from './cookie-helper';
import { checkBlackList } from './url-helper';

export const sendRequest = async (args) => {
  try {
    const { url, headers, noAuth } = args;
    let headerParams;
    if (noAuth) {
      if (headers) {
        headerParams = {
          ...headers,
          Authorization: `Bearer ${getCookie('token')}`
        };
      } else {
        headerParams = {
          Authorization: `Bearer ${getCookie('token')}`
        };
      }
    }
    const response = await axios({
      ...args,
      headers: headerParams,
      url: url
    });
    return response;
  } catch (error) {
    let status = error?.response?.status;
    // if (error.response !== undefined && error.response.status === 401) {
    //   forceLogout();
    // }
    // All Network Error we are sending status code 5XX
    if (!status) {
      status = 502;
    }
    return { error, status };
  }
};

export const getRequest = async (args) => {
  if (env.REACT_APP_IS_DEMO === 'true') {
    const isBlackListed = checkBlackList(args?.url);
    if (isBlackListed && args.customToast) {
      args.customToast({ type: 'failure', header: 'This is demo version' });
      return {
        data: null,
        error: true
      };
    }
  }
  const { data, headers, error, status } = await sendRequest({
    ...args,
    method: 'get'
  });
  if (status === 200) {
    return {
      data,
      error: null,
      headers,
      status
    };
  }
  return {
    data,
    error: error || data,
    status
  };
};

export const postRequest = async (args) => {
  if (env.REACT_APP_IS_DEMO === 'true') {
    const isBlackListed = checkBlackList(args?.url);
    if (isBlackListed && args.customToast) {
      args.customToast({ type: 'failure', header: 'This is demo version' });
      return {
        data: null,
        error: true
      };
    }
  }
  const { data, headers, error, status } = await sendRequest({
    ...args,
    method: 'post'
  });

  if ([200, 201, 204].indexOf(status) > -1) {
    return {
      data,
      error: null,
      headers,
      status
    };
  }
  return {
    data: null,
    error: error || data,
    status
  };
};

export const patchRequest = async (args) => {
  if (env.REACT_APP_IS_DEMO === 'true') {
    const isBlackListed = checkBlackList(args?.url);
    if (isBlackListed && args.customToast) {
      args.customToast({ type: 'failure', header: 'This is demo version' });
      return {
        data: null,
        error: true
      };
    }
  }
  const { data, headers, error, status } = await sendRequest({
    ...args,
    method: 'patch'
  });
  if ([200, 201, 204].indexOf(status) > -1) {
    return {
      data,
      error: null,
      headers,
      status
    };
  }
  return {
    data: null,
    error: error || data,
    status
  };
};

export const deleteRequest = async (args) => {
  if (env.REACT_APP_IS_DEMO === 'true') {
    const isBlackListed = checkBlackList(args?.url);
    if (isBlackListed && args.customToast) {
      args.customToast({ type: 'failure', header: 'This is demo version' });
      return {
        data: null,
        error: true
      };
    }
  }
  const { data, error, status, headers } = await sendRequest({
    ...args,
    method: 'delete'
  });
  if ([200, 201, 204].indexOf(status) > -1) {
    return {
      data,
      error: null,
      headers,
      status
    };
  }
  return {
    data: null,
    error: error || data,
    status
  };
};

export const putRequest = async (args) => {
  if (env.REACT_APP_IS_DEMO === 'true') {
    const isBlackListed = checkBlackList(args?.url);
    if (isBlackListed && args.customToast) {
      args.customToast({ type: 'failure', header: 'This is demo version' });
      return {
        data: null,
        error: true
      };
    }
  }
  const { data, error, status, headers } = await sendRequest({
    ...args,
    method: 'put'
  });
  if ([200, 201, 204].indexOf(status) > -1) {
    return {
      data,
      error: null,
      headers,
      status
    };
  }
  return {
    data: null,
    error: error || data,
    status
  };
};
