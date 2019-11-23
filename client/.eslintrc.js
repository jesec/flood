const path = require('path');

module.exports = {
  parser: 'babel-eslint',
  extends: ['plugin:@typescript-eslint/recommended', 'prettier', 'prettier/@typescript-eslint'],
  env: {
    browser: 1,
    node: 0,
  },
  globals: {
    global: 'writable',
    process: 'writable',
    window: 'writable',
  },
  plugins: ['import'],
  rules: {
    '@typescript-eslint/no-var-requires': 0,
    // This is enabled to allow BEM-style classnames to be referenced JS
    // Remvoe when BEM-style classnames are converted to locally-scoped
    // class names
    '@typescript-eslint/camelcase': ['error', {allow: [/[^\s]__[^\s]{1,}$/]}],
    camelcase: 0,
    // TODO: Enable a11y features
    'jsx-a11y/click-events-have-key-events': 0,
    'jsx-a11y/label-has-associated-control': 0,
    'jsx-a11y/label-has-for': 0,
    'jsx-a11y/mouse-events-have-key-events': 0,
    'jsx-a11y/no-noninteractive-element-interactions': 0,
    'jsx-a11y/no-static-element-interactions': 0,
    'no-console': [2, {allow: ['warn', 'error']}],
    'react/button-has-type': 0,
    'react/default-props-match-prop-types': 0,
    'react/destructuring-assignment': 0,
    'react/forbid-prop-types': 0,
    'react/jsx-closing-bracket-location': 0,
    'react/jsx-filename-extension': [1, {extensions: ['.js', '.tsx']}],
    'react/jsx-one-expression-per-line': 0,
    'react/jsx-wrap-multilines': 0,
    'react/no-unescaped-entities': ['error', {forbid: ['>', '}']}],
    'react/no-unused-prop-types': 0,
    'react/prefer-stateless-function': 0,
    'react/prop-types': 0,
    'react/require-default-props': 0,
    'react/sort-comp': [
      2,
      {
        order: ['static-methods', 'instance-variables', 'lifecycle', 'everything-else', 'rendering'],
        groups: {
          rendering: ['/^render.+$/', 'render'],
        },
      },
    ],
  },
  settings: {
    'import/resolver': {
      webpack: {
        config: path.join(__dirname, 'config/webpack.config.dev.js'),
      },
    },
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx', '**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      plugins: ['import', '@typescript-eslint/eslint-plugin'],
      rules: {
        'no-unused-vars': 0,
        '@typescript-eslint/no-unused-vars': 1,
      },
    },
  ],
};
