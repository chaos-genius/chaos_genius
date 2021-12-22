export const getLocalStorage = (key) => {
  return JSON.parse(localStorage.getItem(key));
};

export const saveLocalStorage = (key, value) => {
  localStorage.setItem(key, value);
};
