import HRNumbers from 'human-readable-numbers';

export const convertNumberToHRN = (number) => {
  return typeof number === 'number' && isFinite(number)
    ? parseFloat(number) > 999 || parseFloat(number) < -999
      ? HRNumbers.toHumanString(number)
      : number
    : '';
};
