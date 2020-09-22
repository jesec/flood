export default {
  capitalize: (string: string): string => string.charAt(0).toUpperCase() + string.slice(1),
  withoutTrailingSlash: (input: string): string => input.replace(/\/{1,}$/, ''),
};
