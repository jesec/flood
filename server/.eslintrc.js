module.exports = {
  extends: '../.eslintrc',

  env: {
    browser: 0,
    node: 1,
  },

  rules: {
    'import/no-extraneous-dependencies': ['error', {devDependencies: false}],
    'no-console': 0,
    'no-restricted-imports': [
      'error',
      {
        patterns: ['**/client/**/*'],
      },
    ],
    'no-restricted-modules': [
      'error',
      {
        patterns: ['**/client/**/*'],
      },
    ],
  },
};
