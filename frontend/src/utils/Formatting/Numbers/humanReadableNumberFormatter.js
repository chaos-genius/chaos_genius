export const HRNumbers = {
  toHumanString: function (sn) {
    const n = this.precise(Number.parseFloat(sn));
    const e = Math.max(
      Math.min(3 * Math.floor(this.getExponent(n) / 3), 12),
      -9
    );
    return this.precise(n / Math.pow(10, e)).toString() + this.PREFIXES[e];
  },
  PREFIXES: {
    12: 'T',
    9: 'B',
    6: 'M',
    3: 'K',
    0: '',
    '-3': 'm',
    '-6': 'µ',
    '-9': 'n'
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
