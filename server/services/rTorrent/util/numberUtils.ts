const truncateTo = (num: number, precision = 0) => {
  const factor = 10 ** precision;
  return Math.floor(num * factor) / factor;
};

export default truncateTo;
