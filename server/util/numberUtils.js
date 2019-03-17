const truncateTo = (num, precision = 0) => {
  const factor = 10 ** precision;
  return Math.floor(num * factor) / factor;
};

module.exports = truncateTo;
