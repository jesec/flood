'use strict';

module.exports = {
  capitalize: string => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  },

  pluralize: (string, count) => {
    if (count !== 1) {
      if (string.charAt(string.length - 1) === 'y') {
        return `${string.substring(0, string.length - 1)}ies`;
      } else {
        return `${string}s`;
      }
    }

    return string;
  },
};
