import React from 'react';

const FORMAT_DATA_UTIL = {
  ratio: (ratio) => {
    ratio = ratio / 1000;
    let precision = 1;

    if (ratio < 10) {
      precision = 2;
    } else if (ratio < 100) {
      precision = 0;
    }

    return ratio.toFixed(precision);
  }
};

export default FORMAT_DATA_UTIL;
