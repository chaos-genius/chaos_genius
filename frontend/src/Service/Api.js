/*
 * @Author: Juzar Bhori
 * @Date: 2021-06-09 17:16:36
 * @Last Modified by: Juzar Bhori
 * @Last Modified time: 2021-06-09 17:16:36
 */

import axios from 'axios';

const handleErrorDefault = (error) => {
  // let history = useHistory();
  /**
   *   handleErrorDefault is the default function that should be
  */
  //  console.log('handleErrorDefault',error.response.data)
  if (error && error.response && error.response.status) {
    switch (error.response.status) {
      case 400:
        // Bad-request can be generic
        // console.log('error catch', error.response.status);
        return Promise.reject(error);
      // this.props.history.push('/400')
      // window.location.href="/sales/400/"

      // return Promise.reject(error);
      case 401:
        // Generic error
        // localStorage.clear();
        // localStorage.removeItem(BENEFIT_TOKEN);// clearing the session
        // redirects to the login page
        // window.location.href='/employee/login';
        return Promise.reject(error);

      case 404:
        // Generic error
        return Promise.reject(error);

      default:
        return Promise.reject(error);
    }
  } else {
    return Promise.reject(error);
  }
  // return Promise.reject(error)
}
// default handle success function
const handleSuccessDefault = (response) => {
  return response;
}
export default class Api {
  service;
  constructor(
    customHeaders = {},
    customParams = {},
    handleError = handleErrorDefault,
    handleSuccess = handleSuccessDefault,
  ) {
    const service = axios.create({
      headers: customHeaders,
      params: customParams,
    });
    service.interceptors.response.use(handleSuccess, handleError);
    this.service = service;
    // console.log('this._source', this.service);
  }
  get(path) {
    // console.log('store',store);
    return this.service.get(path);
  }
  delete(path, payload) {
    return this.service.request({
      method: 'DELETE',
      url: path,
      responseType: 'json',
      data: payload,
    });
  }
  patch(path, payload) {
    return this.service.request({
      method: 'PATCH',
      url: path,
      responseType: 'json',
      data: payload,
    });
  }
  put(path, payload) {
    return this.service.request({
      method: 'PUT',
      url: path,
      responseType: 'json',
      data: payload,
    });
  }
  post(path, bodyPayload = {}) {
    return this.service.request({
      method: 'POST',
      url: path,
      responseType: 'json',
      data: bodyPayload,
    });
  }
}
