const path = require('path');

module.exports = {
  extends: '../.eslintrc',
  env: {
    browser: 1,
    node: 0,
  },
  globals: {
    global: 'writable',
    process: 'writable',
    window: 'writable',
  },
  rules: {
    'import/no-extraneous-dependencies': 0,
    'no-restricted-imports': [
      'error',
      {
        patterns: ['**/config', '**/server/**/*'],
      },
    ],
    'no-restricted-modules': [
      'error',
      {
        patterns: ['**/server/**/*'],
      },
    ],
    // TODO: Enable a11y features
    'jsx-a11y/click-events-have-key-events': 0,
    'jsx-a11y/control-has-associated-label': 0,
    'jsx-a11y/label-has-associated-control': 0,
    'jsx-a11y/label-has-for': 0,
    'jsx-a11y/mouse-events-have-key-events': 0,
    'jsx-a11y/no-noninteractive-element-interactions': 0,
    'jsx-a11y/no-static-element-interactions': 0,
    'no-console': [2, {allow: ['warn', 'error']}],
    'react/destructuring-assignment': 0,
    'react/jsx-props-no-spreading': 0,
    'react/jsx-uses-react': 0,
    'react/react-in-jsx-scope': 0,
    'react/static-property-placement': [2, 'static public field'],
  },
  settings: {
    'import/resolver': {
      webpack: {
        config: path.join(__dirname, 'config/webpack.config.dev.js'),
      },
    },
  },
};
