module.exports = {
  capitalize: string => string.charAt(0).toUpperCase() + string.slice(1),

  pluralize: (string, count) => {
    if (count !== 1) {
      if (string.charAt(string.length - 1) === 'y') {
        return `${string.substring(0, string.length - 1)}ies`;
      }
      return `${string}s`;
    }

    return string;
  },

  withoutTrailingSlash: input => input.replace(/\/{1,}$/, ''),
};
