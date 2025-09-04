import babelParser from '@babel/eslint-parser';
import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import nodePlugin from 'eslint-plugin-n';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import typescriptEslint from 'typescript-eslint';

export default [
  // Global ignores
  {
    ignores: ['dist/**', 'dist-pkg/**', 'node_modules/**', 'coverage/**', '*.min.js', 'cypress/**', '**/*.d.ts'],
  },

  // Base JavaScript config
  js.configs.recommended,

  // TypeScript config for .ts/.tsx files - using regular recommended, not type-checked
  ...typescriptEslint.configs.recommended.map((config) => ({
    ...config,
    files: ['**/*.ts', '**/*.tsx'],
  })),

  // Prettier config (disables conflicting rules)
  prettierConfig,

  // Global config for all files
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2022,
      },
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint.plugin,
      'simple-import-sort': simpleImportSort,
      n: nodePlugin,
    },
    rules: {
      // Node.js specific
      'n/prefer-node-protocol': 'error',

      // Import sorting
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',

      // Allow underscore for database IDs
      'no-underscore-dangle': ['error', {allow: ['_id']}],

      // TypeScript specific
      '@typescript-eslint/no-unused-vars': ['error', {argsIgnorePattern: '^_'}],
      '@typescript-eslint/no-explicit-any': 'off', // Allow any for now
      '@typescript-eslint/no-non-null-assertion': 'off', // Allow ! operator
    },
  },

  // JavaScript files override
  {
    files: ['**/*.js', '**/*.jsx'],
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          babelrc: true,
        },
      },
    },
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-require-imports': 'off',
    },
  },

  // Client-specific config (React)
  {
    files: ['client/**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        global: 'writable',
        process: 'writable',
        window: 'writable',
        React: 'readonly',
        JSX: 'readonly',
        NodeJS: 'readonly',
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      // React recommended rules
      ...reactPlugin.configs.recommended.rules,
      ...reactPlugin.configs['jsx-runtime'].rules,
      ...reactHooksPlugin.configs.recommended.rules,

      // Turn off import sorting for client (was disabled for CRA parity)
      'simple-import-sort/imports': 'off',
      'simple-import-sort/exports': 'off',

      // React specific overrides
      'react/prop-types': 'off', // We use TypeScript
      'react/no-deprecated': 'off', // For CRA parity
      'react/display-name': 'off', // Allow anonymous components
      'react/no-unknown-property': ['error', {ignore: ['css']}], // Allow emotion css prop
    },
  },

  // Server-specific config
  {
    files: ['server/**/*.{js,ts}'],
    rules: {
      // Prevent importing client code in server
      'no-restricted-imports': [
        'error',
        {
          patterns: ['**/client/**/*'],
        },
      ],

      // Allow implicit return types in server code
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
  },

  // Scripts and config files
  {
    files: ['*.config.js', '*.config.mjs', 'scripts/**/*.js', 'client/scripts/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-require-imports': 'off',
    },
  },

  // Test files
  {
    files: [
      '**/*.test.js',
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/*.spec.js',
      '**/*.spec.ts',
      '**/*.spec.tsx',
      '**/.jest/*.js',
    ],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];
