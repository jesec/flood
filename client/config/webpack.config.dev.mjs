import path from 'node:path';
import {createRequire} from 'node:module';

import ESLintPlugin from 'eslint-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import WebpackBar from 'webpackbar';

import {buildPaths} from '../../shared/config/buildPaths.mjs';

const paths = buildPaths;
const require = createRequire(import.meta.url);

export default {
  mode: 'development',
  module: {
    rules: [
      {
        test: /(ts|js)x?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              babelrc: true,
              plugins: [require.resolve('react-refresh/babel')],
            },
          },
        ],
      },
      {
        test: /\.s?css$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              importLoaders: 2,
              sourceMap: true,
              modules: {
                mode: 'global',
                localIdentName: '[name]_[local]__[hash:base64:5]',
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
              sassOptions: {
                silenceDeprecations: ['mixed-decls'],
              },
            },
          },
        ],
      },
      {
        exclude: [/node_modules/],
        test: /.(ts|js)x?$/,
        use: ['source-map-loader'],
        enforce: 'pre',
      },
      {
        test: /\.md$/,
        loader: 'raw-loader',
      },
      {
        test: [/\.woff2$/],
        type: 'asset/resource',
      },
      {
        include: [/\.svg$/],
        issuer: /\.s?css$/,
        type: 'asset/resource',
      },
      {
        test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
        type: 'asset/resource',
      },
      {
        resourceQuery: /raw-lingui/,
        type: 'javascript/auto',
      },
    ],
  },
  entry: paths.appIndex,
  resolve: {
    extensions: ['.cjs', '.mjs', '.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      '@client': path.resolve('./client/src/javascript'),
      '@shared': path.resolve('./shared'),
    },
  },
  output: {
    pathinfo: true,
    filename: 'static/js/bundle.js',
    chunkFilename: 'static/js/[name].chunk.js',
    assetModuleFilename: 'static/media/[name].[hash:8].[ext]',
  },
  plugins: [
    new ESLintPlugin({
      extensions: ['js', 'jsx', 'ts', 'tsx'],
      emitWarning: true,
      threads: true,
      configType: 'flat',
      eslintPath: require.resolve('eslint'),
    }),
    new HtmlWebpackPlugin({
      inject: true,
      template: paths.appHtml,
    }),
    new ReactRefreshWebpackPlugin(),
    new CaseSensitivePathsPlugin(),
    new WebpackBar(),
  ],
  devtool: 'source-map',
  optimization: {
    moduleIds: 'named',
  },
};
