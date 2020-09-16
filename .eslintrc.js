module.exports = {
  extends: ['airbnb', 'plugin:import/errors', 'plugin:import/warnings', 'prettier'],
  parser: 'babel-eslint',
  plugins: ['import'],
  rules: {
    'arrow-parens': 0,
    'class-methods-use-this': 0,
    'consistent-return': 0,
    'implicit-arrow-linebreak': 0,
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
    'import/no-extraneous-dependencies': 0,
    'import/prefer-default-export': 0,
    'max-len': [
      'error',
      {
        code: 120,
        ignoreRegExpLiterals: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreUrls: true,
      },
    ],
    'no-console': 0,
    'no-param-reassign': 0,
    'no-plusplus': 0,
    'no-underscore-dangle': [2, {allow: ['_id']}],
    'no-unused-vars': [0, {argsIgnorePattern: '^_'}],

    'object-curly-newline': 0,
    'object-curly-spacing': 0,
    'prefer-destructuring': [
      2,
      {
        array: false,
        object: true,
      },
      {
        enforceForRenamedProperties: false,
      },
    ],
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
