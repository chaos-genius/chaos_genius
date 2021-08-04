import { getRequest } from '../utils/http-helper';
import { CONNECTION_URL } from '../utils/url-helper';
export const getDataSource = () => {
  return getRequest({
    url: CONNECTION_URL
  });
};
