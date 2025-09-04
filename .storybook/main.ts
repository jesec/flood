const path = require('path');
const webpack = require('webpack');

const config = {
  stories: ['../client/src/javascript/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@storybook/addon-onboarding', '@storybook/addon-webpack5-compiler-babel'],
  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },
  swc: () => ({
    jsc: {
      transform: {
        react: {
          runtime: 'automatic',
        },
      },
    },
  }),
  webpackFinal: async (config) => {
    // Use NormalModuleReplacementPlugin to forcefully replace action imports with mocks
    config.plugins = config.plugins || [];
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /@client\/actions\/FloodActions$/,
        path.resolve(__dirname, './mocks/FloodActions.ts'),
      ),
      new webpack.NormalModuleReplacementPlugin(
        /@client\/actions\/TorrentActions$/,
        path.resolve(__dirname, './mocks/TorrentActions.ts'),
      ),
      new webpack.NormalModuleReplacementPlugin(
        /@client\/actions\/SettingActions$/,
        path.resolve(__dirname, './mocks/SettingActions.ts'),
      ),
      new webpack.NormalModuleReplacementPlugin(
        /@client\/actions\/AuthActions$/,
        path.resolve(__dirname, './mocks/AuthActions.ts'),
      ),
      new webpack.NormalModuleReplacementPlugin(
        /@client\/actions\/ClientActions$/,
        path.resolve(__dirname, './mocks/ClientActions.ts'),
      ),
      new webpack.NormalModuleReplacementPlugin(
        /@client\/actions\/FeedActions$/,
        path.resolve(__dirname, './mocks/FeedActions.ts'),
      ),
    );

    // Add path aliases
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      // General aliases
      '@client': path.resolve(__dirname, '../client/src/javascript'),
      '@shared': path.resolve(__dirname, '../shared'),
    };

    // Add TypeScript support
    config.resolve.extensions = config.resolve.extensions || [];
    if (!config.resolve.extensions.includes('.ts')) {
      config.resolve.extensions.push('.ts', '.tsx');
    }

    // Handle SASS files
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];

    // Add TypeScript/Babel loader for tsx files
    config.module.rules.push({
      test: /\.(ts|tsx)$/,
      exclude: /node_modules/,
      use: [
        {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', ['@babel/preset-react', {runtime: 'automatic'}], '@babel/preset-typescript'],
            plugins: [
              ['@babel/plugin-proposal-decorators', {legacy: true}],
              ['@babel/plugin-transform-class-properties', {loose: true}],
            ],
          },
        },
      ],
    });

    // Add Lingui loader for i18n
    config.module.rules.push({
      test: /\.json$/,
      resourceQuery: /raw-lingui/,
      type: 'javascript/auto',
      loader: '@lingui/loader',
    });

    // Find and update existing CSS rules
    const cssRuleIndex = config.module.rules.findIndex((rule) => {
      if (typeof rule === 'object' && rule !== null && 'test' in rule) {
        return rule.test?.toString().includes('css');
      }
      return false;
    });

    if (cssRuleIndex !== -1) {
      // Replace existing CSS rule with PostCSS support for Panda CSS
      config.module.rules[cssRuleIndex] = {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: true,
              postcssOptions: {
                config: path.resolve(__dirname, '../postcss.config.cjs'),
              },
            },
          },
        ],
      };
    }

    // Add SASS support - handle both regular and module SASS files
    config.module.rules.push({
      test: /\.s[ac]ss$/,
      exclude: /\.module\.s[ac]ss$/,
      use: [
        'style-loader',
        {
          loader: 'css-loader',
          options: {
            importLoaders: 3, // Changed to 3 for postcss
            modules: false,
          },
        },
        {
          loader: 'postcss-loader',
          options: {
            sourceMap: true,
            postcssOptions: {
              config: path.resolve(__dirname, '../postcss.config.cjs'),
            },
          },
        },
        'sass-loader',
      ],
    });

    // Add SASS modules support - MUST match production webpack config!
    config.module.rules.push({
      test: /\.module\.s[ac]ss$/,
      use: [
        'style-loader',
        {
          loader: 'css-loader',
          options: {
            importLoaders: 3, // Changed to 3 for postcss
            sourceMap: true,
            modules: {
              mode: 'local', // local for CSS modules
              localIdentName: '[name]_[local]__[hash:base64:5]', // Match production pattern
              exportLocalsConvention: 'camelCase',
            },
          },
        },
        {
          loader: 'postcss-loader',
          options: {
            sourceMap: true,
          },
        },
        {
          loader: 'sass-loader',
          options: {
            sourceMap: true,
          },
        },
      ],
    });

    return config;
  },
};
module.exports = config;
