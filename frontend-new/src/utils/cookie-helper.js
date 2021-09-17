import Cookie from 'js-cookie';

export const getCookie = (key) => {
  const storage = Cookie.get(key);
  return storage || '';
};

export const getJSONCookie = (key) => {
  const json = Cookie.getJSON(key);
  return json || {};
};

export const deleteCookie = (key) => {
  Cookie.remove(key);
  return getCookie(key) === '';
};

export const saveCookie = (key, value, options = {}) => {
  Cookie.set(key, value, options);
  return getCookie(key) !== '';
};
