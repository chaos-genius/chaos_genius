export const downloadCsv = (data, filename) => {
  const url = window.URL.createObjectURL(new Blob([data]));
  const link = document.createElement('a');
  link.setAttribute('download', filename);
  link.href = url;
  link.click();
};
