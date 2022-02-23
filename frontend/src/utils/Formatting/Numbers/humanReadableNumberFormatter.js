export const HRN_PREFIXES = [
  { number: 1e-9, suffix: 'n', identifier: '-9' },
  { number: 1e-6, suffix: 'µ', identifier: '-6' },
  { number: 1e-3, suffix: 'n', identifier: '-3' },
  { number: 1, suffix: '', identifier: '0' },
  { number: 1e3, suffix: 'K', identifier: '3' },
  { number: 1e6, suffix: 'M', identifier: '6' },
  { number: 1e9, suffix: 'B', identifier: '9' },
  { number: 1e12, suffix: 'T', identifier: '12' }
];
export const HRNumbers = {
  toHumanString: function (sn) {
    const n = this.precise(Number.parseFloat(sn));
    const e = Math.max(
      Math.min(3 * Math.floor(this.getExponent(n) / 3), 12),
      -9
    );
    return this.precise(n / Math.pow(10, e)).toString() + this.findPrefix(e);
  },
  findPrefix: function (identfier) {
    if (HRN_PREFIXES && HRN_PREFIXES.length) {
      return HRN_PREFIXES.find((pref) => {
        return +pref.identifier === +identfier;
      }).suffix;
    }
  },
  getExponent: function (n) {
    if (n === 0) {
      return 0;
    }
    return Math.floor(Math.log10(Math.abs(n)));
  },

  precise: function (n) {
    return Number.parseFloat(n.toPrecision(3));
  }
};
