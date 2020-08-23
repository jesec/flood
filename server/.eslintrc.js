module.exports = {
  env: {
    browser: 0,
    node: 1,
  },

  rules: {
    "no-restricted-imports": ["error", {
      "patterns": ["**/client/**/*"]
    }],
    "no-restricted-modules": ["error", {
      "patterns": ["**/client/**/*"]
    }],
  },
};
