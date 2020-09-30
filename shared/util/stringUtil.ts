export default {
  withoutTrailingSlash: (input: string): string => input.replace(/\/{1,}$/, ''),
};
