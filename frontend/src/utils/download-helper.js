import { getRequest } from './http-helper';

export const downloadCsv = async (id, downloadUrl) => {
  const { data, error, status } = await getRequest({
    url: downloadUrl
  });
  if (error) {
    console.log('here', error);
  } else if (data && status === 200) {
    return data;
  }
};
