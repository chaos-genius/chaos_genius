export const formatDate = (date) => {
  if (date !== null && date !== undefined) {
    const month = [
      'Jan',
      'Feb',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'Sep',
      'Oct',
      'Nov',
      'Dec'
    ];
    const newDate = new Date(date);
    const dateString =
      newDate.getDate() +
      '  ' +
      month[newDate.getMonth()] +
      '  ' +
      newDate.getFullYear();
    return dateString;
  }
  return '-';
};
