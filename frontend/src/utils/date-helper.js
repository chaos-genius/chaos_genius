import { DateTime } from 'luxon';
import { getLocalStorage } from './storage-helper';

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

export const formatDateTime = (
  date,
  asString = false,
  includeTime = false,
  includeTimezone = false
) => {
  if (date !== null && date !== undefined) {
    const timezone = getTimezone();
    const jsDate = new Date(date);
    const timezonedDate = DateTime.fromJSDate(jsDate, { zone: timezone });
    if (asString === true) {
      const datetimeFormat = `dd LLL yyyy${
        includeTime === true ? ' HH:mm' : ''
      }${includeTimezone === true ? ' ZZZZ' : ''}`;
      return timezonedDate.toFormat(datetimeFormat);
    } else {
      return timezonedDate;
    }
  }
  return '-';
};

export const getTimezone = () => {
  const globalSetting = getLocalStorage('GlobalSetting');
  if (globalSetting && globalSetting?.timezone) {
    return globalSetting.timezone;
  } else {
    return 'UTC';
  }
};
