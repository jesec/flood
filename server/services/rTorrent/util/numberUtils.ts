const truncateTo = (num: number, precision = 0) => {
  const factor = 10 ** precision;
  return Math.round(num * factor) / factor;
};

export default truncateTo;
