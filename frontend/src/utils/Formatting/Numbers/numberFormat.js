import { HRNumbers } from './humanReadableNumberFormatter';

export const convertNumberToHRN = (number) => {
  const num = Number(number);
  return typeof num === 'number' && isFinite(num)
    ? parseFloat(num) > 999 || parseFloat(num) < -999
      ? HRNumbers.toHumanString(num)
      : num
    : '-';
};
